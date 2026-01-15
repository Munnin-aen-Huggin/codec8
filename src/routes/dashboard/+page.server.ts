import { redirect } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabase';
import { fetchUserRepos } from '$lib/server/github';
import { getActiveAlerts, type StalenessAlert } from '$lib/server/staleness';
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

// Addon info interface
interface AddonInfo {
  unlimitedRegen: boolean;
  unlimitedRegenExpires: string | null;
  extraRepos: number;
  extraReposExpires: string | null;
}

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

  // Calculate usage info for subscribers (will be updated after effective tier is determined)
  let usageInfo: {
    used: number;
    limit: number;
    tier: string;
    resetDate: string | null;
  } | null = null;

  // Check if in trial (will be updated after effective tier is determined)
  let isTrialing = profile.subscription_status === 'trialing';
  const trialEndsAt = profile.trial_ends_at || null;

  // Determine effective subscription tier - check user's profile first, then team membership
  let effectiveSubscriptionTier = profile.subscription_tier;
  let effectiveSubscriptionStatus = profile.subscription_status;

  // If user doesn't have their own subscription, check if they're a team member
  if (!effectiveSubscriptionTier || !['pro', 'team', 'enterprise'].includes(effectiveSubscriptionTier)) {
    // Check team membership
    const { data: membership } = await supabaseAdmin
      .from('team_members')
      .select('team_id, role, teams(owner_id)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (membership && membership.teams) {
      // Get team owner's subscription info
      const teamOwner = membership.teams as { owner_id: string };
      const { data: ownerProfile } = await supabaseAdmin
        .from('profiles')
        .select('subscription_tier, subscription_status, addon_unlimited_regen, addon_unlimited_regen_expires, addon_extra_repos, addon_extra_repos_expires')
        .eq('id', teamOwner.owner_id)
        .single();

      if (ownerProfile) {
        effectiveSubscriptionTier = ownerProfile.subscription_tier;
        effectiveSubscriptionStatus = ownerProfile.subscription_status;
        // Also inherit team-level addon info if available
        if (!profile.addon_unlimited_regen && ownerProfile.addon_unlimited_regen) {
          profile.addon_unlimited_regen = ownerProfile.addon_unlimited_regen;
          profile.addon_unlimited_regen_expires = ownerProfile.addon_unlimited_regen_expires;
        }
        if (!profile.addon_extra_repos && ownerProfile.addon_extra_repos) {
          profile.addon_extra_repos = ownerProfile.addon_extra_repos;
          profile.addon_extra_repos_expires = ownerProfile.addon_extra_repos_expires;
        }
        console.log(`[Dashboard] User ${userId} inherits tier ${effectiveSubscriptionTier} from team owner ${teamOwner.owner_id}`);
      }
    }
  }

  // Get addon info - now using effective tier
  let addonInfo: AddonInfo | null = null;
  if (effectiveSubscriptionTier && ['pro', 'team', 'enterprise'].includes(effectiveSubscriptionTier)) {
    addonInfo = {
      unlimitedRegen: profile.addon_unlimited_regen || false,
      unlimitedRegenExpires: profile.addon_unlimited_regen_expires || null,
      extraRepos: profile.addon_extra_repos || 0,
      extraReposExpires: profile.addon_extra_repos_expires || null
    };
  }

  // Update isTrialing based on effective status
  isTrialing = effectiveSubscriptionStatus === 'trialing';

  // Calculate usage info using effective subscription tier
  if (
    effectiveSubscriptionTier &&
    ['pro', 'team', 'enterprise'].includes(effectiveSubscriptionTier) &&
    (effectiveSubscriptionStatus === 'active' || effectiveSubscriptionStatus === 'trialing')
  ) {
    const tierLabel = effectiveSubscriptionTier === 'pro' ? 'Pro' : effectiveSubscriptionTier === 'team' ? 'Team' : 'Enterprise';
    usageInfo = {
      used: profile.repos_used_this_month || 0,
      limit: effectiveSubscriptionTier === 'enterprise' ? 9999 : (TIER_LIMITS[effectiveSubscriptionTier] || 30),
      tier: tierLabel,
      resetDate: profile.current_period_end || null
    };
  }

  // Get user's team ID (for team add-ons) - use effective tier
  let userTeamId: string | null = null;
  if (effectiveSubscriptionTier === 'team' || effectiveSubscriptionTier === 'enterprise') {
    // First check default_team_id on profile
    if (profile.default_team_id) {
      userTeamId = profile.default_team_id;
    } else {
      // Check if user owns a team
      const { data: ownedTeam } = await supabaseAdmin
        .from('teams')
        .select('id')
        .eq('owner_id', userId)
        .single();

      if (ownedTeam) {
        userTeamId = ownedTeam.id;
        // Update profile with default team
        await supabaseAdmin
          .from('profiles')
          .update({ default_team_id: ownedTeam.id })
          .eq('id', userId);
      } else {
        // Check if user is a member of a team
        const { data: membership } = await supabaseAdmin
          .from('team_members')
          .select('team_id')
          .eq('user_id', userId)
          .eq('status', 'active')
          .single();

        if (membership) {
          userTeamId = membership.team_id;
          await supabaseAdmin
            .from('profiles')
            .update({ default_team_id: membership.team_id })
            .eq('id', userId);
        } else {
          // Auto-create team for Team/Enterprise subscribers without a team
          const teamName = profile.github_username
            ? `${profile.github_username}'s Team`
            : 'My Team';

          const teamSlug = (profile.github_username || 'team')
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-')
            .slice(0, 30);

          const { data: newTeam } = await supabaseAdmin
            .from('teams')
            .insert({
              name: teamName,
              slug: `${teamSlug}-${Date.now().toString(36)}`,
              owner_id: userId,
              max_seats: profile.subscription_tier === 'enterprise' ? 9999 : 5,
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          if (newTeam) {
            userTeamId = newTeam.id;
            // Add owner as team member
            await supabaseAdmin
              .from('team_members')
              .insert({
                team_id: newTeam.id,
                user_id: userId,
                role: 'owner',
                status: 'active',
                invited_by: userId,
                joined_at: new Date().toISOString()
              });
            // Update profile with default team
            await supabaseAdmin
              .from('profiles')
              .update({ default_team_id: newTeam.id })
              .eq('id', userId);
            console.log(`Auto-created team ${newTeam.id} for user ${userId}`);
          }
        }
      }
    }
  }

  // Fetch stale doc alerts
  let staleAlerts: StalenessAlert[] = [];
  try {
    staleAlerts = await getActiveAlerts(userId);
  } catch (err) {
    console.error('[Dashboard] Error fetching stale alerts:', err);
  }

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
      subscription_status: effectiveSubscriptionStatus || profile.subscription_status || null,
      subscription_tier: effectiveSubscriptionTier || profile.subscription_tier || null,
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
    shouldShowOnboarding,
    addonInfo,
    staleAlerts,
    userTeamId
  };
};
