<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { repos } from '$lib/stores/repos';
  import { toast } from '$lib/stores/toast';
  import RepoCard from '$lib/components/RepoCard.svelte';
  import RepoCardSkeleton from '$lib/components/RepoCardSkeleton.svelte';
  import OnboardingWizard from '$lib/components/OnboardingWizard.svelte';
  import type { PageData } from './$types';
  import type { GitHubRepo } from '$lib/server/github';

  export let data: PageData;

  // Track if onboarding should be shown
  let showOnboarding = data.shouldShowOnboarding;

  async function handleOnboardingComplete() {
    showOnboarding = false;
    // Mark user as onboarded in the database
    try {
      await fetch('/api/user/onboarded', { method: 'POST' });
    } catch (err) {
      console.error('Failed to mark onboarding complete:', err);
    }
  }

  function handleOnboardingConnect() {
    showOnboarding = false;
    showConnectModal = true;
  }

  let showConnectModal = false;
  let connectingRepoId: number | null = null;
  let disconnectingRepoId: string | null = null;
  let generatingRepoId: string | null = null;
  let checkoutLoading = false;

  // Extract usage data from page data
  $: ({ usageInfo, purchasedRepos, addonInfo, staleAlerts } = data);

  // Track dismissed alerts locally
  let dismissedAlertIds: Set<string> = new Set();
  $: visibleAlerts = (staleAlerts || []).filter(a => !dismissedAlertIds.has(a.id));

  async function dismissAlert(alertId: string) {
    dismissedAlertIds.add(alertId);
    dismissedAlertIds = dismissedAlertIds; // Trigger reactivity

    try {
      await fetch('/api/docs/staleness', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId })
      });
    } catch (err) {
      console.error('Failed to dismiss alert:', err);
    }
  }

  let addonCheckoutLoading: string | null = null;

  async function purchaseAddon(addonType: string) {
    addonCheckoutLoading = addonType;
    try {
      const response = await fetch('/api/stripe/addon-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addonType })
      });

      const result = await response.json();
      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        toast.error(result.message || 'Failed to start checkout');
        addonCheckoutLoading = null;
      }
    } catch (err) {
      console.error('Addon checkout error:', err);
      toast.error('Failed to start checkout');
      addonCheckoutLoading = null;
    }
  }

  // Calculate usage percentage
  $: usagePercent = usageInfo ? Math.round((usageInfo.used / usageInfo.limit) * 100) : 0;

  // Handle checkout redirect from login
  onMount(async () => {
    const checkoutTier = $page.url.searchParams.get('checkout');
    if (checkoutTier && ['single', 'pro', 'team'].includes(checkoutTier)) {
      // Clear the URL parameter
      goto('/dashboard', { replaceState: true });

      // For single repo purchase, show a message to select a repo
      // (single requires a repo URL which we don't have from landing page)
      if (checkoutTier === 'single') {
        toast.info('Connect a repository below to purchase documentation for it.');
        showConnectModal = true;
      } else {
        // For pro/team subscriptions, initiate checkout directly
        await initiateCheckout(checkoutTier);
      }
    }
  });

  async function initiateCheckout(product: string) {
    checkoutLoading = true;
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product })
      });

      const result = await response.json();

      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        toast.error(result.message || 'Failed to start checkout. Please try again.');
        checkoutLoading = false;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error('Failed to start checkout. Please try again.');
      checkoutLoading = false;
    }
  }

  async function handleRegenerate(repoId: string) {
    checkoutLoading = true;
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'regenerate', repoId })
      });
      const result = await response.json();
      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        toast.error(result.message || 'Failed to start checkout.');
        checkoutLoading = false;
      }
    } catch (err) {
      console.error('Regenerate checkout error:', err);
      toast.error('Failed to start checkout.');
      checkoutLoading = false;
    }
  }

  // Track which repos have documentation
  $: repoDocsMap = new Map(data.repoDocs?.map((rd) => [rd.repo_id, rd.has_docs]) || []);

  $: {
    repos.setAvailable(data.availableRepos);
    repos.setConnected(data.connectedRepos);
  }

  $: connectedIds = new Set(data.connectedRepos.map((r) => r.github_repo_id));
  $: availableNotConnected = data.availableRepos.filter((r) => !connectedIds.has(r.id));

  // Determine if user is a subscriber with usage tracking
  $: hasSubscription = usageInfo !== null;
  // Determine if user has purchased repos (single-repo customers)
  $: hasPurchasedRepos = purchasedRepos && purchasedRepos.length > 0;
  // Free users have no subscription and no purchased repos
  $: isFreeUser = !hasSubscription && !hasPurchasedRepos;

  $: repoLimit = data.user.plan === 'free' ? 1 : Infinity;
  $: canConnectMore = data.connectedRepos.length < repoLimit;

  async function connectRepo(repo: GitHubRepo) {
    if (!canConnectMore) return;

    connectingRepoId = repo.id;
    try {
      const response = await fetch('/api/repos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          github_repo_id: repo.id,
          name: repo.name,
          full_name: repo.full_name,
          private: repo.private,
          default_branch: repo.default_branch,
          description: repo.description,
          language: repo.language
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to connect repository');
      }

      const newRepo = await response.json();
      repos.addConnected(newRepo);
      data.connectedRepos = [...data.connectedRepos, newRepo];
      showConnectModal = false;
      toast.success(`${newRepo.name} connected successfully!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to connect repository');
    } finally {
      connectingRepoId = null;
    }
  }

  async function disconnectRepo(repoId: string) {
    if (!confirm('Are you sure you want to disconnect this repository?')) return;

    disconnectingRepoId = repoId;
    try {
      const response = await fetch(`/api/repos/${repoId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to disconnect repository');
      }

      repos.removeConnected(repoId);
      data.connectedRepos = data.connectedRepos.filter((r) => r.id !== repoId);
      toast.success('Repository disconnected');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to disconnect repository');
    } finally {
      disconnectingRepoId = null;
    }
  }

  async function generateDocs(repoId: string) {
    generatingRepoId = repoId;
    try {
      const response = await fetch('/api/docs/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoId,
          types: ['readme', 'api', 'architecture', 'setup']
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate documentation');
      }

      const result = await response.json();

      if (result.errors?.length > 0) {
        result.errors.forEach((e: { type: string; error: string }) => {
          toast.warning(`${e.type}: ${e.error}`);
        });
      }

      // Update the docs map to show docs are ready
      if (result.docs?.length > 0) {
        repoDocsMap.set(repoId, true);
        repoDocsMap = repoDocsMap; // Trigger reactivity
        toast.success('Documentation generated successfully!');
        // Navigate to the repo docs page
        goto(`/dashboard/${repoId}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate documentation');
    } finally {
      generatingRepoId = null;
    }
  }
</script>

<svelte:head>
  <title>Dashboard - CodeDoc AI</title>
</svelte:head>

<div class="min-h-screen bg-dark-900">
  <!-- Header with glass effect -->
  <header class="glass-dark sticky top-0 z-50 border-b border-dark-500">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <a href="/" class="flex items-center gap-2.5 group">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-shadow">
            <svg class="w-5 h-5 text-dark-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span class="font-bold text-lg text-text-primary hidden sm:block group-hover:text-accent transition-colors">
            CodeDoc AI
          </span>
        </a>

        <!-- Nav Items -->
        <div class="flex items-center gap-4">
          {#if isFreeUser}
            <button
              on:click={() => initiateCheckout('pro')}
              disabled={checkoutLoading}
              class="btn-primary btn-sm pulse-glow"
            >
              {#if checkoutLoading}
                <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              {:else}
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              {/if}
              Upgrade
            </button>
          {:else if hasSubscription}
            <span class="badge-accent">
              {usageInfo?.tier}
            </span>
          {:else if hasPurchasedRepos}
            <span class="badge bg-dark-600 text-text-secondary border border-dark-400">
              Single Repo
            </span>
          {/if}

          <!-- User -->
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-700">
            <div class="w-6 h-6 rounded-full bg-gradient-to-br from-accent/50 to-accent-dark/50 flex items-center justify-center">
              <span class="text-xs font-semibold text-text-primary">
                {data.user.github_username?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <span class="text-sm text-text-secondary hidden sm:block max-w-[100px] truncate">
              {data.user.github_username}
            </span>
          </div>

          <form action="/auth/logout" method="POST" class="inline">
            <button
              type="submit"
              class="btn-ghost btn-sm text-text-muted hover:text-error"
              data-testid="logout-button"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span class="hidden sm:inline">Logout</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
    {#if showOnboarding}
      <OnboardingWizard
        on:complete={handleOnboardingComplete}
        on:connect={handleOnboardingConnect}
      />
    {:else}
      <!-- Stale Doc Alerts -->
      {#if visibleAlerts.length > 0}
        <div class="mb-6 space-y-3">
          {#each visibleAlerts as alert (alert.id)}
            <div class="p-4 bg-warning/10 border border-warning/30 rounded-xl flex items-start justify-between gap-4">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-warning flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p class="text-warning font-medium">
                    {#if alert.alert_type === 'stale'}
                      Documentation is {alert.days_stale} days old
                    {:else if alert.alert_type === 'code_changed'}
                      Code changed since last generation
                    {:else}
                      Documentation needs attention
                    {/if}
                  </p>
                  <p class="text-body-sm text-warning/70 mt-1">
                    {alert.repo_full_name || alert.repo_name || 'Repository'} may need regeneration.
                    <a href="/dashboard/{alert.repo_id}" class="underline hover:no-underline">View docs</a>
                  </p>
                </div>
              </div>
              <button
                on:click={() => dismissAlert(alert.id)}
                class="text-warning/60 hover:text-warning transition-colors p-1"
                aria-label="Dismiss alert"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          {/each}
        </div>
      {/if}

      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-h1 text-text-primary mb-2">Dashboard</h1>
        <p class="text-body text-text-secondary">Manage your repositories and documentation</p>
      </div>

      <!-- Usage Stats (for subscribers) -->
      {#if usageInfo}
        <div class="card p-6 mb-8">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <svg class="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 class="text-h4 text-text-primary">{usageInfo.tier} Plan</h2>
                <p class="text-body-sm text-text-muted">
                  {usageInfo.used} / {usageInfo.limit} repos this month
                </p>
              </div>
            </div>
            <span class="badge-accent">{usagePercent}% used</span>
          </div>
          <div class="w-full bg-dark-600 rounded-full h-2.5 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500 {usagePercent > 80 ? 'bg-warning' : 'bg-accent'}"
              style="width: {usagePercent}%"
            ></div>
          </div>
          {#if usagePercent > 80}
            <p class="text-warning text-body-sm mt-3 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Approaching limit. <a href="/pricing" class="underline hover:no-underline">Upgrade for more</a>
            </p>
          {/if}

          <!-- Active Add-ons -->
          {#if addonInfo && (addonInfo.unlimitedRegen || addonInfo.extraRepos > 0)}
            <div class="mt-4 pt-4 border-t border-dark-500">
              <p class="text-body-sm text-text-muted mb-2">Active Add-ons:</p>
              <div class="flex flex-wrap gap-2">
                {#if addonInfo.unlimitedRegen}
                  <span class="badge bg-accent/20 text-accent border border-accent/30">
                    <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Unlimited Regen
                  </span>
                {/if}
                {#if addonInfo.extraRepos > 0}
                  <span class="badge bg-accent/20 text-accent border border-accent/30">
                    <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    +{addonInfo.extraRepos * 10} Repos
                  </span>
                {/if}
              </div>
            </div>
          {/if}
        </div>

        <!-- Add-ons Upsell -->
        {#if hasSubscription && addonInfo}
          <div class="card p-6 mb-8">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <svg class="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <h2 class="text-h4 text-text-primary">Power-ups</h2>
                <p class="text-body-sm text-text-muted">Enhance your plan with add-ons</p>
              </div>
            </div>

            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <!-- Unlimited Regenerations -->
              {#if !addonInfo.unlimitedRegen}
                <div class="p-4 bg-dark-700 rounded-xl border border-dark-500 hover:border-accent/30 transition-colors">
                  <div class="flex items-start justify-between mb-3">
                    <div class="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <svg class="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span class="text-accent font-semibold">$29/mo</span>
                  </div>
                  <h3 class="text-text-primary font-medium mb-1">Unlimited Regenerations</h3>
                  <p class="text-body-sm text-text-muted mb-3">Remove the 5-minute cooldown between regenerations</p>
                  <button
                    on:click={() => purchaseAddon('unlimited_regen')}
                    disabled={addonCheckoutLoading === 'unlimited_regen'}
                    class="btn-secondary btn-sm w-full"
                  >
                    {addonCheckoutLoading === 'unlimited_regen' ? 'Loading...' : 'Add to Plan'}
                  </button>
                </div>
              {/if}

              <!-- Extra Repos -->
              <div class="p-4 bg-dark-700 rounded-xl border border-dark-500 hover:border-accent/30 transition-colors">
                <div class="flex items-start justify-between mb-3">
                  <div class="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <svg class="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <span class="text-accent font-semibold">$5/mo</span>
                </div>
                <h3 class="text-text-primary font-medium mb-1">+10 Extra Repos</h3>
                <p class="text-body-sm text-text-muted mb-3">Add 10 more repos to your monthly limit</p>
                <button
                  on:click={() => purchaseAddon('extra_repos')}
                  disabled={addonCheckoutLoading === 'extra_repos'}
                  class="btn-secondary btn-sm w-full"
                >
                  {addonCheckoutLoading === 'extra_repos' ? 'Loading...' : 'Add to Plan'}
                </button>
              </div>

              <!-- Analytics Link -->
              <a href="/dashboard/analytics" class="p-4 bg-dark-700 rounded-xl border border-dark-500 hover:border-accent/30 transition-colors block">
                <div class="flex items-start justify-between mb-3">
                  <div class="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <svg class="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span class="text-text-muted text-body-sm">Included</span>
                </div>
                <h3 class="text-text-primary font-medium mb-1">Usage Analytics</h3>
                <p class="text-body-sm text-text-muted">View detailed usage stats and trends</p>
              </a>
            </div>
          </div>
        {/if}
      {/if}

      <!-- Purchased Repos Section (for single-repo customers) -->
      {#if hasPurchasedRepos}
        <div class="mb-8">
          <h2 class="text-h3 text-text-primary mb-4">Purchased Repositories</h2>
          <div class="grid gap-4">
            {#each purchasedRepos as repo}
              <div class="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                    <svg class="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-text-primary font-semibold">{repo.repo_name || repo.repo_url}</h3>
                    <p class="text-text-muted text-body-sm">
                      Purchased {new Date(repo.purchased_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div class="flex gap-3">
                  <a
                    href="/dashboard/{repo.repository_id || repo.id}"
                    class="btn-primary btn-sm"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View Docs
                  </a>
                  <button
                    on:click={() => handleRegenerate(repo.repository_id || repo.id)}
                    disabled={checkoutLoading}
                    class="btn-secondary btn-sm"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Regenerate ($9)
                  </button>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Connected Repos Section -->
      <div>
        <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div>
            <h2 class="text-h3 text-text-primary">Connected Repositories</h2>
            <p class="text-body-sm text-text-muted mt-1">
              {data.connectedRepos.length}
              {#if data.user.plan === 'free' && !hasSubscription}
                / {repoLimit} repository connected
              {:else}
                repositories connected
              {/if}
            </p>
          </div>
          <button
            on:click={() => (showConnectModal = true)}
            disabled={!canConnectMore}
            class="btn-primary"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Connect Repository
          </button>
        </div>

        {#if data.githubError}
          <div class="mb-6 p-4 bg-error/10 border border-error/30 rounded-xl">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-error flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p class="text-error font-medium">Failed to fetch GitHub repositories</p>
                <p class="text-body-sm text-error/70 mt-1">{data.githubError}</p>
              </div>
            </div>
          </div>
        {/if}

        {#if !canConnectMore && data.user.plan === 'free' && !hasSubscription}
          <div class="mb-6 p-4 bg-warning/10 border border-warning/30 rounded-xl">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-warning flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p class="text-warning font-medium">Free plan limit reached</p>
                <p class="text-body-sm text-warning/70 mt-1">
                  Upgrade to Pro for unlimited repositories.
                </p>
                <button
                  on:click={() => initiateCheckout('pro')}
                  disabled={checkoutLoading}
                  class="btn-primary btn-sm mt-3"
                >
                  {checkoutLoading ? 'Loading...' : 'Upgrade to Pro'}
                </button>
              </div>
            </div>
          </div>
        {/if}

        {#if data.connectedRepos.length > 0}
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {#each data.connectedRepos as repo (repo.id)}
              <a href="/dashboard/{repo.id}" class="block">
                <RepoCard
                  connectedRepo={repo}
                  isConnected={true}
                  onDisconnect={() => disconnectRepo(repo.id)}
                  onGenerate={() => generateDocs(repo.id)}
                  loading={disconnectingRepoId === repo.id}
                  generating={generatingRepoId === repo.id}
                  hasDocumentation={repoDocsMap.get(repo.id) || false}
                />
              </a>
            {/each}
          </div>
        {:else}
          <div class="card p-8 text-center">
            <div class="w-16 h-16 rounded-2xl bg-dark-600 flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <p class="text-text-secondary mb-2">No repositories connected yet</p>
            <p class="text-body-sm text-text-muted mb-4">Connect a GitHub repository to generate documentation</p>
            <button on:click={() => (showConnectModal = true)} class="btn-primary">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Connect Your First Repository
            </button>
          </div>
        {/if}
      </div>

      <!-- Upgrade CTA (for free users) -->
      {#if isFreeUser}
        <div class="mt-8 card-hover p-8 bg-gradient-to-br from-accent/10 to-dark-800 border-accent/20">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="text-center md:text-left">
              <h3 class="text-h3 text-text-primary mb-2">Unlock All Features</h3>
              <p class="text-body text-text-secondary max-w-md">
                Get all 4 documentation types, private repos, and unlimited generations with our Pro plan.
              </p>
            </div>
            <a href="/pricing" class="btn-primary btn-lg pulse-glow whitespace-nowrap">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              View Plans
            </a>
          </div>
        </div>
      {/if}
    {/if}
  </main>
</div>

{#if showConnectModal}
  <div
    class="fixed inset-0 bg-dark-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    on:click|self={() => (showConnectModal = false)}
    on:keydown={(e) => e.key === 'Escape' && (showConnectModal = false)}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div class="bg-dark-800 border border-dark-500 rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col animate-fade-in-up">
      <div class="p-6 border-b border-dark-500 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <svg class="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 class="text-h3 text-text-primary">Connect a Repository</h2>
        </div>
        <button
          on:click={() => (showConnectModal = false)}
          class="w-8 h-8 rounded-lg bg-dark-600 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-dark-500 transition-colors"
          aria-label="Close modal"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="p-6 overflow-y-auto flex-1">
        {#if availableNotConnected.length > 0}
          <p class="text-body-sm text-text-muted mb-4">Select a repository from your GitHub account to generate documentation.</p>
          <div class="space-y-3">
            {#each availableNotConnected as repo (repo.id)}
              <RepoCard
                {repo}
                isConnected={false}
                onConnect={() => connectRepo(repo)}
                loading={connectingRepoId === repo.id}
              />
            {/each}
          </div>
        {:else}
          <div class="text-center py-12">
            <div class="w-16 h-16 rounded-2xl bg-dark-600 flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p class="text-text-secondary mb-1">All repositories connected</p>
            <p class="text-body-sm text-text-muted">
              All your GitHub repositories are already connected.
            </p>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
