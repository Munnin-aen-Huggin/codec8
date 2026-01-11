<script lang="ts">
	import { goto } from '$app/navigation';
	import { marked } from 'marked';
	import { toast } from '$lib/stores/toast';
	import type { PageData } from './$types';

	export let data: PageData;

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

	$: currentDoc = data.documentation[activeTab];
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

<div class="min-h-screen bg-gray-50">
	<header class="bg-white border-b">
		<div class="container mx-auto px-6 py-4">
			<div class="flex items-center gap-4">
				<a
					href="/dashboard"
					class="text-gray-500 hover:text-gray-700 flex items-center gap-1"
				>
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
					</svg>
					Back
				</a>
				<div class="flex-1">
					<h1 class="text-xl font-bold text-gray-900">{data.repo.name}</h1>
					<p class="text-sm text-gray-500">{data.repo.full_name}</p>
				</div>
				<div class="flex items-center gap-2">
					<button
						on:click={generateDocs}
						disabled={isGenerating}
						class="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
					>
						{#if isGenerating}
							<svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
							</svg>
							Generating...
						{:else}
							Regenerate All
						{/if}
					</button>
				</div>
			</div>
		</div>
	</header>

	<main class="container mx-auto px-6 py-8">
		{#if !data.hasAnyDocs}
			<div class="bg-white rounded-xl border p-12 text-center">
				<div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
					<svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
				</div>
				<h2 class="text-xl font-semibold text-gray-900 mb-2">No Documentation Yet</h2>
				<p class="text-gray-600 mb-6">
					Generate professional documentation for this repository using AI.
				</p>
				<button
					on:click={generateDocs}
					disabled={isGenerating}
					class="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
				>
					{#if isGenerating}
						<svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
						</svg>
						Generating Documentation...
					{:else}
						Generate Documentation
					{/if}
				</button>
			</div>
		{:else}
			<div class="bg-white rounded-xl border overflow-hidden">
				<!-- Tabs -->
				<div class="border-b flex">
					{#each docTypes as docType}
						<button
							on:click={() => selectTab(docType.key)}
							class="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors {activeTab === docType.key
								? 'border-indigo-600 text-indigo-600'
								: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
						>
							<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={docType.icon} />
							</svg>
							{docType.label}
							{#if !data.documentation[docType.key]}
								<span class="w-2 h-2 rounded-full bg-gray-300"></span>
							{/if}
						</button>
					{/each}
				</div>

				<!-- Content Area -->
				<div class="p-6">
					{#if !currentDoc}
						<div class="text-center py-12">
							<p class="text-gray-500 mb-4">
								No {docTypes.find(d => d.key === activeTab)?.label} documentation generated yet.
							</p>
							<button
								on:click={generateDocs}
								disabled={isGenerating}
								class="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
							>
								Generate Now
							</button>
						</div>
					{:else}
						<!-- Action Bar -->
						<div class="flex items-center justify-between mb-4 pb-4 border-b">
							<div class="text-sm text-gray-500">
								Version {currentDoc.version} - Generated {new Date(currentDoc.generated_at).toLocaleDateString()}
							</div>
							<div class="flex items-center gap-2">
								{#if isEditing}
									<button
										on:click={cancelEdit}
										class="px-3 py-1.5 text-sm font-medium text-gray-600 border rounded-md hover:bg-gray-50"
									>
										Cancel
									</button>
									<button
										on:click={saveEdit}
										disabled={isSaving}
										class="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
									>
										{isSaving ? 'Saving...' : 'Save'}
									</button>
								{:else}
									<button
										on:click={startEdit}
										class="px-3 py-1.5 text-sm font-medium text-gray-600 border rounded-md hover:bg-gray-50 flex items-center gap-1"
									>
										<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
										</svg>
										Edit
									</button>
									<button
										on:click={exportMarkdown}
										class="px-3 py-1.5 text-sm font-medium text-gray-600 border rounded-md hover:bg-gray-50 flex items-center gap-1"
									>
										<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
										</svg>
										Export
									</button>
									<button
										on:click={createPR}
										class="px-3 py-1.5 text-sm font-medium text-gray-600 border rounded-md hover:bg-gray-50 flex items-center gap-1"
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
							<div class="grid grid-cols-2 gap-4 min-h-[500px]">
								<div>
									<label for="markdown-editor" class="block text-sm font-medium text-gray-700 mb-2">
										Edit Markdown
									</label>
									<textarea
										id="markdown-editor"
										bind:value={editContent}
										class="w-full h-[500px] p-4 font-mono text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
									></textarea>
								</div>
								<div>
									<span class="block text-sm font-medium text-gray-700 mb-2">
										Preview
									</span>
									<div class="h-[500px] overflow-y-auto p-4 border rounded-lg bg-gray-50 prose prose-sm max-w-none">
										{@html marked(editContent)}
									</div>
								</div>
							</div>
						{:else}
							<div class="prose prose-indigo max-w-none">
								{@html renderedContent}
							</div>
						{/if}
					{/if}
				</div>
			</div>
		{/if}
	</main>
</div>

<style>
	/* Additional prose styling for better markdown rendering */
	:global(.prose pre) {
		background-color: #1f2937;
		color: #e5e7eb;
		padding: 1rem;
		border-radius: 0.5rem;
		overflow-x: auto;
	}

	:global(.prose code) {
		background-color: #f3f4f6;
		padding: 0.125rem 0.25rem;
		border-radius: 0.25rem;
		font-size: 0.875em;
	}

	:global(.prose pre code) {
		background-color: transparent;
		padding: 0;
	}

	:global(.prose table) {
		width: 100%;
		border-collapse: collapse;
	}

	:global(.prose th),
	:global(.prose td) {
		border: 1px solid #e5e7eb;
		padding: 0.5rem 0.75rem;
	}

	:global(.prose th) {
		background-color: #f9fafb;
		font-weight: 600;
	}

	:global(.prose img) {
		border-radius: 0.5rem;
	}

	/* Mermaid diagram styling */
	:global(.prose .mermaid) {
		background-color: #fff;
		padding: 1rem;
		border-radius: 0.5rem;
		border: 1px solid #e5e7eb;
		text-align: center;
	}
</style>
