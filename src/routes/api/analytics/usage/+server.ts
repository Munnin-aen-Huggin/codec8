import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUserDetailedStats, getTeamDetailedStats, getUsageStats } from '$lib/server/usage';
import { supabaseAdmin } from '$lib/server/supabase';
import { getValidatedUserId } from '$lib/server/session';

export const GET: RequestHandler = async ({ cookies, url }) => {
	// CRITICAL SECURITY: Validate session server-side
	const userId = await getValidatedUserId(cookies);

	// Get user profile to check tier
	const { data: profile, error: profileError } = await supabaseAdmin
		.from('profiles')
		.select('subscription_tier, plan, default_team_id, repos_used_this_month')
		.eq('id', userId)
		.single();

	console.log('[Analytics] Profile:', {
		userId,
		subscription_tier: profile?.subscription_tier,
		plan: profile?.plan,
		repos_used: profile?.repos_used_this_month,
		error: profileError?.message
	});

	const tier = profile?.subscription_tier || profile?.plan || 'free';
	console.log('[Analytics] Detected tier:', tier);

	// Only Pro, Team, Enterprise, LTD, and DFY users can access detailed analytics
	if (!['pro', 'team', 'enterprise', 'ltd', 'dfy'].includes(tier)) {
		console.log('[Analytics] Access denied for tier:', tier);
		throw error(403, 'Pro or Team subscription required for analytics');
	}

	// Validate and bound the days parameter (1-365 days)
	const days = Math.min(365, Math.max(1, parseInt(url.searchParams.get('days') || '30') || 30));
	const teamId = url.searchParams.get('teamId') || profile?.default_team_id;

	try {
		if (tier === 'team' && teamId) {
			const data = await getTeamDetailedStats(teamId);
			console.log('[Analytics] Team stats:', {
				teamId,
				totalDocs: data.stats.totalDocs,
				quotaUsed: data.quotaUsed,
				quotaLimit: data.quotaLimit,
				dailyUsageLength: data.stats.dailyUsage?.length,
				dailyUsageSample: data.stats.dailyUsage?.slice(-3)
			});
			return json(data);
		} else {
			const stats = await getUserDetailedStats(userId, null, days);
			const usageStats = await getUsageStats(userId);
			console.log('[Analytics] User stats:', {
				userId,
				totalDocs: stats.totalDocs,
				reposConnected: stats.reposConnected,
				quotaUsed: usageStats.used,
				quotaLimit: usageStats.limit
			});
			return json({
				stats,
				quotaUsed: usageStats.used,
				quotaLimit: usageStats.limit
			});
		}
	} catch (err) {
		console.error('Error fetching usage stats:', err);
		throw error(500, 'Failed to fetch usage statistics');
	}
};
