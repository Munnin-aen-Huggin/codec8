<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount, afterUpdate } from 'svelte';
	import { browser } from '$app/environment';
	import { marked } from 'marked';
	import { toast } from '$lib/stores/toast';
	import UpgradePrompt from '$lib/components/UpgradePrompt.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	// Initialize Mermaid for diagram rendering
	let mermaidInitialized = false;

	async function initMermaid() {
		if (!browser || mermaidInitialized) return;

		const mermaid = (await import('mermaid')).default;
		mermaid.initialize({
			startOnLoad: false,
			theme: 'dark',
			themeVariables: {
				primaryColor: '#10b981',
				primaryTextColor: '#fafafa',
				primaryBorderColor: '#3f3f46',
				lineColor: '#71717a',
				secondaryColor: '#27272a',
				tertiaryColor: '#18181b',
				background: '#18181b',
				mainBkg: '#27272a',
				nodeBorder: '#3f3f46',
				clusterBkg: '#27272a',
				clusterBorder: '#3f3f46',
				titleColor: '#fafafa',
				edgeLabelBackground: '#27272a'
			},
			flowchart: {
				htmlLabels: true,
				curve: 'basis'
			}
		});
		mermaidInitialized = true;
	}

	async function renderMermaidDiagrams() {
		if (!browser) return;

		await initMermaid();
		const mermaid = (await import('mermaid')).default;

		// Find all mermaid code blocks and render them
		const mermaidBlocks = document.querySelectorAll('pre code.language-mermaid');

		for (const block of mermaidBlocks) {
			const pre = block.parentElement;
			if (!pre || pre.dataset.mermaidRendered) continue;

			const code = block.textContent || '';
			const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

			try {
				const { svg } = await mermaid.render(id, code);
				const container = document.createElement('div');
				container.className = 'mermaid-diagram';
				container.innerHTML = svg;
				pre.replaceWith(container);
			} catch (err) {
				console.error('Mermaid rendering error:', err);
				// Keep the code block visible if rendering fails
			}
		}
	}

	onMount(() => {
		renderMermaidDiagrams();
	});

	afterUpdate(() => {
		renderMermaidDiagrams();
	});

	// Check if user is on free tier and only has README
	$: hasOnlyReadme = data.hasAnyDocs &&
		data.documentation['readme'] &&
		!data.documentation['api'] &&
		!data.documentation['architecture'] &&
		!data.documentation['setup'];

	$: showUpgradePrompt = data.isFreeUser && hasOnlyReadme;

	type DocType = 'readme' | 'api' | 'architecture' | 'setup';

	const docTypes: { key: DocType; label: string; icon: string }[] = [
		{ key: 'readme', label: 'README', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
		{ key: 'api', label: 'API', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
		{ key: 'architecture', label: 'Architecture', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
		{ key: 'setup', label: 'Setup Guide', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' }
	];

	let activeTab: DocType = 'readme';
	let isEditing = false;
	let editContent = '';
	let isSaving = false;
	let isGenerating = false;
	let autoSyncEnabled = data.repo.auto_sync_enabled || false;
	let isTogglingAutoSync = false;

	$: currentDoc = data.documentation[activeTab];

	async function toggleAutoSync() {
		isTogglingAutoSync = true;
		try {
			const method = autoSyncEnabled ? 'DELETE' : 'POST';
			const response = await fetch(`/api/repos/${data.repo.id}/webhook`, { method });

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Failed to toggle auto-sync');
			}

			autoSyncEnabled = !autoSyncEnabled;
			toast.success(autoSyncEnabled ? 'Auto-sync enabled! Docs will regenerate on push.' : 'Auto-sync disabled.');
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Failed to toggle auto-sync');
		} finally {
			isTogglingAutoSync = false;
		}
	}
	$: renderedContent = currentDoc?.content ? marked(currentDoc.content) : '';

	function selectTab(type: DocType) {
		if (isEditing) {
			if (!confirm('Discard unsaved changes?')) return;
		}
		activeTab = type;
		isEditing = false;
	}

	function startEdit() {
		if (currentDoc) {
			editContent = currentDoc.content;
			isEditing = true;
		}
	}

	function cancelEdit() {
		isEditing = false;
		editContent = '';
	}

	async function saveEdit() {
		if (!currentDoc) return;

		isSaving = true;
		try {
			const response = await fetch(`/api/docs/${currentDoc.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ content: editContent })
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Failed to save');
			}

			// Update local data
			data.documentation[activeTab] = {
				...currentDoc,
				content: editContent,
				version: currentDoc.version + 1
			};
			isEditing = false;
			toast.success('Changes saved successfully!');
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Failed to save');
		} finally {
			isSaving = false;
		}
	}

	function exportMarkdown() {
		if (!currentDoc) return;

		const blob = new Blob([currentDoc.content], { type: 'text/markdown' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${data.repo.name}-${activeTab}.md`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	async function generateDocs() {
		isGenerating = true;
		try {
			const response = await fetch('/api/docs/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					repoId: data.repo.id,
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

			// Reload the page to get updated docs
			if (result.docs?.length > 0) {
				toast.success('Documentation generated successfully!');
				window.location.reload();
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Failed to generate documentation');
		} finally {
			isGenerating = false;
		}
	}

	async function createPR() {
		toast.info('Create PR functionality coming soon!');
	}
</script>

<svelte:head>
	<title>{data.repo.name} - Documentation - CodeDoc AI</title>
</svelte:head>

<div class="min-h-screen bg-dark-900">
	<!-- Header with glass effect -->
	<header class="glass-dark sticky top-0 z-50 border-b border-dark-500">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 py-4">
			<div class="flex flex-col sm:flex-row sm:items-center gap-4">
				<div class="flex items-center gap-4">
					<a
						href="/dashboard"
						class="w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-dark-600 transition-colors"
					>
						<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
						</svg>
					</a>
					<div class="flex-1">
						<h1 class="text-h4 text-text-primary truncate">{data.repo.name}</h1>
						<p class="text-body-sm text-text-muted truncate">{data.repo.full_name}</p>
					</div>
				</div>
				<div class="flex items-center gap-2 sm:gap-3 sm:ml-auto">
					<!-- Auto-sync Toggle -->
					<button
						on:click={toggleAutoSync}
						disabled={isTogglingAutoSync}
						class="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl border transition-all {autoSyncEnabled
							? 'bg-accent/20 text-accent border-accent/30 hover:bg-accent/30'
							: 'text-text-muted border-dark-400 hover:bg-dark-700 hover:text-text-secondary'} disabled:opacity-50 disabled:cursor-not-allowed"
						title={autoSyncEnabled ? 'Auto-sync enabled - docs regenerate on git push' : 'Enable auto-sync to regenerate docs on git push'}
					>
						{#if isTogglingAutoSync}
							<svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
							</svg>
						{:else}
							<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
							</svg>
						{/if}
						<span class="hidden sm:inline">Auto-sync {autoSyncEnabled ? 'On' : 'Off'}</span>
						<span class="sm:hidden">{autoSyncEnabled ? 'On' : 'Off'}</span>
					</button>
					<button
						on:click={generateDocs}
						disabled={isGenerating}
						class="btn-primary btn-sm touch-target"
					>
						{#if isGenerating}
							<svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
							</svg>
							<span class="hidden sm:inline">Generating...</span>
						{:else}
							<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
							</svg>
							<span class="hidden sm:inline">Regenerate</span>
						{/if}
					</button>
				</div>
			</div>
		</div>
	</header>

	<main class="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
		{#if !data.hasAnyDocs}
			<div class="card p-12 text-center animate-fade-in">
				<div class="w-16 h-16 mx-auto mb-4 bg-dark-600 rounded-2xl flex items-center justify-center">
					<svg class="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
				</div>
				<h2 class="text-h3 text-text-primary mb-2">No Documentation Yet</h2>
				<p class="text-body text-text-secondary mb-6 max-w-md mx-auto">
					Generate professional documentation for this repository using AI.
				</p>
				<button
					on:click={generateDocs}
					disabled={isGenerating}
					class="btn-primary btn-lg"
				>
					{#if isGenerating}
						<svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
						</svg>
						Generating Documentation...
					{:else}
						<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
						</svg>
						Generate Documentation
					{/if}
				</button>
			</div>
		{:else}
			<div class="card overflow-hidden animate-fade-in">
				<!-- Tabs -->
				<div class="border-b border-dark-500 flex overflow-x-auto scrollbar-hide bg-dark-700/50">
					{#each docTypes as docType}
						<button
							on:click={() => selectTab(docType.key)}
							class="flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 -mb-px transition-all touch-target {activeTab === docType.key
								? 'border-accent text-accent bg-dark-800/50'
								: 'border-transparent text-text-muted hover:text-text-secondary hover:bg-dark-700'}"
						>
							<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={docType.icon} />
							</svg>
							<span class="hidden sm:inline">{docType.label}</span>
							{#if !data.documentation[docType.key]}
								<span class="w-2 h-2 rounded-full bg-dark-400"></span>
							{:else}
								<span class="w-2 h-2 rounded-full bg-success"></span>
							{/if}
						</button>
					{/each}
				</div>

				<!-- Content Area -->
				<div class="p-6">
					{#if !currentDoc}
						<div class="text-center py-12">
							<div class="w-12 h-12 mx-auto mb-4 bg-dark-600 rounded-xl flex items-center justify-center">
								<svg class="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
								</svg>
							</div>
							<p class="text-text-secondary mb-4">
								No {docTypes.find(d => d.key === activeTab)?.label} documentation generated yet.
							</p>
							<button
								on:click={generateDocs}
								disabled={isGenerating}
								class="btn-primary"
							>
								Generate Now
							</button>
						</div>
					{:else}
						<!-- Action Bar -->
						<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-dark-500">
							<div class="flex items-center gap-3">
								<span class="badge bg-dark-600 text-text-secondary border border-dark-400">
									v{currentDoc.version}
								</span>
								<span class="text-body-sm text-text-muted">
									Generated {new Date(currentDoc.generated_at).toLocaleDateString()}
								</span>
							</div>
							<div class="flex items-center gap-2 flex-wrap">
								{#if isEditing}
									<button
										on:click={cancelEdit}
										class="btn-ghost btn-sm"
									>
										Cancel
									</button>
									<button
										on:click={saveEdit}
										disabled={isSaving}
										class="btn-primary btn-sm"
									>
										{#if isSaving}
											<svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
												<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
												<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
											</svg>
										{/if}
										{isSaving ? 'Saving...' : 'Save Changes'}
									</button>
								{:else}
									<button
										on:click={startEdit}
										class="btn-secondary btn-sm"
									>
										<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
										</svg>
										Edit
									</button>
									<button
										on:click={exportMarkdown}
										class="btn-secondary btn-sm"
									>
										<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
										</svg>
										Export
									</button>
									<button
										on:click={createPR}
										class="btn-secondary btn-sm"
									>
										<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
										</svg>
										Create PR
									</button>
								{/if}
							</div>
						</div>

						<!-- Editor or Preview -->
						{#if isEditing}
							<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[400px] sm:min-h-[500px]">
								<div>
									<label for="markdown-editor" class="block text-body-sm font-medium text-text-secondary mb-2">
										Edit Markdown
									</label>
									<textarea
										id="markdown-editor"
										bind:value={editContent}
										class="input w-full h-[300px] sm:h-[400px] lg:h-[500px] font-mono text-xs sm:text-sm resize-none"
									></textarea>
								</div>
								<div>
									<span class="block text-body-sm font-medium text-text-secondary mb-2">
										Preview
									</span>
									<div class="h-[300px] sm:h-[400px] lg:h-[500px] overflow-y-auto p-4 border border-dark-500 rounded-xl bg-dark-700 prose prose-sm prose-invert max-w-none">
										{@html marked(editContent)}
									</div>
								</div>
							</div>
						{:else}
							<div class="prose prose-invert prose-emerald max-w-none">
								{@html renderedContent}
							</div>
						{/if}
					{/if}
				</div>
			</div>

			<!-- Upgrade prompt for free users who only have README -->
			{#if showUpgradePrompt}
				<UpgradePrompt
					repoName={data.repo.name}
					repoFullName={data.repo.full_name}
				/>
			{/if}
		{/if}
	</main>
</div>

<style>
	/* Hide scrollbar for tabs on mobile */
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}

	/* Dark theme prose styling for markdown rendering */

	/* Base text color and emoji support - THIS IS CRITICAL */
	:global(.prose-invert) {
		color: #e4e4e7 !important;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
	}

	/* Ensure emojis display properly */
	:global(.prose-invert h1),
	:global(.prose-invert h2),
	:global(.prose-invert h3) {
		font-family: inherit;
	}

	:global(.prose-invert p) {
		color: #e4e4e7;
	}

	:global(.prose-invert li) {
		color: #e4e4e7;
	}

	:global(.prose-invert td) {
		color: #d4d4d8;
	}

	:global(.prose-invert pre) {
		background-color: #18181b;
		color: #e5e7eb;
		padding: 1rem;
		border-radius: 0.5rem;
		overflow-x: auto;
		border: 1px solid #27272a;
	}

	:global(.prose-invert code) {
		background-color: #27272a;
		color: #10b981;
		padding: 0.125rem 0.25rem;
		border-radius: 0.25rem;
		font-size: 0.875em;
	}

	:global(.prose-invert pre code) {
		background-color: transparent;
		color: #e5e7eb;
		padding: 0;
	}

	:global(.prose-invert table) {
		width: 100%;
		border-collapse: collapse;
	}

	:global(.prose-invert th),
	:global(.prose-invert td) {
		border: 1px solid #3f3f46;
		padding: 0.5rem 0.75rem;
	}

	:global(.prose-invert th) {
		background-color: #27272a;
		font-weight: 600;
		color: #fafafa;
	}

	:global(.prose-invert img) {
		border-radius: 0.5rem;
	}

	/* Mermaid diagram styling - dark theme */
	:global(.prose-invert .mermaid),
	:global(.mermaid-diagram) {
		background-color: #18181b;
		padding: 1.5rem;
		border-radius: 0.75rem;
		border: 1px solid #3f3f46;
		text-align: center;
		margin: 1.5rem 0;
		overflow-x: auto;
	}

	:global(.mermaid-diagram svg) {
		max-width: 100%;
		height: auto;
	}

	/* Mermaid text colors for dark theme */
	:global(.mermaid-diagram .nodeLabel),
	:global(.mermaid-diagram .edgeLabel),
	:global(.mermaid-diagram text) {
		fill: #e4e4e7 !important;
		color: #e4e4e7 !important;
	}

	:global(.mermaid-diagram .node rect),
	:global(.mermaid-diagram .node circle),
	:global(.mermaid-diagram .node polygon) {
		stroke: #3f3f46 !important;
	}

	/* Prose headings and links */
	:global(.prose-invert h1),
	:global(.prose-invert h2),
	:global(.prose-invert h3),
	:global(.prose-invert h4),
	:global(.prose-invert h5),
	:global(.prose-invert h6) {
		color: #fafafa;
		font-weight: 600;
		margin-top: 1.5em;
		margin-bottom: 0.5em;
	}

	:global(.prose-invert h1) {
		font-size: 2em;
		border-bottom: 1px solid #3f3f46;
		padding-bottom: 0.3em;
	}

	:global(.prose-invert h2) {
		font-size: 1.5em;
		border-bottom: 1px solid #3f3f46;
		padding-bottom: 0.3em;
	}

	:global(.prose-invert h3) {
		font-size: 1.25em;
	}

	:global(.prose-invert a) {
		color: #34d399;
		text-decoration: underline;
	}

	:global(.prose-invert a:hover) {
		color: #6ee7b7;
	}

	:global(.prose-invert strong) {
		color: #fafafa;
		font-weight: 600;
	}

	:global(.prose-invert em) {
		color: #d4d4d8;
	}

	:global(.prose-invert blockquote) {
		border-left: 4px solid #10b981;
		padding-left: 1em;
		margin-left: 0;
		color: #a1a1aa;
		font-style: italic;
	}

	:global(.prose-invert hr) {
		border-color: #3f3f46;
		margin: 2em 0;
	}

	:global(.prose-invert ul),
	:global(.prose-invert ol) {
		padding-left: 1.5em;
		margin: 1em 0;
	}

	:global(.prose-invert li) {
		margin: 0.5em 0;
	}

	:global(.prose-invert li::marker) {
		color: #10b981;
	}

	/* Better spacing for content */
	:global(.prose-invert > *:first-child) {
		margin-top: 0;
	}

	:global(.prose-invert > *:last-child) {
		margin-bottom: 0;
	}
</style>
