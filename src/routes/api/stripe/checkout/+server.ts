import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createCheckoutSession, createRegenerateCheckout, type ProductType } from '$lib/server/stripe';
import { supabaseAdmin } from '$lib/server/supabase';
import { trackCheckoutStarted } from '$lib/utils/analytics';
import { PUBLIC_APP_URL } from '$env/static/public';

export const POST: RequestHandler = async ({ request, cookies }) => {
  // Verify authentication
  const session = cookies.get('session');
  if (!session) {
    return json({ success: false, message: 'Please log in to continue' }, { status: 401 });
  }

  let userId: string;
  try {
    const parsed = JSON.parse(session);
    userId = parsed.userId;
    if (!userId) {
      return json({ success: false, message: 'Invalid session' }, { status: 401 });
    }
  } catch {
    return json({ success: false, message: 'Invalid session' }, { status: 401 });
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, email')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error('[Checkout] Profile error:', profileError);
    return json({ success: false, message: 'Failed to retrieve user profile. Please try logging out and back in.' }, { status: 500 });
  }

  if (!profile) {
    return json({ success: false, message: 'User profile not found. Please try logging out and back in.' }, { status: 404 });
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
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return json({ success: false, message: `Failed to create regeneration checkout: ${errorMessage}` }, { status: 500 });
    }
  }

  // Validate product type for standard checkout
  if (!product || !['single', 'pro', 'team'].includes(product)) {
    return json({ success: false, message: 'Invalid product type. Must be: single, pro, or team' }, { status: 400 });
  }

  // For single repo purchase, require repoUrl
  if (product === 'single' && !repoUrl) {
    return json({ success: false, message: 'Repository URL required for single repo purchase' }, { status: 400 });
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
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';

    // Check if it's a configuration error
    if (err instanceof Error && err.message.includes('not configured')) {
      return json({ success: false, message: 'Payment system not fully configured. Please contact support.' }, { status: 500 });
    }

    return json({ success: false, message: `Failed to create checkout session: ${errorMessage}` }, { status: 500 });
  }
};
