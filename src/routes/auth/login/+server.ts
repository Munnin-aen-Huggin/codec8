import { redirect } from '@sveltejs/kit';
import { GITHUB_CLIENT_ID } from '$env/static/private';
import { PUBLIC_APP_URL } from '$env/static/public';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies, url }) => {
  // Generate random state for CSRF protection
  const state = crypto.randomUUID().replace(/-/g, '');
  
  // Store state in cookie
  cookies.set('oauth_state', state, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 10 // 10 minutes
  });

  // Store plan if provided
  const plan = url.searchParams.get('plan');
  if (plan) {
    cookies.set('intended_plan', plan, {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 10
    });
  }

  // Build GitHub OAuth URL
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: `${PUBLIC_APP_URL}/auth/callback`,
    scope: 'read:user user:email repo',
    state
  });

  throw redirect(302, `https://github.com/login/oauth/authorize?${params}`);
};
