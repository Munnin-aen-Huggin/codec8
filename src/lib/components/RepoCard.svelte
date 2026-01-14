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
    TypeScript: '#3178c6',
    JavaScript: '#f7df1e',
    Python: '#3776ab',
    Rust: '#dea584',
    Go: '#00add8',
    Java: '#ed8b00',
    Ruby: '#cc342d',
    PHP: '#777bb4',
    'C++': '#f34b7d',
    C: '#555555',
    Swift: '#fa7343',
    Kotlin: '#a97bff',
    Vue: '#42b883',
    Svelte: '#ff3e00'
  };

  $: langColor = language ? languageColors[language] || '#6b7280' : '';
</script>

<div
  class="group relative card-hover p-5 cursor-pointer overflow-hidden"
  data-testid="repo-card"
  on:click={() => isConnected && onGenerate?.()}
  on:keypress={(e) => e.key === 'Enter' && isConnected && onGenerate?.()}
  role="button"
  tabindex="0"
>
  <!-- Subtle gradient overlay on hover -->
  <div class="absolute inset-0 bg-gradient-to-br from-accent/0 to-accent/0 group-hover:from-accent/5 group-hover:to-transparent transition-all duration-300 pointer-events-none"></div>

  <div class="relative flex items-start justify-between gap-4">
    <!-- Repo Info -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 mb-1.5">
        <!-- Repo Icon -->
        <div class="w-8 h-8 rounded-lg bg-dark-600 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
          <svg class="w-4 h-4 text-text-secondary group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </div>

        <div class="min-w-0">
          <h3 class="font-semibold text-text-primary truncate group-hover:text-accent transition-colors">
            {repoName}
          </h3>
          <p class="text-xs text-text-muted truncate">
            {fullName}
          </p>
        </div>

        {#if isPrivate}
          <span class="badge-warning text-[10px] py-0.5 px-2">
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Private
          </span>
        {/if}
      </div>

      {#if description}
        <p class="text-sm text-text-secondary truncate-2 mb-3 ml-10">
          {description}
        </p>
      {/if}

      <div class="flex items-center gap-3 ml-10">
        {#if language}
          <div class="flex items-center gap-1.5">
            <span
              class="w-2.5 h-2.5 rounded-full"
              style="background-color: {langColor}"
            ></span>
            <span class="text-xs text-text-muted">{language}</span>
          </div>
        {/if}

        {#if hasDocumentation}
          <div class="badge-success text-[10px] py-0.5 animate-pulse-subtle">
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Docs Ready
          </div>
        {:else if isConnected}
          <div class="badge bg-dark-600 text-text-muted text-[10px] py-0.5 border border-dark-500">
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Generate Docs
          </div>
        {/if}
      </div>
    </div>

    <!-- Actions -->
    <div class="flex-shrink-0 flex flex-col gap-2">
      {#if isConnected}
        {#if onGenerate}
          <button
            on:click|stopPropagation={onGenerate}
            disabled={generating}
            class="btn-primary btn-sm touch-target"
          >
            {#if generating}
              <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              <span class="hidden sm:inline">Generating...</span>
            {:else}
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span class="hidden sm:inline">Generate</span>
            {/if}
          </button>
        {/if}

        {#if onDisconnect}
          <button
            on:click|stopPropagation={onDisconnect}
            disabled={loading}
            class="btn-ghost btn-sm text-error hover:bg-error/10 touch-target"
          >
            {#if loading}
              <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            {:else}
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            {/if}
            <span class="sr-only sm:not-sr-only">Disconnect</span>
          </button>
        {/if}
      {:else if onConnect}
        <button
          on:click|stopPropagation={onConnect}
          disabled={loading}
          class="btn-primary btn-sm touch-target"
        >
          {#if loading}
            <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <span class="hidden sm:inline">Connecting...</span>
          {:else}
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span class="hidden sm:inline">Connect</span>
          {/if}
        </button>
      {/if}
    </div>
  </div>
</div>
