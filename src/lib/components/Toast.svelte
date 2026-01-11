<script lang="ts">
  import { toast, type Toast, type ToastType } from '$lib/stores/toast';
  import { fly } from 'svelte/transition';

  const icons: Record<ToastType, string> = {
    success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
    warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  };

  const colors: Record<ToastType, { bg: string; text: string; icon: string }> = {
    success: { bg: 'bg-green-50', text: 'text-green-800', icon: 'text-green-500' },
    error: { bg: 'bg-red-50', text: 'text-red-800', icon: 'text-red-500' },
    warning: { bg: 'bg-amber-50', text: 'text-amber-800', icon: 'text-amber-500' },
    info: { bg: 'bg-blue-50', text: 'text-blue-800', icon: 'text-blue-500' }
  };

  function dismiss(id: string) {
    toast.remove(id);
  }
</script>

<div class="toast-container" aria-live="polite" aria-atomic="true">
  {#each $toast as t (t.id)}
    <div
      class="toast {colors[t.type].bg} {colors[t.type].text}"
      role="alert"
      transition:fly={{ y: -20, duration: 200 }}
    >
      <div class="toast-icon {colors[t.type].icon}">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={icons[t.type]} />
        </svg>
      </div>
      <p class="toast-message">{t.message}</p>
      <button
        class="toast-close"
        on:click={() => dismiss(t.id)}
        aria-label="Dismiss"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 24rem;
    width: 100%;
    pointer-events: none;
  }

  .toast {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    pointer-events: auto;
  }

  .toast-icon {
    flex-shrink: 0;
  }

  .toast-message {
    flex: 1;
    font-size: 0.875rem;
    line-height: 1.25rem;
    margin: 0;
  }

  .toast-close {
    flex-shrink: 0;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    opacity: 0.5;
    transition: opacity 0.15s;
  }

  .toast-close:hover {
    opacity: 1;
  }

  @media (max-width: 640px) {
    .toast-container {
      left: 1rem;
      right: 1rem;
      max-width: none;
    }
  }
</style>
