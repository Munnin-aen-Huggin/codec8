import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUserDetailedStats, getTeamDetailedStats, getUsageStats } from '$lib/server/usage';
import { supabaseAdmin } from '$lib/server/supabase';
import { getValidatedUserId } from '$lib/server/session';

export const GET: RequestHandler = async ({ cookies, url }) => {
	// CRITICAL SECURITY: Validate session server-side
	const userId = await getValidatedUserId(cookies);

	// Get user profile to check tier
	const { data: profile } = await supabaseAdmin
		.from('profiles')
		.select('subscription_tier, plan, default_team_id, repos_used_this_month')
		.eq('id', userId)
		.single();

	const tier = profile?.subscription_tier || profile?.plan || 'free';

	// Only Pro, Team, Enterprise, LTD, and DFY users can access detailed analytics
	if (!['pro', 'team', 'enterprise', 'ltd', 'dfy'].includes(tier)) {
		throw error(403, 'Pro or Team subscription required for analytics');
	}

	// Validate and bound the days parameter (1-365 days)
	const days = Math.min(365, Math.max(1, parseInt(url.searchParams.get('days') || '30') || 30));
	const teamId = url.searchParams.get('teamId') || profile?.default_team_id;

	try {
		if (tier === 'team' && teamId) {
			const data = await getTeamDetailedStats(teamId);
			return json(data);
		} else {
			const stats = await getUserDetailedStats(userId, null, days);
			const usageStats = await getUsageStats(userId);
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
