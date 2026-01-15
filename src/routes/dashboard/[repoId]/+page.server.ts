/**
 * Repository Detail Page Server Load
 *
 * Loads repository details and all generated documentation.
 */

import { redirect, error } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabase';
import { getRepoAggregateScore, getRepoQualityScores } from '$lib/server/quality';
import type { PageServerLoad } from './$types';
import type { Documentation } from '$lib/types';

interface SessionData {
	userId: string;
	token: string;
}

export const load: PageServerLoad = async ({ cookies, params }) => {
	const sessionCookie = cookies.get('session');
	if (!sessionCookie) throw redirect(302, '/');

	let userId: string;
	try {
		const session: SessionData = JSON.parse(sessionCookie);
		userId = session.userId;
	} catch {
		cookies.delete('session', { path: '/' });
		throw redirect(302, '/');
	}

	if (!userId) {
		cookies.delete('session', { path: '/' });
		throw redirect(302, '/');
	}

	const { repoId } = params;

	// Fetch the repository (verify ownership)
	const { data: repo, error: repoError } = await supabaseAdmin
		.from('repositories')
		.select('*')
		.eq('id', repoId)
		.eq('user_id', userId)
		.single();

	if (repoError || !repo) {
		throw error(404, 'Repository not found');
	}

	// Fetch all documentation for this repo
	const { data: docs, error: docsError } = await supabaseAdmin
		.from('documentation')
		.select('*')
		.eq('repo_id', repoId)
		.order('type');

	if (docsError) {
		console.error('Failed to fetch documentation:', docsError);
	}

	// Fetch user profile to determine plan
	const { data: profile } = await supabaseAdmin
		.from('profiles')
		.select('plan, subscription_status, subscription_tier')
		.eq('id', userId)
		.single();

	// Check if user has purchased this repo
	const { data: purchasedRepo } = await supabaseAdmin
		.from('purchased_repos')
		.select('id')
		.eq('user_id', userId)
		.eq('repo_url', repo.full_name)
		.single();

	// Organize docs by type for easy access
	const documentation: Record<string, Documentation> = {};
	for (const doc of docs || []) {
		documentation[doc.type] = doc;
	}

	// Determine user access level
	const hasSubscription =
		profile?.subscription_status === 'active' ||
		profile?.subscription_status === 'trialing';
	const hasPurchasedThisRepo = !!purchasedRepo;
	const isLegacyPlan = ['ltd', 'pro', 'dfy'].includes(profile?.plan || '');
	const isFreeUser = !hasSubscription && !hasPurchasedThisRepo && !isLegacyPlan;

	// Fetch quality scores
	let qualityScore: {
		overall: number;
		completeness: number;
		accuracy: number;
		clarity: number;
		docsScored: number;
	} | null = null;

	let docQualityScores: Record<string, { score: number; suggestions: number }> = {};

	try {
		qualityScore = await getRepoAggregateScore(repoId);
		const scores = await getRepoQualityScores(repoId);
		for (const item of scores) {
			docQualityScores[item.docType] = {
				score: item.score.overall_score,
				suggestions: item.score.suggestions?.length || 0
			};
		}
	} catch (err) {
		console.error('[RepoDetail] Error fetching quality scores:', err);
	}

	return {
		repo,
		documentation,
		hasAnyDocs: Object.keys(documentation).length > 0,
		userPlan: profile?.plan || 'free',
		subscriptionTier: profile?.subscription_tier,
		hasSubscription,
		hasPurchasedThisRepo,
		isFreeUser,
		qualityScore,
		docQualityScores
	};
};
