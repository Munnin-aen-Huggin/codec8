/**
 * Team Audit Logs API
 *
 * GET - Get audit logs for a team
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabaseAdmin } from '$lib/server/supabase';
import {
	getTeamAuditLogs,
	exportAuditLogsCsv,
	getAuditLogStats,
	type AuditAction
} from '$lib/server/audit';

// GET /api/teams/[id]/audit - Get audit logs
export const GET: RequestHandler = async ({ params, url, locals }) => {
	const user = locals.user;
	if (!user) {
		throw error(401, 'Unauthorized');
	}

	const teamId = params.id;

	// Check user is team admin
	const { data: membership } = await supabaseAdmin
		.from('team_members')
		.select('role')
		.eq('team_id', teamId)
		.eq('user_id', user.id)
		.single();

	if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
		throw error(403, 'Only team admins can view audit logs');
	}

	// Check team has audit logs addon
	const { data: team } = await supabaseAdmin
		.from('teams')
		.select('addon_audit_logs, addon_audit_logs_expires')
		.eq('id', teamId)
		.single();

	const hasAddon =
		team?.addon_audit_logs &&
		(!team.addon_audit_logs_expires || new Date(team.addon_audit_logs_expires) > new Date());

	if (!hasAddon) {
		throw error(403, 'Audit logs addon is not enabled for this team');
	}

	// Parse query params with bounds checking
	const format = url.searchParams.get('format');
	const limit = Math.min(1000, Math.max(1, parseInt(url.searchParams.get('limit') || '50') || 50));
	const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0') || 0);
	const action = url.searchParams.get('action') as AuditAction | null;
	const userId = url.searchParams.get('userId');
	const startDate = url.searchParams.get('startDate');
	const endDate = url.searchParams.get('endDate');

	try {
		// Export as CSV
		if (format === 'csv') {
			const csv = await exportAuditLogsCsv(
				teamId,
				startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
				endDate || new Date().toISOString()
			);

			// Sanitize teamId for filename to prevent path traversal
			const sanitizedTeamId = teamId.replace(/[^a-z0-9-]/gi, '');
			return new Response(csv, {
				headers: {
					'Content-Type': 'text/csv',
					'Content-Disposition': `attachment; filename="audit-logs-${sanitizedTeamId}.csv"`
				}
			});
		}

		// Get stats
		if (format === 'stats') {
			const days = parseInt(url.searchParams.get('days') || '30');
			const stats = await getAuditLogStats(teamId, days);
			return json({ stats });
		}

		// Get logs (default)
		const { logs, total } = await getTeamAuditLogs(teamId, {
			limit,
			offset,
			action: action || undefined,
			userId: userId || undefined,
			startDate: startDate || undefined,
			endDate: endDate || undefined
		});

		return json({
			logs,
			total,
			limit,
			offset,
			hasMore: offset + logs.length < total
		});
	} catch (err) {
		console.error('[Audit API] Error:', err);
		throw error(500, 'Failed to fetch audit logs');
	}
};
