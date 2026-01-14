<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { repos } from '$lib/stores/repos';
  import { toast } from '$lib/stores/toast';
  import RepoCard from '$lib/components/RepoCard.svelte';
  import RepoCardSkeleton from '$lib/components/RepoCardSkeleton.svelte';
  import type { PageData } from './$types';
  import type { GitHubRepo } from '$lib/server/github';

  export let data: PageData;

  let showConnectModal = false;
  let connectingRepoId: number | null = null;
  let disconnectingRepoId: string | null = null;
  let generatingRepoId: string | null = null;
  let checkoutLoading = false;

  // Extract usage data from page data
  $: ({ usageInfo, purchasedRepos } = data);

  // Calculate usage percentage
  $: usagePercent = usageInfo ? Math.round((usageInfo.used / usageInfo.limit) * 100) : 0;

  // Handle checkout redirect from login
  onMount(async () => {
    const checkoutTier = $page.url.searchParams.get('checkout');
    if (checkoutTier && ['single', 'pro', 'team'].includes(checkoutTier)) {
      // Clear the URL parameter
      goto('/dashboard', { replaceState: true });
      // Initiate checkout
      await initiateCheckout(checkoutTier);
    }
  });

  async function initiateCheckout(tier: string) {
    checkoutLoading = true;
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier })
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

<div class="min-h-screen bg-[#09090b]">
  <header class="bg-zinc-900 border-b border-zinc-800">
    <div class="container mx-auto px-6 py-4 flex justify-between items-center">
      <a href="/" class="text-xl font-bold text-white">CodeDoc AI</a>
      <div class="flex items-center gap-4">
        {#if isFreeUser}
          <button
            on:click={() => initiateCheckout('pro')}
            disabled={checkoutLoading}
            class="px-3 py-1.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-500 disabled:opacity-50"
          >
            {checkoutLoading ? 'Loading...' : 'Upgrade'}
          </button>
        {:else if hasSubscription}
          <span class="px-3 py-1 bg-emerald-900/50 text-emerald-400 text-sm font-medium rounded-full border border-emerald-500/50">
            {usageInfo?.tier}
          </span>
        {:else if hasPurchasedRepos}
          <span class="px-3 py-1 bg-zinc-800 text-zinc-300 text-sm font-medium rounded-full">
            Single Repo
          </span>
        {/if}
        <span class="text-zinc-400">
          {data.user.github_username}
        </span>
        <form action="/auth/logout" method="POST" class="inline">
          <button
            type="submit"
            class="text-zinc-500 hover:text-zinc-300"
            data-testid="logout-button"
          >
            Logout
          </button>
        </form>
      </div>
    </div>
  </header>

  <main class="container mx-auto px-6 py-8">
    <h1 class="text-3xl font-bold text-white mb-8">Dashboard</h1>

    <!-- Usage Stats (for subscribers) -->
    {#if usageInfo}
      <div class="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-white">{usageInfo.tier} Plan Usage</h2>
          <span class="text-zinc-400 text-sm">
            {usageInfo.used} / {usageInfo.limit} repos this month
          </span>
        </div>
        <div class="w-full bg-zinc-800 rounded-full h-2">
          <div
            class="h-2 rounded-full transition-all {usagePercent > 80 ? 'bg-amber-500' : 'bg-emerald-500'}"
            style="width: {usagePercent}%"
          ></div>
        </div>
        {#if usagePercent > 80}
          <p class="text-amber-400 text-sm mt-2">
            Approaching limit. <a href="/pricing" class="underline hover:no-underline">Upgrade for more</a>
          </p>
        {/if}
      </div>
    {/if}

    <!-- Purchased Repos Section (for single-repo customers) -->
    {#if hasPurchasedRepos}
      <div class="mb-8">
        <h2 class="text-xl font-semibold text-white mb-4">Purchased Repositories</h2>
        <div class="grid gap-4">
          {#each purchasedRepos as repo}
            <div class="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center justify-between">
              <div>
                <h3 class="text-white font-medium">{repo.repo_name || repo.repo_url}</h3>
                <p class="text-zinc-500 text-sm">
                  Purchased {new Date(repo.purchased_at).toLocaleDateString()}
                </p>
              </div>
              <div class="flex gap-3">
                <a
                  href="/dashboard/{repo.repository_id || repo.id}"
                  class="px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700"
                >
                  View Docs
                </a>
                <button
                  on:click={() => handleRegenerate(repo.repository_id || repo.id)}
                  disabled={checkoutLoading}
                  class="px-4 py-2 border border-zinc-700 text-zinc-300 rounded hover:border-zinc-600 disabled:opacity-50"
                >
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
      <div class="flex justify-between items-center mb-4">
        <div>
          <h2 class="text-xl font-semibold text-white">Connected Repositories</h2>
          <p class="text-sm text-zinc-500 mt-1">
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
          class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Connect Repo
        </button>
      </div>

      {#if data.githubError}
        <div class="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400">
          <p class="font-medium">Failed to fetch GitHub repositories</p>
          <p class="text-sm mt-1">{data.githubError}</p>
        </div>
      {/if}

      {#if !canConnectMore && data.user.plan === 'free' && !hasSubscription}
        <div class="mb-6 p-4 bg-amber-900/30 border border-amber-500/50 rounded-lg">
          <p class="text-amber-400 font-medium">Free plan limit reached</p>
          <p class="text-sm text-amber-300/70 mt-1">
            Upgrade to Pro for unlimited repositories.
          </p>
          <button
            on:click={() => initiateCheckout('pro')}
            disabled={checkoutLoading}
            class="inline-block mt-2 text-sm font-medium text-amber-400 underline hover:no-underline disabled:opacity-50"
          >
            {checkoutLoading ? 'Loading...' : 'Upgrade to Pro'}
          </button>
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
        <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-zinc-400">
          <p class="mb-4">No repositories connected yet</p>
          <a href="/dashboard/connect" class="text-emerald-400 hover:text-emerald-300 text-sm">
            Connect your first repository &rarr;
          </a>
        </div>
      {/if}
    </div>

    <!-- Upgrade CTA (for free users) -->
    {#if isFreeUser}
      <div class="mt-8 bg-gradient-to-r from-emerald-900/30 to-zinc-900 border border-emerald-500/30 rounded-lg p-6 text-center">
        <h3 class="text-xl font-semibold text-white mb-2">Unlock All Features</h3>
        <p class="text-zinc-400 mb-4">
          Get all 4 documentation types, private repos, and unlimited generations.
        </p>
        <a
          href="/pricing"
          class="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500"
        >
          View Plans &rarr;
        </a>
      </div>
    {/if}
  </main>
</div>

{#if showConnectModal}
  <div
    class="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
    on:click|self={() => (showConnectModal = false)}
    on:keydown={(e) => e.key === 'Escape' && (showConnectModal = false)}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
      <div class="p-6 border-b border-zinc-800 flex justify-between items-center">
        <h2 class="text-xl font-bold text-white">Connect a Repository</h2>
        <button
          on:click={() => (showConnectModal = false)}
          class="text-zinc-500 hover:text-zinc-300"
        >
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div class="p-6 overflow-y-auto flex-1">
        {#if availableNotConnected.length > 0}
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
          <div class="text-center text-zinc-400 py-8">
            <p>No more repositories available to connect.</p>
            <p class="text-sm mt-2 text-zinc-500">
              All your GitHub repositories are already connected.
            </p>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
