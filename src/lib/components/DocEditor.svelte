<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { marked } from 'marked';

  export let content: string = '';
  export let isEditing: boolean = false;
  export let isSaving: boolean = false;

  const dispatch = createEventDispatcher<{
    save: string;
    cancel: void;
    edit: void;
    export: void;
    createPR: void;
  }>();

  let editContent = '';
  let showPreview = true;

  $: renderedContent = content ? marked(content) : '';
  $: renderedEditContent = editContent ? marked(editContent) : '';

  export function startEdit() {
    editContent = content;
    isEditing = true;
    dispatch('edit');
  }

  export function cancelEdit() {
    isEditing = false;
    editContent = '';
    dispatch('cancel');
  }

  function handleSave() {
    dispatch('save', editContent);
  }

  function handleExport() {
    dispatch('export');
  }

  function handleCreatePR() {
    dispatch('createPR');
  }

  function insertMarkdown(syntax: string, wrap = false) {
    const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = editContent.substring(start, end);

    let newText: string;
    let cursorPos: number;

    if (wrap && selected) {
      newText = editContent.substring(0, start) + syntax + selected + syntax + editContent.substring(end);
      cursorPos = end + syntax.length * 2;
    } else {
      newText = editContent.substring(0, start) + syntax + editContent.substring(end);
      cursorPos = start + syntax.length;
    }

    editContent = newText;

    // Restore cursor position after Svelte updates
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPos, cursorPos);
    });
  }
</script>

<div class="doc-editor">
  {#if isEditing}
    <!-- Editor Toolbar -->
    <div class="editor-toolbar">
      <div class="toolbar-group">
        <button
          type="button"
          class="toolbar-btn"
          title="Bold (Ctrl+B)"
          on:click={() => insertMarkdown('**', true)}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          class="toolbar-btn"
          title="Italic (Ctrl+I)"
          on:click={() => insertMarkdown('_', true)}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          class="toolbar-btn"
          title="Code"
          on:click={() => insertMarkdown('`', true)}
        >
          <code>&lt;/&gt;</code>
        </button>
        <button
          type="button"
          class="toolbar-btn"
          title="Link"
          on:click={() => insertMarkdown('[text](url)')}
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </button>
        <button
          type="button"
          class="toolbar-btn"
          title="Heading"
          on:click={() => insertMarkdown('## ')}
        >
          H
        </button>
        <button
          type="button"
          class="toolbar-btn"
          title="List"
          on:click={() => insertMarkdown('- ')}
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </button>
      </div>

      <div class="toolbar-group">
        <button
          type="button"
          class="toolbar-btn"
          class:active={showPreview}
          title="Toggle Preview"
          on:click={() => (showPreview = !showPreview)}
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Preview
        </button>
      </div>

      <div class="toolbar-actions">
        <button
          type="button"
          class="btn-secondary"
          on:click={cancelEdit}
        >
          Cancel
        </button>
        <button
          type="button"
          class="btn-primary"
          disabled={isSaving}
          on:click={handleSave}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>

    <!-- Editor Content -->
    <div class="editor-content" class:with-preview={showPreview}>
      <div class="editor-pane">
        <label for="markdown-editor" class="sr-only">Edit Markdown</label>
        <textarea
          id="markdown-editor"
          bind:value={editContent}
          class="editor-textarea"
          placeholder="Enter markdown content..."
        ></textarea>
      </div>
      {#if showPreview}
        <div class="preview-pane">
          <div class="preview-label">Preview</div>
          <div class="preview-content prose prose-sm max-w-none">
            {#if renderedEditContent}
              {@html renderedEditContent}
            {:else}
              <p class="text-gray-400 italic">Start typing to see preview...</p>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <!-- View Mode Toolbar -->
    <div class="view-toolbar">
      <div class="toolbar-actions">
        <button type="button" class="btn-icon" title="Edit" on:click={startEdit}>
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </button>
        <button type="button" class="btn-icon" title="Export" on:click={handleExport}>
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export
        </button>
        <button type="button" class="btn-icon" title="Create PR" on:click={handleCreatePR}>
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Create PR
        </button>
      </div>
    </div>

    <!-- View Content -->
    <div class="view-content prose prose-indigo max-w-none">
      {#if renderedContent}
        {@html renderedContent}
      {:else}
        <p class="text-gray-400 italic">No content available.</p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .doc-editor {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .editor-toolbar,
  .view-toolbar {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
    flex-wrap: wrap;
  }

  .toolbar-group {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .toolbar-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 0.375rem;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.15s;
    font-size: 0.875rem;
  }

  .toolbar-btn:hover {
    background: #e5e7eb;
    color: #374151;
  }

  .toolbar-btn.active {
    background: #e5e7eb;
    border-color: #d1d5db;
    color: #374151;
  }

  .toolbar-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-left: auto;
  }

  .btn-primary {
    padding: 0.5rem 1rem;
    background: #4f46e5;
    color: white;
    font-size: 0.875rem;
    font-weight: 500;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: background 0.15s;
  }

  .btn-primary:hover {
    background: #4338ca;
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-secondary {
    padding: 0.5rem 1rem;
    background: white;
    color: #374151;
    font-size: 0.875rem;
    font-weight: 500;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.15s;
  }

  .btn-secondary:hover {
    background: #f9fafb;
  }

  .btn-icon {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    background: transparent;
    color: #6b7280;
    font-size: 0.875rem;
    font-weight: 500;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.15s;
  }

  .btn-icon:hover {
    background: #f3f4f6;
    color: #374151;
  }

  .editor-content {
    display: flex;
    flex: 1;
    min-height: 400px;
    overflow: hidden;
  }

  .editor-content.with-preview {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .editor-pane {
    display: flex;
    flex-direction: column;
    border-right: 1px solid #e5e7eb;
  }

  .editor-textarea {
    flex: 1;
    width: 100%;
    padding: 1rem;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.875rem;
    line-height: 1.6;
    border: none;
    resize: none;
    outline: none;
  }

  .preview-pane {
    display: flex;
    flex-direction: column;
    background: #f9fafb;
    overflow: hidden;
  }

  .preview-label {
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
    font-weight: 500;
    color: #6b7280;
    text-transform: uppercase;
    border-bottom: 1px solid #e5e7eb;
  }

  .preview-content {
    flex: 1;
    padding: 1rem;
    overflow-y: auto;
  }

  .view-content {
    padding: 1.5rem;
    overflow-y: auto;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }

  @media (max-width: 768px) {
    .editor-content.with-preview {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr 1fr;
    }

    .editor-pane {
      border-right: none;
      border-bottom: 1px solid #e5e7eb;
    }

    .toolbar-actions {
      width: 100%;
      justify-content: flex-end;
    }
  }
</style>
