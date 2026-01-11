<script lang="ts" module>
  export type DocType = 'readme' | 'api' | 'architecture' | 'setup';
</script>

<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let activeTab: DocType = 'readme';
  export let availableDocs: Record<DocType, boolean> = {
    readme: false,
    api: false,
    architecture: false,
    setup: false
  };

  const dispatch = createEventDispatcher<{ select: DocType }>();

  const docTypes: { key: DocType; label: string; icon: string }[] = [
    {
      key: 'readme',
      label: 'README',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    },
    {
      key: 'api',
      label: 'API',
      icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4'
    },
    {
      key: 'architecture',
      label: 'Architecture',
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
    },
    {
      key: 'setup',
      label: 'Setup Guide',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z'
    }
  ];

  function handleSelect(type: DocType) {
    dispatch('select', type);
  }
</script>

<div class="doc-tabs" role="tablist">
  {#each docTypes as docType}
    <button
      role="tab"
      aria-selected={activeTab === docType.key}
      aria-controls="doc-panel-{docType.key}"
      class="doc-tab"
      class:active={activeTab === docType.key}
      on:click={() => handleSelect(docType.key)}
    >
      <svg class="tab-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={docType.icon} />
      </svg>
      <span class="tab-label">{docType.label}</span>
      {#if !availableDocs[docType.key]}
        <span class="tab-empty" title="Not generated"></span>
      {/if}
    </button>
  {/each}
</div>

<style>
  .doc-tabs {
    display: flex;
    border-bottom: 1px solid #e5e7eb;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .doc-tabs::-webkit-scrollbar {
    display: none;
  }

  .doc-tab {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #6b7280;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
  }

  .doc-tab:hover {
    color: #374151;
    border-bottom-color: #d1d5db;
  }

  .doc-tab.active {
    color: #4f46e5;
    border-bottom-color: #4f46e5;
  }

  .tab-icon {
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
  }

  .tab-label {
    display: inline;
  }

  .tab-empty {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background-color: #d1d5db;
    flex-shrink: 0;
  }

  @media (max-width: 640px) {
    .doc-tab {
      padding: 0.625rem 0.75rem;
      font-size: 0.8125rem;
    }

    .tab-label {
      display: none;
    }

    .doc-tab.active .tab-label {
      display: inline;
    }
  }
</style>
