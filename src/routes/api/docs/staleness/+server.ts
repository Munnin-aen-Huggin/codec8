/**
 * Staleness Alerts API
 *
 * GET - Fetch active staleness alerts for the authenticated user
 * PATCH - Dismiss a staleness alert
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getActiveAlerts, dismissAlert, runStalenessCheck } from '$lib/server/staleness';

// GET /api/docs/staleness - Get active alerts
export const GET: RequestHandler = async ({ locals }) => {
	const user = locals.user;
	if (!user) {
		throw error(401, 'Unauthorized');
	}

	try {
		const alerts = await getActiveAlerts(user.id);
		return json({ alerts });
	} catch (err) {
		console.error('[Staleness API] Error fetching alerts:', err);
		throw error(500, 'Failed to fetch staleness alerts');
	}
};

// POST /api/docs/staleness - Run staleness check (can be triggered manually or by cron)
export const POST: RequestHandler = async ({ locals }) => {
	const user = locals.user;
	if (!user) {
		throw error(401, 'Unauthorized');
	}

	try {
		const alertsCreated = await runStalenessCheck(user.id);
		return json({ alertsCreated });
	} catch (err) {
		console.error('[Staleness API] Error running staleness check:', err);
		throw error(500, 'Failed to run staleness check');
	}
};

// PATCH /api/docs/staleness - Dismiss an alert
export const PATCH: RequestHandler = async ({ locals, request }) => {
	const user = locals.user;
	if (!user) {
		throw error(401, 'Unauthorized');
	}

	try {
		const { alertId } = await request.json();

		if (!alertId) {
			throw error(400, 'Missing alertId');
		}

		const success = await dismissAlert(alertId, user.id);

		if (!success) {
			throw error(404, 'Alert not found or already dismissed');
		}

		return json({ success: true });
	} catch (err) {
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		console.error('[Staleness API] Error dismissing alert:', err);
		throw error(500, 'Failed to dismiss alert');
	}
};
