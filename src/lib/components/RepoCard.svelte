<script lang="ts">
  import type { GitHubRepo } from '$lib/server/github';
  import type { Repository } from '$lib/types';

  export let repo: GitHubRepo | null = null;
  export let connectedRepo: Repository | null = null;
  export let isConnected: boolean = false;
  export let onConnect: (() => void) | null = null;
  export let onDisconnect: (() => void) | null = null;
  export let onGenerate: (() => void) | null = null;
  export let loading: boolean = false;
  export let generating: boolean = false;
  export let hasDocumentation: boolean = false;

  $: displayRepo = connectedRepo || repo;
  $: repoName = displayRepo?.name || '';
  $: fullName = displayRepo?.full_name || '';
  $: description = connectedRepo?.description || (repo?.description ?? '');
  $: language = connectedRepo?.language || (repo?.language ?? '');
  $: isPrivate = displayRepo?.private || false;

  const languageColors: Record<string, string> = {
    TypeScript: 'bg-blue-500',
    JavaScript: 'bg-yellow-400',
    Python: 'bg-green-500',
    Rust: 'bg-orange-500',
    Go: 'bg-cyan-500',
    Java: 'bg-red-500',
    Ruby: 'bg-red-600',
    PHP: 'bg-purple-500',
    'C++': 'bg-pink-500',
    C: 'bg-gray-500',
    Swift: 'bg-orange-400',
    Kotlin: 'bg-purple-400'
  };

  $: langColor = language ? languageColors[language] || 'bg-gray-400' : '';
</script>

<div
  class="bg-white border rounded-lg p-4 hover:border-indigo-300 hover:shadow-sm transition-all"
  data-testid="repo-card"
>
  <div class="flex items-start justify-between gap-4">
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 mb-1">
        <h3 class="font-medium text-gray-900 truncate">
          {repoName}
        </h3>
        {#if isPrivate}
          <span
            class="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full"
          >
            Private
          </span>
        {/if}
      </div>
      <p class="text-sm text-gray-500 truncate mb-2">
        {fullName}
      </p>
      {#if description}
        <p class="text-sm text-gray-600 line-clamp-2 mb-3">
          {description}
        </p>
      {/if}
      {#if language}
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-full {langColor}"></span>
          <span class="text-xs text-gray-600">{language}</span>
        </div>
      {/if}
    </div>
    <div class="flex-shrink-0 flex flex-col gap-2">
      {#if isConnected}
        {#if onGenerate}
          <button
            on:click|stopPropagation={onGenerate}
            disabled={generating}
            class="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {#if generating}
              <span class="flex items-center gap-2">
                <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Generating...
              </span>
            {:else}
              Generate Docs
            {/if}
          </button>
        {/if}
        {#if hasDocumentation}
          <span class="px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-md text-center">
            Docs Ready
          </span>
        {/if}
        {#if onDisconnect}
          <button
            on:click|stopPropagation={onDisconnect}
            disabled={loading}
            class="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Disconnecting...' : 'Disconnect'}
          </button>
        {/if}
      {:else if onConnect}
        <button
          on:click={onConnect}
          disabled={loading}
          class="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Connecting...' : 'Connect'}
        </button>
      {/if}
    </div>
  </div>
</div>
