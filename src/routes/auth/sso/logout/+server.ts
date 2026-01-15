/**
 * SSO Logout
 *
 * GET/POST - Handle SSO logout (Single Logout if supported by IdP)
 */

import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabaseAdmin } from '$lib/server/supabase';
import { invalidateSSOSessions } from '$lib/server/saml';
import { logAuditEvent, AUDIT_ACTIONS, getAuditContext } from '$lib/server/audit';

interface SessionData {
	userId: string;
	token: string;
}

/**
 * GET /auth/sso/logout
 * Logout user from SSO session
 */
export const GET: RequestHandler = async ({ cookies, request }) => {
	const sessionCookie = cookies.get('session');

	if (sessionCookie) {
		try {
			const session: SessionData = JSON.parse(sessionCookie);
			const userId = session.userId;

			// Get user's SSO team for audit logging
			const { data: profile } = await supabaseAdmin
				.from('profiles')
				.select('sso_team_id')
				.eq('id', userId)
				.single();

			// Invalidate all SSO sessions
			await invalidateSSOSessions(userId);

			// Log audit event if user has SSO team
			if (profile?.sso_team_id) {
				const auditContext = getAuditContext(request);
				await logAuditEvent({
					teamId: profile.sso_team_id,
					userId,
					action: AUDIT_ACTIONS.SSO_LOGOUT,
					resourceType: 'sso_session',
					metadata: {},
					...auditContext
				});
			}

			// Clear SSO-related profile fields (optional - keeps link for re-login)
			// await supabaseAdmin
			//   .from('profiles')
			//   .update({ sso_team_id: null })
			//   .eq('id', userId);
		} catch (err) {
			console.error('[SSO Logout] Error processing logout:', err);
		}
	}

	// Clear app session cookie
	cookies.delete('session', { path: '/' });

	// Redirect to home page
	throw redirect(302, '/');
};

/**
 * POST /auth/sso/logout
 * Handle Single Logout (SLO) request from IdP
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
	// Parse SLO request from IdP
	// This handles the case where the IdP initiates logout
	const formData = await request.formData();
	const samlRequest = formData.get('SAMLRequest')?.toString();
	const samlResponse = formData.get('SAMLResponse')?.toString();

	if (samlRequest) {
		// IdP-initiated logout
		// In a full implementation, we would:
		// 1. Parse the LogoutRequest
		// 2. Find the session by NameID/SessionIndex
		// 3. Invalidate that session
		// 4. Send LogoutResponse back to IdP
		console.log('[SSO Logout] Received SLO request from IdP');
	}

	if (samlResponse) {
		// Response to our logout request
		console.log('[SSO Logout] Received SLO response from IdP');
	}

	// For now, just clear local session
	const sessionCookie = cookies.get('session');
	if (sessionCookie) {
		try {
			const session: SessionData = JSON.parse(sessionCookie);
			await invalidateSSOSessions(session.userId);
		} catch (err) {
			console.error('[SSO Logout] Error processing SLO:', err);
		}
	}

	cookies.delete('session', { path: '/' });

	// Redirect to home
	throw redirect(302, '/');
};
