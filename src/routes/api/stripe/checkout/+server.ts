import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createCheckoutSession, createRegenerateCheckout, type ProductType } from '$lib/server/stripe';
import { supabaseAdmin } from '$lib/server/supabase';
import { trackCheckoutStarted } from '$lib/utils/analytics';
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

  // Get user profile
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, email')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    throw error(404, 'User profile not found');
  }

  // Get request body
  const body = await request.json() as {
    product?: string;
    repoUrl?: string;
    repoId?: string;
    type?: string;
  };

  const { product, repoUrl, repoId, type } = body;

  // Handle regeneration checkout separately
  if (type === 'regenerate' && repoId) {
    try {
      trackCheckoutStarted(profile.id, 'regenerate');

      const url = await createRegenerateCheckout({
        userId: profile.id,
        repoId,
        successUrl: `${PUBLIC_APP_URL}/dashboard/${repoId}?regenerated=true`,
        cancelUrl: `${PUBLIC_APP_URL}/dashboard/${repoId}`
      });

      return json({ success: true, url });
    } catch (err) {
      console.error('Regenerate checkout error:', err);
      throw error(500, 'Failed to create regeneration checkout');
    }
  }

  // Validate product type for standard checkout
  if (!product || !['single', 'pro', 'team'].includes(product)) {
    throw error(400, 'Invalid product type. Must be: single, pro, or team');
  }

  // For single repo purchase, require repoUrl
  if (product === 'single' && !repoUrl) {
    throw error(400, 'Repository URL required for single repo purchase');
  }

  try {
    // Track checkout started event
    trackCheckoutStarted(profile.id, product);

    // Create Stripe checkout session
    const url = await createCheckoutSession({
      userId: profile.id,
      userEmail: profile.email,
      product: product as ProductType,
      repoUrl,
      successUrl: `${PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${PUBLIC_APP_URL}/pricing`
    });

    return json({ success: true, url });
  } catch (err) {
    console.error('Checkout session error:', err);

    // Check if it's a configuration error
    if (err instanceof Error && err.message.includes('not configured')) {
      throw error(500, 'Payment system not fully configured. Please contact support.');
    }

    throw error(500, 'Failed to create checkout session');
  }
};
