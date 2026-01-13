import { redirect, error } from '@sveltejs/kit';
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from '$env/static/private';
import { PUBLIC_APP_URL } from '$env/static/public';
import { supabaseAdmin } from '$lib/server/supabase';
import { trackEvent, EVENTS } from '$lib/server/analytics';
import { dev } from '$app/environment';
import type { RequestHandler } from './$types';

interface GitHubTokenResponse {
	access_token: string;
	token_type: string;
	scope: string;
}

interface GitHubUser {
	id: number;
	login: string;
	email: string | null;
	avatar_url: string;
}

interface GitHubEmail {
	email: string;
	primary: boolean;
	verified: boolean;
}

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const storedState = cookies.get('oauth_state');

	// Verify state parameter for CSRF protection
	if (!state || !storedState || state !== storedState) {
		throw error(400, 'Invalid state parameter');
	}

	// Clear the state cookie
	cookies.delete('oauth_state', { path: '/' });

	if (!code) {
		throw error(400, 'No authorization code provided');
	}

	try {
		// Exchange code for access token
		const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				client_id: GITHUB_CLIENT_ID,
				client_secret: GITHUB_CLIENT_SECRET,
				code,
				redirect_uri: `${PUBLIC_APP_URL}/auth/callback`
			})
		});

		if (!tokenResponse.ok) {
			throw error(500, 'Failed to exchange code for token');
		}

		const tokenData: GitHubTokenResponse = await tokenResponse.json();

		if (!tokenData.access_token) {
			throw error(500, 'No access token received from GitHub');
		}

		// Fetch user data from GitHub
		const userResponse = await fetch('https://api.github.com/user', {
			headers: {
				Authorization: `Bearer ${tokenData.access_token}`,
				Accept: 'application/vnd.github.v3+json'
			}
		});

		if (!userResponse.ok) {
			throw error(500, 'Failed to fetch user data from GitHub');
		}

		const githubUser: GitHubUser = await userResponse.json();

		// Get user's primary email if not public
		let userEmail = githubUser.email;
		if (!userEmail) {
			const emailsResponse = await fetch('https://api.github.com/user/emails', {
				headers: {
					Authorization: `Bearer ${tokenData.access_token}`,
					Accept: 'application/vnd.github.v3+json'
				}
			});

			if (emailsResponse.ok) {
				const emails: GitHubEmail[] = await emailsResponse.json();
				const primaryEmail = emails.find((e) => e.primary && e.verified);
				userEmail = primaryEmail?.email || emails[0]?.email || null;
			}
		}

		if (!userEmail) {
			throw error(400, 'Could not retrieve email from GitHub account');
		}

		// Check if user exists in profiles table
		const { data: existingProfile } = await supabaseAdmin
			.from('profiles')
			.select('id')
			.eq('github_username', githubUser.login)
			.single();

		let userId: string;

		let isNewUser = false;

		if (existingProfile) {
			// Update existing user's token
			userId = existingProfile.id;
			await supabaseAdmin
				.from('profiles')
				.update({
					github_token: tokenData.access_token,
					email: userEmail
				})
				.eq('id', userId);
		} else {
			// Create new user profile
			isNewUser = true;
			const newUserId = crypto.randomUUID();
			const { error: insertError } = await supabaseAdmin.from('profiles').insert({
				id: newUserId,
				email: userEmail,
				github_username: githubUser.login,
				github_token: tokenData.access_token,
				plan: 'free'
			});

			if (insertError) {
				console.error('Failed to create user profile:', insertError);
				throw error(500, 'Failed to create user profile');
			}

			userId = newUserId;
		}

		// Track signup or login event
		await trackEvent(
			isNewUser ? EVENTS.SIGNUP_COMPLETED : EVENTS.LOGIN_COMPLETED,
			{ provider: 'github' },
			userId
		);

		// Create session token
		const sessionToken = crypto.randomUUID();
		const sessionExpiry = new Date();
		sessionExpiry.setDate(sessionExpiry.getDate() + 7); // 7 days

		// Store session in cookie
		cookies.set('session', JSON.stringify({ userId, token: sessionToken }), {
			path: '/',
			httpOnly: true,
			secure: !dev,
			sameSite: 'lax',
			expires: sessionExpiry
		});

		// Clear intended plan cookie if it exists
		cookies.delete('intended_plan', { path: '/' });

		// Check for checkout redirect
		const checkoutTier = cookies.get('checkout_tier');
		if (checkoutTier) {
			cookies.delete('checkout_tier', { path: '/' });
			// Redirect to a page that will initiate checkout
			throw redirect(302, `/dashboard?checkout=${checkoutTier}`);
		}
	} catch (err) {
		console.error('OAuth callback error:', err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		throw error(500, 'Authentication failed');
	}

	throw redirect(302, '/dashboard');
};
