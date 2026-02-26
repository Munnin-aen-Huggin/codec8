<script lang="ts">
	import { onMount } from 'svelte';
	import TemplateEditor from '$lib/components/TemplateEditor.svelte';
	import type { DocTemplate } from '$lib/types';

	let { data } = $props();

	let templates = $state<DocTemplate[]>([]);
	let loading = $state(true);
	let showEditor = $state(false);
	let editingTemplate = $state<DocTemplate | null>(null);

	const docTypeLabels: Record<string, string> = {
		readme: 'README',
		api: 'API Docs',
		architecture: 'Architecture',
		setup: 'Setup Guide'
	};

	onMount(async () => {
		try {
			const res = await fetch('/api/templates');
			if (res.ok) {
				const data = await res.json();
				templates = data.templates;
			}
		} catch (err) {
			console.error('Failed to load templates:', err);
		} finally {
			loading = false;
		}
	});

	function openCreate() {
		editingTemplate = null;
		showEditor = true;
	}

	function openEdit(template: DocTemplate) {
		editingTemplate = template;
		showEditor = true;
	}

	function handleSave(saved: DocTemplate) {
		if (editingTemplate) {
			templates = templates.map(t => t.id === saved.id ? saved : t);
		} else {
			templates = [...templates, saved];
		}
		showEditor = false;
	}

	async function handleDelete(id: string) {
		if (!confirm('Delete this template?')) return;

		try {
			const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error('Failed to delete');

			templates = templates.filter(t => t.id !== id);
		} catch (err) {
			alert('Failed to delete template');
		}
	}

	async function handleDuplicate(template: DocTemplate) {
		const name = prompt('Enter name for the copy:', `${template.name} (Copy)`);
		if (!name) return;

		try {
			const res = await fetch(`/api/templates/${template.id}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name })
			});

			if (!res.ok) throw new Error('Failed to duplicate');

			const { template: copied } = await res.json();
			templates = [...templates, copied];
		} catch (err) {
			alert('Failed to duplicate template');
		}
	}

	// Group templates by type
	let groupedTemplates = $derived(templates.reduce((acc, t) => {
		if (!acc[t.doc_type]) acc[t.doc_type] = [];
		acc[t.doc_type].push(t);
		return acc;
	}, {} as Record<string, DocTemplate[]>));
</script>

<svelte:head>
	<title>Documentation Templates - Codec8</title>
</svelte:head>

<div class="min-h-screen bg-[#09090b]">
	<!-- Header -->
	<header class="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between h-16">
				<div class="flex items-center gap-4">
					<a href="/dashboard" class="text-zinc-400 hover:text-white transition-colors" aria-label="Back to dashboard">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
						</svg>
					</a>
					<h1 class="text-xl font-bold text-white">Documentation Templates</h1>
				</div>
				<div class="flex gap-3">
					<a href="/dashboard" class="px-4 py-2 text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-600 rounded-lg transition-colors">
						Back to Dashboard
					</a>
					<button
						onclick={openCreate}
						class="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 text-sm"
					>
						Create Template
					</button>
				</div>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<div class="mb-8">
			<p class="text-zinc-400">Customize how your documentation is generated for your team.</p>
		</div>

		{#if showEditor}
			<div class="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
				<h2 class="text-xl font-bold text-white mb-6">
					{editingTemplate ? 'Edit Template' : 'Create Template'}
				</h2>
				<TemplateEditor
					template={editingTemplate}
					mode={editingTemplate ? 'edit' : 'create'}
					onsave={handleSave}
					oncancel={() => showEditor = false}
				/>
			</div>
		{/if}

		{#if loading}
			<div class="space-y-4">
				{#each Array(3) as _}
					<div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
						<div class="h-6 w-48 bg-zinc-800 rounded mb-2 animate-pulse"></div>
						<div class="h-4 w-96 bg-zinc-800 rounded animate-pulse"></div>
					</div>
				{/each}
			</div>
		{:else if templates.length === 0}
			<div class="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
				<div class="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
					<svg class="w-8 h-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
				</div>
				<h3 class="text-lg font-medium text-white mb-2">No custom templates yet</h3>
				<p class="text-zinc-400 mb-6">
					Create templates to customize how documentation is generated for your team.
				</p>
				<button
					onclick={openCreate}
					class="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-medium px-6 py-2.5 rounded-lg transition-all duration-200"
				>
					Create Your First Template
				</button>
			</div>
		{:else}
			<div class="space-y-8">
				{#each Object.entries(groupedTemplates) as [docType, typeTemplates]}
					<div>
						<h2 class="text-lg font-semibold text-white mb-4">
							{docTypeLabels[docType] || docType}
						</h2>
						<div class="space-y-4">
							{#each typeTemplates as template}
								<div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
									<div class="flex-1 min-w-0">
										<div class="flex items-center gap-2">
											<span class="text-white font-medium">{template.name}</span>
											{#if template.is_default}
												<span class="px-2 py-0.5 bg-violet-500/20 text-violet-400 text-xs font-medium rounded-full">Default</span>
											{/if}
										</div>
										<p class="text-zinc-500 text-sm mt-1 truncate">
											{template.prompt_template.substring(0, 100)}...
										</p>
									</div>
									<div class="flex items-center gap-2 ml-4">
										<button
											onclick={() => handleDuplicate(template)}
											class="p-2 text-zinc-500 hover:text-white transition-colors"
											title="Duplicate"
										>
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
													d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
											</svg>
										</button>
										<button
											onclick={() => openEdit(template)}
											class="p-2 text-zinc-500 hover:text-violet-400 transition-colors"
											title="Edit"
										>
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
													d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
											</svg>
										</button>
										<button
											onclick={() => handleDelete(template.id)}
											class="p-2 text-zinc-500 hover:text-red-400 transition-colors"
											title="Delete"
										>
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
													d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
											</svg>
										</button>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</main>
</div>
