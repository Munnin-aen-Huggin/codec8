/**
 * Audit Logging Service
 *
 * Provides compliance audit logging for team actions.
 * Available as a paid add-on for Team tier subscribers.
 */

import { supabaseAdmin } from './supabase';

export type AuditAction =
	// Team management
	| 'member_invited'
	| 'member_removed'
	| 'member_joined'
	| 'role_changed'
	| 'team_created'
	| 'team_deleted'
	| 'team_settings_changed'
	// Documentation
	| 'doc_generated'
	| 'doc_edited'
	| 'doc_exported'
	| 'doc_deleted'
	// Repository
	| 'repo_connected'
	| 'repo_disconnected'
	| 'repo_synced'
	// Subscription
	| 'subscription_started'
	| 'subscription_cancelled'
	| 'addon_purchased'
	| 'addon_cancelled'
	// SSO/SAML
	| 'sso_configured'
	| 'sso_removed'
	| 'sso_login'
	| 'sso_logout';

export type ResourceType =
	| 'team'
	| 'team_member'
	| 'invitation'
	| 'documentation'
	| 'repository'
	| 'subscription'
	| 'sso_config'
	| 'sso_session';

// Action constants for easy import
export const AUDIT_ACTIONS = {
	// Team management
	MEMBER_INVITED: 'member_invited' as const,
	MEMBER_REMOVED: 'member_removed' as const,
	MEMBER_JOINED: 'member_joined' as const,
	ROLE_CHANGED: 'role_changed' as const,
	TEAM_CREATED: 'team_created' as const,
	TEAM_DELETED: 'team_deleted' as const,
	TEAM_SETTINGS_CHANGED: 'team_settings_changed' as const,
	// Documentation
	DOC_GENERATED: 'doc_generated' as const,
	DOC_EDITED: 'doc_edited' as const,
	DOC_EXPORTED: 'doc_exported' as const,
	DOC_DELETED: 'doc_deleted' as const,
	// Repository
	REPO_CONNECTED: 'repo_connected' as const,
	REPO_DISCONNECTED: 'repo_disconnected' as const,
	REPO_SYNCED: 'repo_synced' as const,
	// Subscription
	SUBSCRIPTION_STARTED: 'subscription_started' as const,
	SUBSCRIPTION_CANCELLED: 'subscription_cancelled' as const,
	ADDON_PURCHASED: 'addon_purchased' as const,
	ADDON_CANCELLED: 'addon_cancelled' as const,
	// SSO/SAML
	SSO_CONFIGURED: 'sso_configured' as const,
	SSO_REMOVED: 'sso_removed' as const,
	SSO_LOGIN: 'sso_login' as const,
	SSO_LOGOUT: 'sso_logout' as const
};

export interface AuditLogEntry {
	id: string;
	team_id: string | null;
	user_id: string;
	action: AuditAction;
	resource_type: ResourceType;
	resource_id: string | null;
	metadata: Record<string, unknown>;
	ip_address: string | null;
	user_agent: string | null;
	created_at: string;
}

export interface AuditLogParams {
	teamId?: string | null;
	userId: string;
	action: AuditAction;
	resourceType: ResourceType;
	resourceId?: string | null;
	metadata?: Record<string, unknown>;
	ipAddress?: string | null;
	userAgent?: string | null;
}

/**
 * Log an audit event
 *
 * @param params - Audit log parameters
 */
export async function logAuditEvent(params: AuditLogParams): Promise<void> {
	try {
		// Check if team has audit logs addon enabled (if team action)
		if (params.teamId) {
			const { data: team } = await supabaseAdmin
				.from('teams')
				.select('addon_audit_logs, addon_audit_logs_expires')
				.eq('id', params.teamId)
				.single();

			// Only log if addon is active
			const hasAddon =
				team?.addon_audit_logs &&
				(!team.addon_audit_logs_expires || new Date(team.addon_audit_logs_expires) > new Date());

			if (!hasAddon) {
				// Audit logs not enabled for this team, skip logging
				return;
			}
		}

		await supabaseAdmin.from('audit_logs').insert({
			team_id: params.teamId || null,
			user_id: params.userId,
			action: params.action,
			resource_type: params.resourceType,
			resource_id: params.resourceId || null,
			metadata: params.metadata || {},
			ip_address: params.ipAddress || null,
			user_agent: params.userAgent || null
		});
	} catch (err) {
		// Don't throw - audit logging should not break main functionality
		console.error('[Audit] Failed to log event:', err);
	}
}

/**
 * Get audit logs for a team
 *
 * @param teamId - The team ID
 * @param options - Query options
 */
export async function getTeamAuditLogs(
	teamId: string,
	options: {
		limit?: number;
		offset?: number;
		action?: AuditAction;
		userId?: string;
		startDate?: string;
		endDate?: string;
	} = {}
): Promise<{ logs: AuditLogEntry[]; total: number }> {
	const { limit = 50, offset = 0, action, userId, startDate, endDate } = options;

	let query = supabaseAdmin
		.from('audit_logs')
		.select('*', { count: 'exact' })
		.eq('team_id', teamId);

	if (action) {
		query = query.eq('action', action);
	}

	if (userId) {
		query = query.eq('user_id', userId);
	}

	if (startDate) {
		query = query.gte('created_at', startDate);
	}

	if (endDate) {
		query = query.lte('created_at', endDate);
	}

	const { data, count, error } = await query
		.order('created_at', { ascending: false })
		.range(offset, offset + limit - 1);

	if (error) {
		console.error('[Audit] Error fetching logs:', error);
		throw error;
	}

	return {
		logs: (data || []) as AuditLogEntry[],
		total: count || 0
	};
}

/**
 * Export audit logs to CSV format
 */
export async function exportAuditLogsCsv(
	teamId: string,
	startDate: string,
	endDate: string
): Promise<string> {
	const { logs } = await getTeamAuditLogs(teamId, {
		limit: 10000,
		startDate,
		endDate
	});

	// CSV header
	const headers = ['Timestamp', 'Action', 'User ID', 'Resource Type', 'Resource ID', 'IP Address'];
	const rows = [headers.join(',')];

	// CSV rows
	for (const log of logs) {
		const row = [
			log.created_at,
			log.action,
			log.user_id,
			log.resource_type,
			log.resource_id || '',
			log.ip_address || ''
		].map((val) => `"${String(val).replace(/"/g, '""')}"`);
		rows.push(row.join(','));
	}

	return rows.join('\n');
}

/**
 * Get audit log summary statistics
 */
export async function getAuditLogStats(
	teamId: string,
	days: number = 30
): Promise<{
	totalEvents: number;
	byAction: Record<string, number>;
	byUser: Record<string, number>;
	byDay: Array<{ date: string; count: number }>;
}> {
	const startDate = new Date();
	startDate.setDate(startDate.getDate() - days);

	const { logs } = await getTeamAuditLogs(teamId, {
		limit: 10000,
		startDate: startDate.toISOString()
	});

	// Aggregate stats
	const byAction: Record<string, number> = {};
	const byUser: Record<string, number> = {};
	const byDay: Record<string, number> = {};

	for (const log of logs) {
		// By action
		byAction[log.action] = (byAction[log.action] || 0) + 1;

		// By user
		byUser[log.user_id] = (byUser[log.user_id] || 0) + 1;

		// By day
		const day = log.created_at.split('T')[0];
		byDay[day] = (byDay[day] || 0) + 1;
	}

	// Fill in missing days
	const dailyArray: Array<{ date: string; count: number }> = [];
	for (let i = days - 1; i >= 0; i--) {
		const d = new Date();
		d.setDate(d.getDate() - i);
		const dateStr = d.toISOString().split('T')[0];
		dailyArray.push({ date: dateStr, count: byDay[dateStr] || 0 });
	}

	return {
		totalEvents: logs.length,
		byAction,
		byUser,
		byDay: dailyArray
	};
}

/**
 * Helper to get request context for audit logging
 */
export function getAuditContext(request: Request): { ipAddress: string | null; userAgent: string | null } {
	return {
		ipAddress:
			request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
			request.headers.get('x-real-ip') ||
			null,
		userAgent: request.headers.get('user-agent') || null
	};
}
