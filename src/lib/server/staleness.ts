/**
 * Document Staleness Detection Service
 *
 * Monitors documentation freshness and creates alerts when docs become stale.
 * Integrates with GitHub webhooks to detect code changes.
 */

import { supabaseAdmin } from './supabase';

export interface StalenessAlert {
	id: string;
	repo_id: string;
	user_id: string;
	alert_type: 'stale' | 'code_changed' | 'never_generated';
	days_stale: number | null;
	dismissed: boolean;
	dismissed_at: string | null;
	created_at: string;
	// Joined fields
	repo_name?: string;
	repo_full_name?: string;
}

export interface StaleDocInfo {
	repo_id: string;
	repo_name: string;
	full_name: string;
	doc_type: string;
	generated_at: string;
	days_stale: number;
}

/**
 * Check for stale documentation for a user
 *
 * @param userId - The user's ID
 * @param thresholdDays - Days after which docs are considered stale (default: 30)
 * @returns List of stale docs that need attention
 */
export async function checkStaleDocs(
	userId: string,
	thresholdDays: number = 30
): Promise<StaleDocInfo[]> {
	const cutoffDate = new Date();
	cutoffDate.setDate(cutoffDate.getDate() - thresholdDays);

	const { data, error } = await supabaseAdmin
		.from('documentation')
		.select(`
			repo_id,
			type,
			generated_at,
			repositories!inner (
				id,
				name,
				full_name,
				user_id
			)
		`)
		.lt('generated_at', cutoffDate.toISOString())
		.eq('repositories.user_id', userId);

	if (error) {
		console.error('[Staleness] Error checking stale docs:', error);
		return [];
	}

	if (!data) return [];

	const now = new Date();
	return data.map((doc) => {
		const generatedAt = new Date(doc.generated_at);
		const daysStale = Math.floor((now.getTime() - generatedAt.getTime()) / (1000 * 60 * 60 * 24));
		const repo = doc.repositories as unknown as { id: string; name: string; full_name: string };

		return {
			repo_id: repo.id,
			repo_name: repo.name,
			full_name: repo.full_name,
			doc_type: doc.type,
			generated_at: doc.generated_at,
			days_stale: daysStale
		};
	});
}

/**
 * Get active staleness alerts for a user
 *
 * @param userId - The user's ID
 * @returns List of active (non-dismissed) alerts
 */
export async function getActiveAlerts(userId: string): Promise<StalenessAlert[]> {
	const { data, error } = await supabaseAdmin
		.from('doc_staleness_alerts')
		.select(`
			*,
			repositories (
				name,
				full_name
			)
		`)
		.eq('user_id', userId)
		.eq('dismissed', false)
		.order('created_at', { ascending: false });

	if (error) {
		console.error('[Staleness] Error fetching alerts:', error);
		return [];
	}

	return (data || []).map((alert) => {
		const repo = alert.repositories as unknown as { name: string; full_name: string } | null;
		return {
			...alert,
			repo_name: repo?.name,
			repo_full_name: repo?.full_name
		};
	});
}

/**
 * Create a staleness alert for a repository
 *
 * @param repoId - The repository ID
 * @param userId - The user's ID
 * @param alertType - Type of alert
 * @param daysStale - How many days the doc has been stale
 */
export async function createStaleAlert(
	repoId: string,
	userId: string,
	alertType: 'stale' | 'code_changed' | 'never_generated',
	daysStale?: number
): Promise<void> {
	// Check if a similar alert already exists
	const { data: existing } = await supabaseAdmin
		.from('doc_staleness_alerts')
		.select('id')
		.eq('repo_id', repoId)
		.eq('user_id', userId)
		.eq('alert_type', alertType)
		.eq('dismissed', false)
		.single();

	if (existing) {
		// Alert already exists, update days_stale
		await supabaseAdmin
			.from('doc_staleness_alerts')
			.update({ days_stale: daysStale })
			.eq('id', existing.id);
		return;
	}

	const { error } = await supabaseAdmin.from('doc_staleness_alerts').insert({
		repo_id: repoId,
		user_id: userId,
		alert_type: alertType,
		days_stale: daysStale || null
	});

	if (error) {
		console.error('[Staleness] Error creating alert:', error);
	}
}

/**
 * Dismiss a staleness alert
 *
 * @param alertId - The alert ID
 * @param userId - The user's ID (for security check)
 */
export async function dismissAlert(alertId: string, userId: string): Promise<boolean> {
	const { error } = await supabaseAdmin
		.from('doc_staleness_alerts')
		.update({
			dismissed: true,
			dismissed_at: new Date().toISOString()
		})
		.eq('id', alertId)
		.eq('user_id', userId);

	if (error) {
		console.error('[Staleness] Error dismissing alert:', error);
		return false;
	}

	return true;
}

/**
 * Check all repos for a user and create alerts for stale docs
 * This is typically run as a scheduled job
 *
 * @param userId - The user's ID
 */
export async function runStalenessCheck(userId: string): Promise<number> {
	// Get user preferences
	const { data: profile } = await supabaseAdmin
		.from('profiles')
		.select('stale_alert_threshold_days, stale_alerts_enabled')
		.eq('id', userId)
		.single();

	if (!profile?.stale_alerts_enabled) {
		return 0;
	}

	const thresholdDays = profile.stale_alert_threshold_days || 30;
	const staleDocs = await checkStaleDocs(userId, thresholdDays);

	// Group by repo and create alerts
	const repoAlerts = new Map<string, number>();
	for (const doc of staleDocs) {
		const current = repoAlerts.get(doc.repo_id) || 0;
		repoAlerts.set(doc.repo_id, Math.max(current, doc.days_stale));
	}

	let alertsCreated = 0;
	for (const [repoId, daysStale] of repoAlerts) {
		await createStaleAlert(repoId, userId, 'stale', daysStale);
		alertsCreated++;
	}

	return alertsCreated;
}

/**
 * Create a code_changed alert when a webhook fires but docs weren't regenerated
 * (e.g., due to cooldown or plan limits)
 *
 * @param repoId - The repository ID
 * @param userId - The user's ID
 */
export async function createCodeChangedAlert(repoId: string, userId: string): Promise<void> {
	await createStaleAlert(repoId, userId, 'code_changed');
}
