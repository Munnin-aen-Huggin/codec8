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

    // Get license key - try purchased_repos first (for single repo), then licenses table
    let licenseKey: string | null = null;
    let purchasedRepoId: string | null = null;
    let purchasedRepoName: string | null = null;

    // For single repo purchases, check purchased_repos
    if (checkoutSession.metadata?.product === 'single' || checkoutSession.metadata?.repoUrl) {
      const { data: purchasedRepo } = await supabaseAdmin
        .from('purchased_repos')
        .select('id, license_key, repo_name, repo_url')
        .eq('user_id', userId)
        .order('purchased_at', { ascending: false })
        .limit(1)
        .single();

      if (purchasedRepo) {
        licenseKey = purchasedRepo.license_key;
        purchasedRepoId = purchasedRepo.id;
        purchasedRepoName = purchasedRepo.repo_name;
      }
    }

    // Fall back to licenses table if no license key found
    if (!licenseKey) {
      const { data: license } = await supabaseAdmin
        .from('licenses')
        .select('license_key, tier, activated_at')
        .eq('user_id', userId)
        .order('activated_at', { ascending: false })
        .limit(1)
        .single();

      if (license) {
        licenseKey = license.license_key;
      }
    }

    const tier = checkoutSession.metadata?.product || checkoutSession.metadata?.tier || 'pro';

    return {
      success: checkoutSession.payment_status === 'paid',
      tier,
      email: profile?.email,
      plan: profile?.plan,
      licenseKey,
      purchasedRepoId,
      purchasedRepoName,
      repoUrl: checkoutSession.metadata?.repoUrl
    };
  } catch (err) {
    console.error('Error verifying checkout session:', err);

    // Still show success page if webhook already processed
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('plan, subscription_tier, subscription_status')
      .eq('id', userId)
      .single();

    // Check for purchased repos first
    const { data: purchasedRepo } = await supabaseAdmin
      .from('purchased_repos')
      .select('id, license_key, repo_name, repo_url')
      .eq('user_id', userId)
      .order('purchased_at', { ascending: false })
      .limit(1)
      .single();

    if (purchasedRepo) {
      return {
        success: true,
        tier: 'single',
        plan: 'single',
        licenseKey: purchasedRepo.license_key,
        purchasedRepoId: purchasedRepo.id,
        purchasedRepoName: purchasedRepo.repo_name,
        repoUrl: purchasedRepo.repo_url
      };
    }

    // Check for subscription
    if (profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing') {
      const { data: license } = await supabaseAdmin
        .from('licenses')
        .select('license_key, tier')
        .eq('user_id', userId)
        .order('activated_at', { ascending: false })
        .limit(1)
        .single();

      return {
        success: true,
        tier: profile.subscription_tier || 'pro',
        plan: profile.subscription_tier || profile.plan,
        licenseKey: license?.license_key
      };
    }

    // Legacy plan check
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
