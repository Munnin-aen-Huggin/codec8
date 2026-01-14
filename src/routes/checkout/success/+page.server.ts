import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { stripe } from '$lib/server/stripe';
import { supabaseAdmin } from '$lib/server/supabase';

export const load: PageServerLoad = async ({ url, cookies }) => {
  const sessionId = url.searchParams.get('session_id');

  // Verify user is logged in
  const session = cookies.get('session');
  if (!session) {
    throw redirect(302, '/auth/login');
  }

  let userId: string;
  try {
    const parsed = JSON.parse(session);
    userId = parsed.userId;
  } catch {
    throw redirect(302, '/auth/login');
  }

  if (!sessionId) {
    throw redirect(302, '/dashboard');
  }

  try {
    // Verify the checkout session
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    // Verify session belongs to this user
    if (checkoutSession.metadata?.userId !== userId) {
      throw error(403, 'Invalid session');
    }

    // Get updated user profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, email, github_username, plan')
      .eq('id', userId)
      .single();

    // Get license key
    const { data: license } = await supabaseAdmin
      .from('licenses')
      .select('license_key, tier, activated_at')
      .eq('user_id', userId)
      .order('activated_at', { ascending: false })
      .limit(1)
      .single();

    return {
      success: checkoutSession.payment_status === 'paid',
      tier: checkoutSession.metadata?.product || checkoutSession.metadata?.tier || 'pro',
      email: profile?.email,
      plan: profile?.plan,
      licenseKey: license?.license_key
    };
  } catch (err) {
    console.error('Error verifying checkout session:', err);

    // Still show success page if webhook already processed
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('plan')
      .eq('id', userId)
      .single();

    if (profile?.plan && profile.plan !== 'free') {
      const { data: license } = await supabaseAdmin
        .from('licenses')
        .select('license_key, tier')
        .eq('user_id', userId)
        .order('activated_at', { ascending: false })
        .limit(1)
        .single();

      return {
        success: true,
        tier: profile.plan,
        plan: profile.plan,
        licenseKey: license?.license_key
      };
    }

    throw redirect(302, '/dashboard');
  }
};
