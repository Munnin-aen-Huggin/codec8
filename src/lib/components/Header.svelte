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
</script>

<header class="header">
  <div class="header-container">
    <a href="/" class="logo">
      <span class="logo-icon">📄</span>
      <span class="logo-text">CodeDoc AI</span>
    </a>

    <!-- Desktop Navigation -->
    <nav class="nav-desktop">
      <div class="nav-items">
        {#if showUpgrade}
          <button
            class="upgrade-btn"
            on:click={handleUpgrade}
            disabled={upgradeLoading}
          >
            {upgradeLoading ? 'Loading...' : 'Upgrade'}
          </button>
        {:else}
          <span class="plan-badge">{plan.toUpperCase()}</span>
        {/if}

        <span class="username">{username}</span>

        <form action="/auth/logout" method="POST" class="logout-form">
          <button type="submit" class="logout-btn">
            <svg class="logout-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span class="logout-text">Logout</span>
          </button>
        </form>
      </div>
    </nav>

    <!-- Mobile Menu Button -->
    <button class="mobile-menu-btn" on:click={toggleMobileMenu} aria-label="Toggle menu">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {#if mobileMenuOpen}
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        {:else}
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        {/if}
      </svg>
    </button>
  </div>

  <!-- Mobile Navigation -->
  {#if mobileMenuOpen}
    <nav class="nav-mobile">
      <div class="mobile-user">
        <span class="username">{username}</span>
        {#if showUpgrade}
          <span class="plan-badge free">Free Plan</span>
        {:else}
          <span class="plan-badge">{plan.toUpperCase()}</span>
        {/if}
      </div>

      {#if showUpgrade}
        <button
          class="mobile-upgrade-btn"
          on:click={() => { handleUpgrade(); mobileMenuOpen = false; }}
          disabled={upgradeLoading}
        >
          {upgradeLoading ? 'Loading...' : 'Upgrade to Lifetime'}
        </button>
      {/if}

      <form action="/auth/logout" method="POST">
        <button type="submit" class="mobile-logout-btn">
          Logout
        </button>
      </form>
    </nav>
  {/if}
</header>

<style>
  .header {
    background: white;
    border-bottom: 1px solid #e5e7eb;
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .header-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0.75rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    color: #111827;
    font-weight: 700;
    font-size: 1.25rem;
  }

  .logo-icon {
    font-size: 1.5rem;
  }

  .nav-desktop {
    display: flex;
    align-items: center;
  }

  .nav-items {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .upgrade-btn {
    padding: 0.375rem 0.75rem;
    background: #16a34a;
    color: white;
    font-size: 0.875rem;
    font-weight: 500;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: background 0.15s;
  }

  .upgrade-btn:hover {
    background: #15803d;
  }

  .upgrade-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .plan-badge {
    padding: 0.25rem 0.75rem;
    background: #dcfce7;
    color: #166534;
    font-size: 0.75rem;
    font-weight: 600;
    border-radius: 9999px;
  }

  .plan-badge.free {
    background: #f3f4f6;
    color: #6b7280;
  }

  .username {
    color: #4b5563;
    font-size: 0.875rem;
  }

  .logout-form {
    display: inline;
  }

  .logout-btn {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    background: transparent;
    color: #6b7280;
    font-size: 0.875rem;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.15s;
  }

  .logout-btn:hover {
    background: #f3f4f6;
    color: #374151;
  }

  .logout-icon {
    width: 1rem;
    height: 1rem;
  }

  .mobile-menu-btn {
    display: none;
    padding: 0.5rem;
    background: transparent;
    border: none;
    color: #6b7280;
    cursor: pointer;
  }

  .mobile-menu-btn svg {
    width: 1.5rem;
    height: 1.5rem;
  }

  .nav-mobile {
    display: none;
    padding: 1rem 1.5rem;
    border-top: 1px solid #e5e7eb;
    background: #f9fafb;
  }

  .mobile-user {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .mobile-upgrade-btn {
    width: 100%;
    padding: 0.75rem;
    background: #16a34a;
    color: white;
    font-size: 0.875rem;
    font-weight: 600;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    margin-bottom: 0.75rem;
  }

  .mobile-upgrade-btn:disabled {
    opacity: 0.5;
  }

  .mobile-logout-btn {
    width: 100%;
    padding: 0.75rem;
    background: transparent;
    color: #6b7280;
    font-size: 0.875rem;
    font-weight: 500;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    cursor: pointer;
  }

  @media (max-width: 768px) {
    .nav-desktop {
      display: none;
    }

    .mobile-menu-btn {
      display: block;
    }

    .nav-mobile {
      display: block;
    }

    .logo-text {
      display: none;
    }
  }

  @media (min-width: 769px) {
    .nav-mobile {
      display: none !important;
    }
  }
</style>
