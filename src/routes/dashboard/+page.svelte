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

  // Handle checkout redirect from login
  onMount(async () => {
    const checkoutTier = $page.url.searchParams.get('checkout');
    if (checkoutTier && ['ltd', 'pro', 'dfy'].includes(checkoutTier)) {
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

  // Track which repos have documentation
  $: repoDocsMap = new Map(data.repoDocs?.map((rd) => [rd.repo_id, rd.has_docs]) || []);

  $: {
    repos.setAvailable(data.availableRepos);
    repos.setConnected(data.connectedRepos);
  }

  $: connectedIds = new Set(data.connectedRepos.map((r) => r.github_repo_id));
  $: availableNotConnected = data.availableRepos.filter((r) => !connectedIds.has(r.id));

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

<div class="min-h-screen bg-gray-50">
  <header class="bg-white border-b">
    <div class="container mx-auto px-6 py-4 flex justify-between items-center">
      <a href="/" class="text-xl font-bold text-gray-900">CodeDoc AI</a>
      <div class="flex items-center gap-4">
        {#if data.user.plan === 'free'}
          <button
            on:click={() => initiateCheckout('ltd')}
            disabled={checkoutLoading}
            class="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {checkoutLoading ? 'Loading...' : 'Upgrade'}
          </button>
        {:else}
          <span class="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
            {data.user.plan.toUpperCase()}
          </span>
        {/if}
        <span class="text-gray-600">
          {data.user.github_username}
        </span>
        <form action="/auth/logout" method="POST" class="inline">
          <button
            type="submit"
            class="text-gray-500 hover:text-gray-700"
            data-testid="logout-button"
          >
            Logout
          </button>
        </form>
      </div>
    </div>
  </header>

  <main class="container mx-auto px-6 py-8">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Your Repositories</h1>
        <p class="text-sm text-gray-500 mt-1">
          {data.connectedRepos.length}
          {#if data.user.plan === 'free'}
            / {repoLimit} repository connected
          {:else}
            repositories connected
          {/if}
        </p>
      </div>
      <button
        on:click={() => (showConnectModal = true)}
        disabled={!canConnectMore}
        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        + Connect Repo
      </button>
    </div>

    {#if data.githubError}
      <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <p class="font-medium">Failed to fetch GitHub repositories</p>
        <p class="text-sm mt-1">{data.githubError}</p>
      </div>
    {/if}

    {#if !canConnectMore && data.user.plan === 'free'}
      <div class="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p class="text-amber-800 font-medium">Free plan limit reached</p>
        <p class="text-sm text-amber-700 mt-1">
          Upgrade to the Lifetime Deal for unlimited repositories.
        </p>
        <button
          on:click={() => initiateCheckout('ltd')}
          disabled={checkoutLoading}
          class="inline-block mt-2 text-sm font-medium text-amber-800 underline hover:no-underline disabled:opacity-50"
        >
          {checkoutLoading ? 'Loading...' : 'Upgrade now — $299'}
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
      <div class="bg-white rounded-xl border p-8 text-center text-gray-500">
        <p class="mb-4">No repositories connected yet.</p>
        <p class="text-sm">Click "Connect Repo" to get started.</p>
      </div>
    {/if}
  </main>
</div>

{#if showConnectModal}
  <div
    class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    on:click|self={() => (showConnectModal = false)}
    on:keydown={(e) => e.key === 'Escape' && (showConnectModal = false)}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
      <div class="p-6 border-b flex justify-between items-center">
        <h2 class="text-xl font-bold text-gray-900">Connect a Repository</h2>
        <button
          on:click={() => (showConnectModal = false)}
          class="text-gray-400 hover:text-gray-600"
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
          <div class="text-center text-gray-500 py-8">
            <p>No more repositories available to connect.</p>
            <p class="text-sm mt-2">
              All your GitHub repositories are already connected.
            </p>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
