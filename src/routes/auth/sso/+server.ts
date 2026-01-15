/**
 * SSO Login Initiation
 *
 * GET/POST - Initiate SSO login flow
 */

import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSSOConfigBySlug, generateAuthRequest } from '$lib/server/saml';

/**
 * GET /auth/sso?team=TEAM_SLUG
 * Initiate SSO login for a team
 */
export const GET: RequestHandler = async ({ url, cookies }) => {
	const teamSlug = url.searchParams.get('team');
	const returnTo = url.searchParams.get('returnTo') || '/dashboard';

	if (!teamSlug) {
		throw error(400, 'Team slug is required. Use ?team=your-team-slug');
	}

	// Get SSO config for the team
	const result = await getSSOConfigBySlug(teamSlug);

	if (!result) {
		throw error(404, 'Team not found or SSO not configured');
	}

	const { config, team } = result;

	try {
		// Store team info and return URL in cookies for callback
		const ssoState = JSON.stringify({
			teamId: team.id,
			teamSlug,
			returnTo
		});

		cookies.set('sso_state', ssoState, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 600 // 10 minutes
		});

		// Generate SAML AuthnRequest and redirect to IdP
		const { redirectUrl } = await generateAuthRequest(config, teamSlug);

		throw redirect(302, redirectUrl);
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		console.error('[SSO] Error initiating login:', err);
		throw error(500, 'Failed to initiate SSO login');
	}
};

/**
 * POST /auth/sso
 * Initiate SSO login with form data (for SSO login form)
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
	const formData = await request.formData();
	const teamSlug = formData.get('team')?.toString();
	const returnTo = formData.get('returnTo')?.toString() || '/dashboard';

	if (!teamSlug) {
		throw error(400, 'Team slug is required');
	}

	// Get SSO config for the team
	const result = await getSSOConfigBySlug(teamSlug);

	if (!result) {
		throw error(404, 'Team not found or SSO not configured');
	}

	const { config, team } = result;

	try {
		// Store team info and return URL in cookies for callback
		const ssoState = JSON.stringify({
			teamId: team.id,
			teamSlug,
			returnTo
		});

		cookies.set('sso_state', ssoState, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 600 // 10 minutes
		});

		// Generate SAML AuthnRequest and redirect to IdP
		const { redirectUrl } = await generateAuthRequest(config, teamSlug);

		throw redirect(302, redirectUrl);
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		console.error('[SSO] Error initiating login:', err);
		throw error(500, 'Failed to initiate SSO login');
	}
};
