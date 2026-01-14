import { redirect } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabase';
import { fetchUserRepos } from '$lib/server/github';
import type { PageServerLoad } from './$types';

interface SessionData {
  userId: string;
  token: string;
}

// Subscription tier limits
const TIER_LIMITS: Record<string, number> = {
  pro: 30,
  team: 100
};

export const load: PageServerLoad = async ({ cookies }) => {
  const sessionCookie = cookies.get('session');
  console.log('[Dashboard] Session cookie:', sessionCookie ? 'present' : 'missing');
  if (!sessionCookie) {
    console.log('[Dashboard] No session cookie, redirecting to /');
    throw redirect(302, '/');
  }

  let userId: string;
  try {
    const session: SessionData = JSON.parse(sessionCookie);
    userId = session.userId;
  } catch {
    // Invalid session format, clear and redirect
    cookies.delete('session', { path: '/' });
    throw redirect(302, '/');
  }

  if (!userId) {
    cookies.delete('session', { path: '/' });
    throw redirect(302, '/');
  }

  // Fetch profile with subscription info
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error('[Dashboard] Profile fetch error:', profileError);
  }

  if (!profile) {
    console.log('[Dashboard] Profile not found for userId:', userId);
    cookies.delete('session', { path: '/' });
    throw redirect(302, '/');
  }
  console.log('[Dashboard] Profile found:', profile.github_username);

  // Fetch connected repositories
  const { data: connectedRepos } = await supabaseAdmin
    .from('repositories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // Get documentation status for each connected repo
  const repoIds = (connectedRepos || []).map((r) => r.id);
  let repoDocs: { repo_id: string; has_docs: boolean }[] = [];

  if (repoIds.length > 0) {
    const { data: docs } = await supabaseAdmin
      .from('documentation')
      .select('repo_id')
      .in('repo_id', repoIds);

    // Create a set of repo IDs that have docs
    const reposWithDocs = new Set((docs || []).map((d) => d.repo_id));
    repoDocs = repoIds.map((id) => ({ repo_id: id, has_docs: reposWithDocs.has(id) }));
  }

  // Fetch purchased repos (for single-repo customers)
  const { data: purchasedRepos } = await supabaseAdmin
    .from('purchased_repos')
    .select('*')
    .eq('user_id', userId)
    .order('purchased_at', { ascending: false });

  // Calculate usage info for subscribers
  let usageInfo: {
    used: number;
    limit: number;
    tier: string;
    resetDate: string | null;
  } | null = null;

  if (
    profile.subscription_tier &&
    ['pro', 'team'].includes(profile.subscription_tier) &&
    profile.subscription_status === 'active'
  ) {
    usageInfo = {
      used: profile.repos_used_this_month || 0,
      limit: TIER_LIMITS[profile.subscription_tier] || 30,
      tier: profile.subscription_tier === 'pro' ? 'Pro' : 'Team',
      resetDate: profile.current_period_end || null
    };
  }

  // Check if in trial
  const isTrialing = profile.subscription_status === 'trialing';
  const trialEndsAt = profile.trial_ends_at || null;

  let availableRepos: Awaited<ReturnType<typeof fetchUserRepos>> = [];
  let githubError: string | null = null;

  if (profile.github_token) {
    try {
      availableRepos = await fetchUserRepos(profile.github_token);
    } catch (err) {
      githubError = err instanceof Error ? err.message : 'Failed to fetch GitHub repos';
    }
  }

  // Check if user should see onboarding
  const shouldShowOnboarding = !profile.onboarded && (connectedRepos || []).length === 0;

  return {
    user: {
      id: profile.id,
      email: profile.email,
      github_username: profile.github_username,
      plan: profile.plan,
      subscription_status: profile.subscription_status || null,
      subscription_tier: profile.subscription_tier || null,
      onboarded: profile.onboarded || false
    },
    connectedRepos: connectedRepos || [],
    availableRepos,
    githubError,
    repoDocs,
    purchasedRepos: purchasedRepos || [],
    usageInfo,
    isTrialing,
    trialEndsAt,
    shouldShowOnboarding
  };
};
