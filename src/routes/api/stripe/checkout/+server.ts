import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createCheckoutSession, type PriceTier, PRICES } from '$lib/server/stripe';
import { supabaseAdmin } from '$lib/server/supabase';
import { PUBLIC_APP_URL } from '$env/static/public';

export const POST: RequestHandler = async ({ request, cookies }) => {
  // Verify authentication
  const session = cookies.get('session');
  if (!session) {
    throw error(401, 'Not authenticated');
  }

  let userId: string;
  try {
    const parsed = JSON.parse(session);
    userId = parsed.userId;
  } catch {
    throw error(401, 'Invalid session');
  }

  // Get request body
  const { tier } = await request.json() as { tier: string };

  // Validate tier
  if (!tier || !['ltd', 'pro', 'dfy'].includes(tier)) {
    throw error(400, 'Invalid tier. Must be: ltd, pro, or dfy');
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, email, plan')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    throw error(404, 'User profile not found');
  }

  // Check if user already has a paid plan
  if (profile.plan !== 'free') {
    throw error(400, `You already have a ${profile.plan.toUpperCase()} plan`);
  }

  try {
    // Create Stripe checkout session
    const checkoutSession = await createCheckoutSession({
      userId: profile.id,
      userEmail: profile.email,
      tier: tier as PriceTier,
      successUrl: `${PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${PUBLIC_APP_URL}/#pricing`
    });

    return json({
      success: true,
      url: checkoutSession.url,
      sessionId: checkoutSession.id
    });
  } catch (err) {
    console.error('Checkout session error:', err);

    // Check if it's a configuration error
    if (err instanceof Error && err.message.includes('not configured')) {
      throw error(500, 'Payment system not fully configured. Please contact support.');
    }

    throw error(500, 'Failed to create checkout session');
  }
};
