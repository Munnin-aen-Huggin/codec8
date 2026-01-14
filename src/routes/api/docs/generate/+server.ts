/**
 * Documentation Generation Endpoint
 *
 * POST /api/docs/generate
 * Generates documentation for a connected repository using Claude AI.
 *
 * Body: { repoId: string, types: ('readme' | 'api' | 'architecture' | 'setup')[] }
 * Returns: { docs: Documentation[], errors: { type: string, error: string }[] }
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabaseAdmin } from '$lib/server/supabase';
import { fetchRepoContext } from '$lib/utils/parser';
import { generateMultipleDocs } from '$lib/server/claude';
import { trackDocsGenerated } from '$lib/utils/analytics';
import { trackEvent, EVENTS } from '$lib/server/analytics';
import { canGenerateForRepo, incrementUsage, logUsage } from '$lib/server/usage';
import type { DocType } from '$lib/utils/prompts';

export const POST: RequestHandler = async ({ cookies, request }) => {
	// Verify authentication
	const session = cookies.get('session');
	if (!session) {
		throw error(401, 'Unauthorized');
	}

	let userId: string;
	try {
		const parsed = JSON.parse(session);
		userId = parsed.userId;
	} catch {
		throw error(401, 'Invalid session');
	}

	if (!userId) {
		throw error(401, 'Invalid session');
	}

	// Parse request body
	const body = await request.json();
	const { repoId, types } = body as { repoId: string; types: DocType[] };

	if (!repoId) {
		throw error(400, 'Missing repoId');
	}

	if (!types || !Array.isArray(types) || types.length === 0) {
		throw error(400, 'Missing or invalid types array');
	}

	// Validate doc types
	const validTypes: DocType[] = ['readme', 'api', 'architecture', 'setup'];
	for (const type of types) {
		if (!validTypes.includes(type)) {
			throw error(400, `Invalid documentation type: ${type}`);
		}
	}

	// Fetch the repository (verify ownership)
	const { data: repo, error: repoError } = await supabaseAdmin
		.from('repositories')
		.select('*')
		.eq('id', repoId)
		.eq('user_id', userId)
		.single();

	if (repoError || !repo) {
		console.error('Repository fetch error:', repoError);
		throw error(404, 'Repository not found');
	}

	// Fetch user profile to get GitHub token and subscription info
	const { data: profile, error: profileError } = await supabaseAdmin
		.from('profiles')
		.select('github_token, plan, subscription_status, subscription_tier, trial_ends_at, subscription_ends_at, default_team_id')
		.eq('id', userId)
		.single();

	if (profileError || !profile?.github_token) {
		console.error('Profile fetch error:', profileError);
		throw error(500, 'GitHub token not found. Please reconnect your GitHub account.');
	}

	// Check if subscription has ended (canceled)
	if (profile.subscription_ends_at && new Date(profile.subscription_ends_at) < new Date()) {
		throw error(403, 'Your subscription has ended. Please renew to continue generating documentation.');
	}

	// Check if trial has expired
	const isTrialExpired =
		profile.subscription_status === 'trialing' &&
		profile.trial_ends_at &&
		new Date(profile.trial_ends_at) < new Date();

	if (isTrialExpired) {
		throw error(403, 'Your trial has expired. Please subscribe to continue generating documentation.');
	}

	// Check if user has paid access (active subscription, valid trial, or legacy plan)
	const hasValidTrial =
		profile.subscription_status === 'trialing' &&
		profile.trial_ends_at &&
		new Date(profile.trial_ends_at) > new Date();

	const hasPaidAccess =
		profile.subscription_status === 'active' ||
		hasValidTrial ||
		['ltd', 'pro', 'dfy'].includes(profile.plan || '');

	// Check if user has purchased this specific repo
	const repoUrl = repo.full_name; // e.g., "owner/repo"
	const { data: purchasedRepo } = await supabaseAdmin
		.from('purchased_repos')
		.select('id')
		.eq('user_id', userId)
		.eq('repo_url', repoUrl)
		.single();

	const hasPurchasedThisRepo = !!purchasedRepo;

	// Free users can only generate README
	if (!hasPaidAccess && !hasPurchasedThisRepo) {
		const nonReadmeTypes = types.filter((t: DocType) => t !== 'readme');
		if (nonReadmeTypes.length > 0) {
			console.log(`[Access Control] Free user ${userId} tried to generate: ${nonReadmeTypes.join(', ')}`);
			throw error(403, 'Free users can only generate README documentation. Purchase this repository or subscribe to Pro/Team for full documentation.');
		}
	}

	// Check access control - can this user generate docs for this repo?
	const canGenerate = await canGenerateForRepo(userId, repoUrl);

	if (!canGenerate.allowed) {
		console.log(`[Access Control] User ${userId} denied: ${canGenerate.reason}`);
		throw error(403, canGenerate.reason || 'You do not have access to generate documentation for this repository. Please upgrade your plan.');
	}

	const startTime = Date.now();

	try {
		// Fetch repository context from GitHub
		console.log(`Fetching context for ${repo.full_name}...`);
		const context = await fetchRepoContext(
			profile.github_token,
			repo.full_name,
			repo.description,
			repo.language,
			repo.default_branch
		);

		// Generate documentation using Claude
		console.log(`Generating documentation for types: ${types.join(', ')}...`);
		const results = await generateMultipleDocs(context, types);

		// Process results and save to database
		const savedDocs = [];
		const errors = [];

		for (const result of results) {
			if (result.success) {
				// Check if doc already exists
				const { data: existingDoc } = await supabaseAdmin
					.from('documentation')
					.select('id, version')
					.eq('repo_id', repoId)
					.eq('type', result.type)
					.single();

				if (existingDoc) {
					// Update existing doc
					const { data: updatedDoc, error: updateError } = await supabaseAdmin
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
						console.error(`Failed to update ${result.type} doc:`, updateError);
						errors.push({ type: result.type, error: 'Failed to save documentation' });
					} else {
						savedDocs.push(updatedDoc);
					}
				} else {
					// Create new doc
					const { data: newDoc, error: insertError } = await supabaseAdmin
						.from('documentation')
						.insert({
							repo_id: repoId,
							type: result.type,
							content: result.content,
							version: 1,
							generated_at: new Date().toISOString()
						})
						.select()
						.single();

					if (insertError) {
						console.error(`Failed to insert ${result.type} doc:`, insertError);
						errors.push({ type: result.type, error: 'Failed to save documentation' });
					} else {
						savedDocs.push(newDoc);
					}
				}
			} else {
				errors.push({ type: result.type, error: result.error || 'Generation failed' });
			}
		}

		// Update repository last_synced
		await supabaseAdmin
			.from('repositories')
			.update({ last_synced: new Date().toISOString() })
			.eq('id', repoId);

		// Track analytics event for successful generations
		if (savedDocs.length > 0) {
			trackDocsGenerated(userId, repoId, savedDocs.map(d => d.type));
			// Also track with server-side analytics
			await trackEvent(EVENTS.DOC_GENERATED, {
				repo_id: repoId,
				repo_name: repo.full_name,
				doc_types: savedDocs.map(d => d.type).join(','),
				doc_count: savedDocs.length
			}, userId);

			// Increment usage counter for subscription users
			try {
				await incrementUsage(userId);
				console.log(`[Usage] Incremented usage for user ${userId}`);
			} catch (usageError) {
				console.error('[Usage] Failed to increment usage:', usageError);
				// Don't fail the request if usage tracking fails
			}

			// Log detailed usage for analytics
			const generationTimeMs = Date.now() - startTime;
			for (const doc of savedDocs) {
				try {
					await logUsage({
						userId,
						teamId: profile.default_team_id || null,
						repoId,
						docType: doc.type,
						tokensUsed: 0, // TODO: get from Claude response
						generationTimeMs
					});
				} catch (logError) {
					console.error('[Usage] Failed to log usage:', logError);
				}
			}
		}

		return json({
			docs: savedDocs,
			errors: errors.length > 0 ? errors : undefined
		});
	} catch (err) {
		console.error('Documentation generation error:', err);
		throw error(500, err instanceof Error ? err.message : 'Failed to generate documentation');
	}
};
