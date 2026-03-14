/**
 * GitHub Action Regenerate Endpoint
 *
 * POST /api/action/regenerate
 * Called by the Codec8 GitHub Action to regenerate docs on push.
 *
 * Auth: X-Codec8-Token header (user's GitHub token) + user_id in body
 * Body: { user_id: string, repo_full_name: string, types?: DocType[] }
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabaseAdmin } from '$lib/server/supabase';
import { fetchRepoContext } from '$lib/utils/parser';
import { generateMultipleDocs } from '$lib/server/claude';
import { trackEvent, EVENTS } from '$lib/server/analytics';
import { canGenerateForRepo, incrementUsage } from '$lib/server/usage';
import type { DocType } from '$lib/utils/prompts';

const VALID_TYPES: DocType[] = ['readme', 'api', 'architecture', 'setup'];

export const POST: RequestHandler = async ({ request }) => {
	// Verify token from header
	const token = request.headers.get('X-Codec8-Token');
	if (!token) {
		throw error(401, 'Missing X-Codec8-Token header');
	}

	const body = await request.json();
	const { user_id, repo_full_name, types } = body as {
		user_id: string;
		repo_full_name: string;
		types?: DocType[];
	};

	if (!user_id || !repo_full_name) {
		throw error(400, 'Missing user_id or repo_full_name');
	}

	// Verify token matches this user's GitHub token
	const { data: profile, error: profileError } = await supabaseAdmin
		.from('profiles')
		.select('github_token, plan, subscription_status, subscription_tier, trial_ends_at, subscription_ends_at, default_team_id')
		.eq('id', user_id)
		.eq('github_token', token)
		.single();

	if (profileError || !profile) {
		throw error(401, 'Invalid token or user_id');
	}

	// Check subscription validity
	if (profile.subscription_ends_at && new Date(profile.subscription_ends_at) < new Date()) {
		throw error(403, 'Subscription has ended. Please renew at codec8.com');
	}

	const isTrialExpired =
		profile.subscription_status === 'trialing' &&
		profile.trial_ends_at &&
		new Date(profile.trial_ends_at) < new Date();

	if (isTrialExpired) {
		throw error(403, 'Trial has expired. Please subscribe at codec8.com');
	}

	const hasValidTrial =
		profile.subscription_status === 'trialing' &&
		profile.trial_ends_at &&
		new Date(profile.trial_ends_at) > new Date();

	const hasPaidAccess =
		profile.subscription_status === 'active' ||
		hasValidTrial ||
		['ltd', 'pro', 'dfy'].includes(profile.plan || '');

	// Resolve doc types — default to all for paid, readme-only for free
	const requestedTypes: DocType[] = types?.filter((t) => VALID_TYPES.includes(t)) ?? VALID_TYPES;
	const docTypes: DocType[] = hasPaidAccess ? requestedTypes : ['readme'];

	// Fetch the repository
	const { data: repo, error: repoError } = await supabaseAdmin
		.from('repositories')
		.select('*')
		.eq('full_name', repo_full_name)
		.eq('user_id', user_id)
		.single();

	if (repoError || !repo) {
		throw error(404, `Repository ${repo_full_name} not found. Connect it at codec8.com/dashboard first.`);
	}

	// Check access control
	const canGenerate = await canGenerateForRepo(user_id, repo_full_name);
	if (!canGenerate.allowed) {
		throw error(403, canGenerate.reason || 'Access denied');
	}

	try {
		// Fetch repo context from GitHub
		const context = await fetchRepoContext(
			token,
			repo.full_name,
			repo.description,
			repo.language,
			repo.default_branch
		);

		// Generate docs with Claude
		const results = await generateMultipleDocs(context, docTypes);

		const savedDocs = [];
		const errors = [];

		for (const result of results) {
			if (result.success) {
				const { data: existingDoc } = await supabaseAdmin
					.from('documentation')
					.select('id, version')
					.eq('repo_id', repo.id)
					.eq('type', result.type)
					.single();

				if (existingDoc) {
					const { data: updated, error: updateError } = await supabaseAdmin
						.from('documentation')
						.update({
							content: result.content,
							version: existingDoc.version + 1,
							generated_at: new Date().toISOString()
						})
						.eq('id', existingDoc.id)
						.select()
						.single();

					if (updateError) {
						errors.push({ type: result.type, error: 'Failed to save' });
					} else {
						savedDocs.push(updated);
					}
				} else {
					const { data: inserted, error: insertError } = await supabaseAdmin
						.from('documentation')
						.insert({
							repo_id: repo.id,
							type: result.type,
							content: result.content,
							version: 1,
							generated_at: new Date().toISOString()
						})
						.select()
						.single();

					if (insertError) {
						errors.push({ type: result.type, error: 'Failed to save' });
					} else {
						savedDocs.push(inserted);
					}
				}
			} else {
				errors.push({ type: result.type, error: result.error || 'Generation failed' });
			}
		}

		// Update repo last_synced
		await supabaseAdmin
			.from('repositories')
			.update({ last_synced: new Date().toISOString() })
			.eq('id', repo.id);

		// Track analytics
		if (savedDocs.length > 0) {
			await trackEvent(EVENTS.DOC_GENERATED, {
				repo_id: repo.id,
				repo_name: repo.full_name,
				doc_types: savedDocs.map((d) => d.type).join(','),
				doc_count: savedDocs.length,
				source: 'github_action'
			}, user_id);

			try {
				await incrementUsage(user_id);
			} catch {
				// Don't fail if usage tracking fails
			}
		}

		return json({
			success: true,
			docs_generated: savedDocs.length,
			types: savedDocs.map((d) => d.type),
			errors: errors.length > 0 ? errors : undefined
		});
	} catch (err) {
		console.error('[Action] Generation error:', err);
		throw error(500, err instanceof Error ? err.message : 'Failed to generate documentation');
	}
};
