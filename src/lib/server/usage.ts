/**
 * Usage Tracking Utility
 *
 * Tracks and manages usage limits for subscription-based features.
 * Supports hybrid pricing model with one-time purchases and subscriptions.
 */

import { supabaseAdmin } from './supabase';

/**
 * Profile interface with subscription fields
 */
export interface Profile {
	id: string;
	email: string;
	github_username: string;
	plan: string;
	subscription_status: string | null;
	subscription_tier: string | null;
	repos_used_this_month: number;
	current_period_start: string | null;
	current_period_end: string | null;
	trial_ends_at: string | null;
	subscription_ends_at: string | null;
}

/**
 * Usage limit result
 */
export interface UsageResult {
	allowed: boolean;
	used: number;
	limit: number;
	tier: string;
}

/**
 * Can generate result
 */
export interface CanGenerateResult {
	allowed: boolean;
	reason?: string;
}

/**
 * Subscription tier limits
 */
const TIER_LIMITS: Record<string, number> = {
	pro: 30,
	team: 100,
	free: 1,
	ltd: Infinity // Legacy LTD users have unlimited
};

/**
 * Check if a user has remaining usage within their subscription limits
 *
 * @param userId - The user's ID
 * @returns Usage result with current usage and limits
 */
export async function checkUsageLimit(userId: string): Promise<UsageResult> {
	const profile = await getProfile(userId);

	if (!profile) {
		return {
			allowed: false,
			used: 0,
			limit: 0,
			tier: 'none'
		};
	}

	// Legacy LTD users have unlimited usage
	if (profile.plan === 'ltd' || profile.plan === 'pro' || profile.plan === 'dfy') {
		return {
			allowed: true,
			used: profile.repos_used_this_month,
			limit: Infinity,
			tier: profile.plan
		};
	}

	// Check subscription status
	const tier = profile.subscription_tier || 'free';
	const limit = TIER_LIMITS[tier] || 1;
	const used = profile.repos_used_this_month || 0;

	// Check if subscription is active or in valid trial
	const isValidTrial =
		profile.subscription_status === 'trialing' &&
		profile.trial_ends_at &&
		new Date(profile.trial_ends_at) > new Date();

	const isActiveSubscription = profile.subscription_status === 'active';

	if (!isActiveSubscription && !isValidTrial && tier !== 'free') {
		return {
			allowed: false,
			used,
			limit: 0,
			tier: 'inactive'
		};
	}

	return {
		allowed: used < limit,
		used,
		limit,
		tier
	};
}

/**
 * Check if a user can generate documentation for a specific repository
 *
 * Checks:
 * 1. Active subscription with remaining usage
 * 2. One-time purchased repo access
 *
 * @param userId - The user's ID
 * @param repoUrl - The GitHub repository URL (owner/repo format)
 * @returns Whether the user can generate docs and the reason if not
 */
export async function canGenerateForRepo(
	userId: string,
	repoUrl: string
): Promise<CanGenerateResult> {
	const profile = await getProfile(userId);

	if (!profile) {
		return {
			allowed: false,
			reason: 'User not found'
		};
	}

	// Legacy plan users (ltd, pro, dfy) have unlimited access
	if (['ltd', 'pro', 'dfy'].includes(profile.plan)) {
		return { allowed: true };
	}

	// Check if subscription has ended (canceled)
	if (profile.subscription_ends_at) {
		const endsAt = new Date(profile.subscription_ends_at);
		if (endsAt < new Date()) {
			return {
				allowed: false,
				reason: 'Your subscription has ended. Please renew to continue.'
			};
		}
	}

	// Check trial expiration
	if (profile.subscription_status === 'trialing' && profile.trial_ends_at) {
		const trialEnd = new Date(profile.trial_ends_at);
		if (trialEnd < new Date()) {
			return {
				allowed: false,
				reason: 'Your trial has expired. Please subscribe to continue.'
			};
		}
	}

	// Check subscription-based access (active or valid trial)
	const hasValidSubscription =
		profile.subscription_status === 'active' ||
		(profile.subscription_status === 'trialing' &&
			profile.trial_ends_at &&
			new Date(profile.trial_ends_at) > new Date());

	if (hasValidSubscription && profile.subscription_tier) {
		const usageResult = await checkUsageLimit(userId);
		if (usageResult.allowed) {
			return { allowed: true };
		}
		return {
			allowed: false,
			reason: 'Monthly limit reached. Upgrade for more repos.'
		};
	}

	// Check one-time purchased repo access
	const { data: purchasedRepo, error } = await supabaseAdmin
		.from('purchased_repos')
		.select('id')
		.eq('user_id', userId)
		.eq('repo_url', repoUrl)
		.single();

	if (error && error.code !== 'PGRST116') {
		// PGRST116 = no rows found
		console.error('Error checking purchased repos:', error);
	}

	if (purchasedRepo) {
		return { allowed: true };
	}

	// Free tier - check if any generations remain
	const usageResult = await checkUsageLimit(userId);
	if (usageResult.allowed) {
		return { allowed: true };
	}

	return {
		allowed: false,
		reason: 'Purchase required for this repository'
	};
}

/**
 * Increment the monthly usage counter for a user
 *
 * @param userId - The user's ID
 */
export async function incrementUsage(userId: string): Promise<void> {
	const { error } = await supabaseAdmin.rpc('increment_usage', {
		user_id: userId
	});

	if (error) {
		// Fallback: manual increment if RPC doesn't exist
		console.warn('RPC increment_usage not found, using manual update:', error.message);

		const profile = await getProfile(userId);
		if (profile) {
			const newCount = (profile.repos_used_this_month || 0) + 1;
			const { error: updateError } = await supabaseAdmin
				.from('profiles')
				.update({ repos_used_this_month: newCount })
				.eq('id', userId);

			if (updateError) {
				console.error('Error incrementing usage:', updateError);
				throw new Error('Failed to increment usage');
			}
		}
	}
}

/**
 * Get a user's profile with subscription fields
 *
 * @param userId - The user's ID
 * @returns The user's profile or null if not found
 */
export async function getProfile(userId: string): Promise<Profile | null> {
	const { data, error } = await supabaseAdmin
		.from('profiles')
		.select(
			`
			id,
			email,
			github_username,
			plan,
			subscription_status,
			subscription_tier,
			repos_used_this_month,
			current_period_start,
			current_period_end,
			trial_ends_at,
			subscription_ends_at
		`
		)
		.eq('id', userId)
		.single();

	if (error) {
		if (error.code === 'PGRST116') {
			// No rows found
			return null;
		}
		console.error('Error fetching profile:', error);
		return null;
	}

	return data as Profile;
}

/**
 * Reset monthly usage for a user (called on subscription renewal)
 *
 * @param userId - The user's ID
 * @param periodStart - Start of new billing period
 * @param periodEnd - End of new billing period
 */
export async function resetMonthlyUsage(
	userId: string,
	periodStart: string,
	periodEnd: string
): Promise<void> {
	const { error } = await supabaseAdmin
		.from('profiles')
		.update({
			repos_used_this_month: 0,
			current_period_start: periodStart,
			current_period_end: periodEnd
		})
		.eq('id', userId);

	if (error) {
		console.error('Error resetting monthly usage:', error);
		throw new Error('Failed to reset monthly usage');
	}
}

/**
 * Get usage statistics for a user
 *
 * @param userId - The user's ID
 * @returns Usage statistics including remaining and percentage used
 */
export async function getUsageStats(userId: string): Promise<{
	used: number;
	limit: number;
	remaining: number;
	percentUsed: number;
	tier: string;
	periodEnd: string | null;
}> {
	const profile = await getProfile(userId);

	if (!profile) {
		return {
			used: 0,
			limit: 0,
			remaining: 0,
			percentUsed: 0,
			tier: 'none',
			periodEnd: null
		};
	}

	const tier = profile.subscription_tier || profile.plan || 'free';
	const limit = TIER_LIMITS[tier] || 1;
	const used = profile.repos_used_this_month || 0;
	const remaining = limit === Infinity ? Infinity : Math.max(0, limit - used);
	const percentUsed = limit === Infinity ? 0 : Math.round((used / limit) * 100);

	return {
		used,
		limit,
		remaining,
		percentUsed,
		tier,
		periodEnd: profile.current_period_end
	};
}

/**
 * Log usage entry to usage_logs table
 */
interface LogUsageParams {
	userId: string;
	teamId: string | null;
	repoId: string;
	docType: string;
	tokensUsed: number;
	generationTimeMs: number;
}

export async function logUsage(params: LogUsageParams): Promise<void> {
	try {
		await supabaseAdmin.from('usage_logs').insert({
			user_id: params.userId,
			team_id: params.teamId,
			repo_id: params.repoId,
			doc_type: params.docType,
			tokens_used: params.tokensUsed,
			generation_time_ms: params.generationTimeMs
		});
	} catch (err) {
		console.error('Failed to log usage:', err);
		// Don't throw - usage logging should not break generation
	}
}

/**
 * Detailed usage statistics interface
 */
export interface DetailedUsageStats {
	totalDocs: number;
	totalTokens: number;
	avgGenerationTime: number;
	docsByType: Record<string, number>;
	dailyUsage: Array<{ date: string; count: number }>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	recentDocs: any[];
}

/**
 * Get detailed usage stats for analytics dashboard
 */
export async function getUserDetailedStats(
	userId: string,
	teamId: string | null,
	days: number = 30
): Promise<DetailedUsageStats> {
	const startDate = new Date();
	startDate.setDate(startDate.getDate() - days);

	// Build query
	let query = supabaseAdmin
		.from('usage_logs')
		.select('*')
		.gte('created_at', startDate.toISOString());

	if (teamId) {
		query = query.eq('team_id', teamId);
	} else {
		query = query.eq('user_id', userId);
	}

	const { data: logs, error } = await query.order('created_at', { ascending: false });

	if (error) {
		console.error('Error fetching usage logs:', error);
		throw error;
	}

	const logList = logs || [];

	// Calculate stats
	const totalDocs = logList.length;
	const totalTokens = logList.reduce((sum, l) => sum + (l.tokens_used || 0), 0);
	const avgGenerationTime = totalDocs > 0
		? Math.round(logList.reduce((sum, l) => sum + (l.generation_time_ms || 0), 0) / totalDocs)
		: 0;

	// Group by doc type
	const docsByType: Record<string, number> = {};
	logList.forEach(l => {
		docsByType[l.doc_type] = (docsByType[l.doc_type] || 0) + 1;
	});

	// Group by day
	const dailyMap: Record<string, number> = {};
	logList.forEach(l => {
		const date = new Date(l.created_at).toISOString().split('T')[0];
		dailyMap[date] = (dailyMap[date] || 0) + 1;
	});

	// Fill in missing days
	const dailyUsage: Array<{ date: string; count: number }> = [];
	for (let i = days - 1; i >= 0; i--) {
		const d = new Date();
		d.setDate(d.getDate() - i);
		const dateStr = d.toISOString().split('T')[0];
		dailyUsage.push({ date: dateStr, count: dailyMap[dateStr] || 0 });
	}

	return {
		totalDocs,
		totalTokens,
		avgGenerationTime,
		docsByType,
		dailyUsage,
		recentDocs: logList.slice(0, 10)
	};
}

/**
 * Get team usage stats with member breakdown
 */
export async function getTeamDetailedStats(teamId: string): Promise<{
	stats: DetailedUsageStats;
	memberUsage: Array<{ userId: string; username: string; count: number }>;
	quotaUsed: number;
	quotaLimit: number;
}> {
	const stats = await getUserDetailedStats('', teamId, 30);

	// Get per-member breakdown
	const { data: memberData } = await supabaseAdmin
		.from('usage_logs')
		.select(`
			user_id,
			profiles:user_id (github_username)
		`)
		.eq('team_id', teamId)
		.gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

	const memberMap: Record<string, { count: number; username: string }> = {};
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(memberData || []).forEach((m: any) => {
		const id = m.user_id;
		if (!memberMap[id]) {
			memberMap[id] = { count: 0, username: m.profiles?.github_username || 'Unknown' };
		}
		memberMap[id].count++;
	});

	const memberUsage = Object.entries(memberMap).map(([userId, data]) => ({
		userId,
		username: data.username,
		count: data.count
	})).sort((a, b) => b.count - a.count);

	// Get quota info
	const { data: team } = await supabaseAdmin
		.from('teams')
		.select('repos_used_this_month, max_repos_per_month')
		.eq('id', teamId)
		.single();

	return {
		stats,
		memberUsage,
		quotaUsed: team?.repos_used_this_month || 0,
		quotaLimit: team?.max_repos_per_month || 100
	};
}
