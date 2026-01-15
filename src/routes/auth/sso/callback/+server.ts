/**
 * SSO SAML Callback
 *
 * POST - Handle SAML Response from IdP
 */

import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabaseAdmin } from '$lib/server/supabase';
import {
	getSSOConfig,
	validateSAMLResponse,
	createSSOSession,
	type SAMLUser
} from '$lib/server/saml';
import { logAuditEvent, AUDIT_ACTIONS, getAuditContext } from '$lib/server/audit';
import { trackEvent, EVENTS } from '$lib/server/analytics';
import { dev } from '$app/environment';

interface SSOState {
	teamId: string;
	teamSlug: string;
	returnTo: string;
}

/**
 * POST /auth/sso/callback
 * Handle SAML Response from Identity Provider
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
	// Get SSO state from cookie
	const ssoStateCookie = cookies.get('sso_state');
	if (!ssoStateCookie) {
		throw error(400, 'SSO session expired. Please try logging in again.');
	}

	let ssoState: SSOState;
	try {
		ssoState = JSON.parse(ssoStateCookie);
	} catch {
		throw error(400, 'Invalid SSO session. Please try logging in again.');
	}

	// Clear SSO state cookie
	cookies.delete('sso_state', { path: '/' });

	const { teamId, returnTo } = ssoState;

	// Get form data (SAML Response is POSTed as form data)
	const formData = await request.formData();
	const samlResponse = formData.get('SAMLResponse')?.toString();

	if (!samlResponse) {
		throw error(400, 'No SAML response received');
	}

	// Get SSO config
	const config = await getSSOConfig(teamId);
	if (!config) {
		throw error(400, 'SSO not configured for this team');
	}

	let samlUser: SAMLUser;
	try {
		// Validate SAML response and extract user info
		samlUser = await validateSAMLResponse(config, samlResponse);
	} catch (err) {
		console.error('[SSO Callback] SAML validation error:', err);
		throw error(400, 'Invalid SAML response. Please try logging in again.');
	}

	// Get audit context
	const auditContext = getAuditContext(request);

	try {
		// Check if user exists by SSO ID or email
		let userId: string;
		let isNewUser = false;

		// First try to find by SSO ID
		const { data: existingBySsoId } = await supabaseAdmin
			.from('profiles')
			.select('id, sso_team_id')
			.eq('sso_id', samlUser.nameId)
			.eq('sso_provider', config.provider)
			.single();

		if (existingBySsoId) {
			userId = existingBySsoId.id;

			// Update profile with latest SSO info
			await supabaseAdmin
				.from('profiles')
				.update({
					email: samlUser.email,
					sso_team_id: teamId
				})
				.eq('id', userId);
		} else {
			// Try to find by email
			const { data: existingByEmail } = await supabaseAdmin
				.from('profiles')
				.select('id, sso_id')
				.eq('email', samlUser.email.toLowerCase())
				.single();

			if (existingByEmail) {
				userId = existingByEmail.id;

				// Link SSO to existing account
				await supabaseAdmin
					.from('profiles')
					.update({
						sso_id: samlUser.nameId,
						sso_provider: config.provider,
						sso_team_id: teamId
					})
					.eq('id', userId);
			} else {
				// JIT Provisioning - Create new user
				if (!config.jit_provisioning) {
					throw error(403, 'User not found. JIT provisioning is disabled for this team.');
				}

				// Create new profile
				const newUserId = crypto.randomUUID();
				const { error: insertError } = await supabaseAdmin.from('profiles').insert({
					id: newUserId,
					email: samlUser.email.toLowerCase(),
					github_username: samlUser.email.split('@')[0], // Placeholder
					sso_id: samlUser.nameId,
					sso_provider: config.provider,
					sso_team_id: teamId,
					plan: 'free'
				});

				if (insertError) {
					console.error('[SSO Callback] Failed to create user:', insertError);
					throw error(500, 'Failed to create user account');
				}

				userId = newUserId;
				isNewUser = true;

				// Track signup
				await trackEvent(EVENTS.SIGNUP_COMPLETED, { provider: 'sso', sso_provider: config.provider }, userId);
			}
		}

		// Ensure user is a member of the team
		const { data: membership } = await supabaseAdmin
			.from('team_members')
			.select('id')
			.eq('team_id', teamId)
			.eq('user_id', userId)
			.single();

		if (!membership) {
			// Auto-add to team via JIT provisioning
			if (!config.jit_provisioning) {
				throw error(403, 'You are not a member of this team. Contact your administrator.');
			}

			await supabaseAdmin.from('team_members').insert({
				team_id: teamId,
				user_id: userId,
				role: 'member'
			});
		}

		// Create SSO session
		await createSSOSession(userId, teamId, samlUser.sessionIndex);

		// Create app session
		const sessionToken = crypto.randomUUID();
		const sessionExpiry = new Date();
		sessionExpiry.setDate(sessionExpiry.getDate() + 7); // 7 days

		cookies.set('session', JSON.stringify({ userId, token: sessionToken }), {
			path: '/',
			httpOnly: true,
			secure: !dev,
			sameSite: 'lax',
			expires: sessionExpiry
		});

		// Set default team
		await supabaseAdmin
			.from('profiles')
			.update({ default_team_id: teamId })
			.eq('id', userId);

		// Log audit event
		await logAuditEvent({
			teamId,
			userId,
			action: AUDIT_ACTIONS.SSO_LOGIN,
			resourceType: 'sso_session',
			metadata: {
				provider: config.provider,
				isNewUser,
				email: samlUser.email
			},
			...auditContext
		});

		// Track login
		if (!isNewUser) {
			await trackEvent(EVENTS.LOGIN_COMPLETED, { provider: 'sso', sso_provider: config.provider }, userId);
		}

		// Redirect to return URL
		throw redirect(302, returnTo || '/dashboard');
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		console.error('[SSO Callback] Error:', err);
		throw error(500, 'SSO login failed. Please try again.');
	}
};
