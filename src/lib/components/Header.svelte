<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let username: string = '';
  export let plan: string = 'free';
  export let showUpgrade: boolean = false;
  export let upgradeLoading: boolean = false;

  const dispatch = createEventDispatcher<{
    upgrade: void;
    logout: void;
  }>();

  let mobileMenuOpen = false;

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function handleUpgrade() {
    dispatch('upgrade');
  }

  function handleLogout() {
    dispatch('logout');
  }

  // Plan badge styling
  const planStyles: Record<string, { bg: string; text: string; border: string }> = {
    free: { bg: 'bg-dark-600', text: 'text-text-secondary', border: 'border-dark-400' },
    pro: { bg: 'bg-accent/20', text: 'text-accent', border: 'border-accent/30' },
    team: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
    single: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  };

  $: planStyle = planStyles[plan] || planStyles.free;
</script>

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
          Codec8
        </span>
      </a>

      <!-- Desktop Navigation -->
      <nav class="hidden md:flex items-center gap-4">
        <!-- Plan Badge -->
        <span class="badge {planStyle.bg} {planStyle.text} border {planStyle.border}">
          {plan.toUpperCase()}
        </span>

        <!-- Username -->
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-700">
          <div class="w-6 h-6 rounded-full bg-gradient-to-br from-accent/50 to-accent-dark/50 flex items-center justify-center">
            <span class="text-xs font-semibold text-text-primary">
              {username.charAt(0).toUpperCase()}
            </span>
          </div>
          <span class="text-sm text-text-secondary max-w-[120px] truncate">{username}</span>
        </div>

        {#if showUpgrade}
          <button
            class="btn-primary btn-sm pulse-glow"
            on:click={handleUpgrade}
            disabled={upgradeLoading}
          >
            {#if upgradeLoading}
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
        {/if}

        <!-- Logout -->
        <form action="/auth/logout" method="POST">
          <button type="submit" class="btn-ghost btn-sm text-text-muted hover:text-error">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span class="hidden lg:inline">Logout</span>
          </button>
        </form>
      </nav>

      <!-- Mobile Menu Button -->
      <button
        class="md:hidden p-2 rounded-lg bg-dark-700 text-text-secondary hover:text-text-primary touch-target"
        on:click={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {#if mobileMenuOpen}
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          {:else}
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          {/if}
        </svg>
      </button>
    </div>
  </div>

  <!-- Mobile Navigation -->
  {#if mobileMenuOpen}
    <nav class="md:hidden border-t border-dark-500 bg-dark-800 animate-slide-down">
      <div class="px-4 py-4 space-y-4">
        <!-- User Info -->
        <div class="flex items-center justify-between p-3 rounded-xl bg-dark-700">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-accent/50 to-accent-dark/50 flex items-center justify-center">
              <span class="text-sm font-semibold text-text-primary">
                {username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p class="text-sm font-medium text-text-primary">{username}</p>
              <span class="badge {planStyle.bg} {planStyle.text} border {planStyle.border} text-[10px] py-0.5">
                {plan.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {#if showUpgrade}
          <button
            class="btn-primary w-full touch-target"
            on:click={() => { handleUpgrade(); mobileMenuOpen = false; }}
            disabled={upgradeLoading}
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            {upgradeLoading ? 'Loading...' : 'Upgrade to Pro'}
          </button>
        {/if}

        <form action="/auth/logout" method="POST">
          <button type="submit" class="btn-secondary w-full touch-target">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </form>
      </div>
    </nav>
  {/if}
</header>
