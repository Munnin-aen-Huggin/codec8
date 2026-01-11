<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import type { PageData } from './$types';
  
  export let data: PageData;
</script>

<svelte:head>
  <title>Dashboard - CodeDoc AI</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <header class="bg-white border-b">
    <div class="container mx-auto px-6 py-4 flex justify-between items-center">
      <a href="/" class="text-xl font-bold text-gray-900">
        📄 CodeDoc AI
      </a>
      <div class="flex items-center gap-4">
        <span class="text-gray-600">
          {$auth.user?.github_username}
        </span>
        <a 
          href="/auth/logout" 
          class="text-gray-500 hover:text-gray-700"
          data-testid="logout-button"
        >
          Logout
        </a>
      </div>
    </div>
  </header>

  <!-- Main -->
  <main class="container mx-auto px-6 py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Your Repositories</h1>
      <button 
        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
      >
        + Connect Repo
      </button>
    </div>

    <!-- Repos will go here -->
    <div class="bg-white rounded-xl border p-8 text-center text-gray-500">
      <p class="mb-4">No repositories connected yet.</p>
      <p class="text-sm">Click "Connect Repo" to get started.</p>
    </div>
  </main>
</div>
