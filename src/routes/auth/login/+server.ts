import { redirect } from '@sveltejs/kit';
import { GITHUB_CLIENT_ID } from '$env/static/private';
import { PUBLIC_APP_URL } from '$env/static/public';
import { dev } from '$app/environment';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies, url }) => {
  // Generate random state for CSRF protection
  const state = crypto.randomUUID().replace(/-/g, '');

  // Store state in cookie
  cookies.set('oauth_state', state, {
    path: '/',
    httpOnly: true,
    secure: !dev,
    sameSite: 'lax',
    maxAge: 60 * 10 // 10 minutes
  });

  // Store plan if provided
  const plan = url.searchParams.get('plan');
  if (plan) {
    cookies.set('intended_plan', plan, {
      path: '/',
      httpOnly: true,
      secure: !dev,
      maxAge: 60 * 10
    });
  }

  // Store redirect intent for checkout flow
  // Support both formats: redirect=checkout&tier=X and intent=purchase&(tier=X|product=X)
  const redirectTo = url.searchParams.get('redirect');
  const intent = url.searchParams.get('intent');
  const tier = url.searchParams.get('tier');
  const product = url.searchParams.get('product');

  if ((redirectTo === 'checkout' && tier) || (intent === 'purchase' && (tier || product))) {
    // Use tier if provided, otherwise use product
    const checkoutTier = tier || product;
    if (checkoutTier) {
      cookies.set('checkout_tier', checkoutTier, {
        path: '/',
        httpOnly: true,
        secure: !dev,
        maxAge: 60 * 10
      });
    }
  }

  // Build GitHub OAuth URL (strip trailing slash from URL if present)
  const baseUrl = PUBLIC_APP_URL.replace(/\/$/, '');
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: `${baseUrl}/auth/callback`,
    scope: 'read:user user:email repo',
    state
  });

  throw redirect(302, `https://github.com/login/oauth/authorize?${params}`);
};
