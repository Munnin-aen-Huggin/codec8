import { redirect, error } from '@sveltejs/kit';
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from '$env/static/private';
import { PUBLIC_APP_URL } from '$env/static/public';
import { supabaseAdmin } from '$lib/server/supabase';
import { trackEvent, EVENTS } from '$lib/server/analytics';
import { createSession, setSessionCookie } from '$lib/server/session';
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
		console.log('[Auth Callback] Starting token exchange...');

		// Exchange code for access token
		const baseUrl = PUBLIC_APP_URL.replace(/\/$/, '');
		console.log('[Auth Callback] Using redirect_uri:', `${baseUrl}/auth/callback`);

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
				redirect_uri: `${baseUrl}/auth/callback`
			})
		});

		if (!tokenResponse.ok) {
			throw error(500, 'Failed to exchange code for token');
		}

		const tokenData: GitHubTokenResponse = await tokenResponse.json();

		if (!tokenData.access_token) {
			console.error('[Auth Callback] No access token in response:', tokenData);
			throw error(500, 'No access token received from GitHub');
		}

		console.log('[Auth Callback] Got access token, fetching user...');

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

		console.log('[Auth Callback] Got user email:', userEmail);

		// Check if user exists in profiles table (by github_username or email)
		console.log('[Auth Callback] Looking for profile with github_username:', githubUser.login);
		let { data: existingProfile, error: lookupError } = await supabaseAdmin
			.from('profiles')
			.select('id')
			.eq('github_username', githubUser.login)
			.single();

		// If not found by github_username, try by email
		if (!existingProfile && userEmail) {
			console.log('[Auth Callback] Not found by username, trying email:', userEmail);
			const { data: profileByEmail } = await supabaseAdmin
				.from('profiles')
				.select('id')
				.eq('email', userEmail)
				.single();
			if (profileByEmail) {
				existingProfile = profileByEmail;
				console.log('[Auth Callback] Found existing profile by email');
			}
		}

		if (lookupError && lookupError.code !== 'PGRST116') {
			console.error('[Auth Callback] Profile lookup error:', lookupError);
		}

		let userId: string;

		let isNewUser = false;

		if (existingProfile) {
			// Update existing user's token using RPC function (bypasses RLS)
			userId = existingProfile.id;
			console.log('[Auth Callback] Found existing profile, userId:', userId);
			const { error: updateError } = await supabaseAdmin.rpc('update_user_profile', {
				p_id: userId,
				p_github_token: tokenData.access_token,
				p_email: userEmail
			});
			if (updateError) {
				console.error('[Auth Callback] Profile update error:', updateError);
				// Fallback to direct update
				await supabaseAdmin
					.from('profiles')
					.update({
						github_token: tokenData.access_token,
						email: userEmail
					})
					.eq('id', userId);
			}
		} else {
			// Create new user profile using RPC function (bypasses RLS with SECURITY DEFINER)
			isNewUser = true;
			const newUserId = crypto.randomUUID();
			console.log('[Auth Callback] Creating new profile with userId:', newUserId);

			const { data: createdUserId, error: rpcError } = await supabaseAdmin.rpc('create_user_profile', {
				p_id: newUserId,
				p_email: userEmail,
				p_github_username: githubUser.login,
				p_github_token: tokenData.access_token,
				p_plan: 'free'
			});

			if (rpcError) {
				console.error('[Auth Callback] RPC create_user_profile failed:', JSON.stringify(rpcError, null, 2));

				// Fallback: Try direct insert (in case RPC function doesn't exist yet)
				console.log('[Auth Callback] Falling back to direct insert...');
				const { error: insertError } = await supabaseAdmin.from('profiles').insert({
					id: newUserId,
					email: userEmail,
					github_username: githubUser.login,
					github_token: tokenData.access_token,
					plan: 'free'
				});

				if (insertError) {
					console.error('[Auth Callback] Direct insert also failed:', JSON.stringify(insertError, null, 2));

					// If it's a unique constraint violation, try to find the existing profile
					if (insertError.code === '23505') {
						console.log('[Auth Callback] Unique constraint violation, trying to find existing profile');
						const { data: existingByUsername } = await supabaseAdmin
							.from('profiles')
							.select('id')
							.eq('github_username', githubUser.login)
							.single();

						if (existingByUsername) {
							userId = existingByUsername.id;
							isNewUser = false;
							console.log('[Auth Callback] Found existing profile after conflict:', userId);
						} else {
							throw error(500, `Failed to create user profile: ${insertError.message || insertError.code}`);
						}
					} else {
						throw error(500, `Failed to create user profile: ${insertError.message || insertError.code}`);
					}
				} else {
					userId = newUserId;
					console.log('[Auth Callback] Profile created via direct insert');
				}
			} else {
				// RPC succeeded - use returned user ID (handles upsert)
				userId = createdUserId || newUserId;
				if (createdUserId && createdUserId !== newUserId) {
					// User already existed, was updated
					isNewUser = false;
					console.log('[Auth Callback] Profile updated via RPC, existing userId:', userId);
				} else {
					console.log('[Auth Callback] Profile created via RPC, userId:', userId);
				}
			}
		}

		// Track signup or login event
		await trackEvent(
			isNewUser ? EVENTS.SIGNUP_COMPLETED : EVENTS.LOGIN_COMPLETED,
			{ provider: 'github' },
			userId
		);

		// Create server-side session (CRITICAL SECURITY FIX)
		console.log('[Auth Callback] Creating server-side session for userId:', userId);
		const sessionResult = await createSession(userId);

		if (!sessionResult) {
			console.error('[Auth Callback] Failed to create session');
			throw error(500, 'Failed to create session');
		}

		// Set session cookie with the token
		setSessionCookie(cookies, userId, sessionResult.token, sessionResult.expiresAt, dev);
		console.log('[Auth Callback] Session created and cookie set successfully');

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

