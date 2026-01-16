<script lang="ts">
	import type { DocTemplate } from '$lib/types';

	interface Props {
		template?: DocTemplate | null;
		mode?: 'create' | 'edit';
		onsave?: (template: DocTemplate) => void;
		oncancel?: () => void;
	}

	let { template = null, mode = 'create', onsave, oncancel }: Props = $props();

	const docTypes = [
		{ value: 'readme', label: 'README' },
		{ value: 'api', label: 'API Documentation' },
		{ value: 'architecture', label: 'Architecture' },
		{ value: 'setup', label: 'Setup Guide' }
	];

	const defaultTemplates: Record<string, string> = {
		readme: `Generate a comprehensive README for this repository.
Include:
- Project title and description
- Features and highlights
- Installation instructions
- Usage examples
- Configuration options
- Contributing guidelines
- License information

Use clear, concise language. Format in proper Markdown.`,
		api: `Generate API documentation for this codebase.
Include:
- Overview of available endpoints/functions
- Request/response formats
- Authentication requirements
- Error codes and handling
- Usage examples for each endpoint
- Rate limits if applicable

Format as structured Markdown with code examples.`,
		architecture: `Generate architecture documentation for this codebase.
Include:
- System overview and design philosophy
- Component breakdown
- Data flow diagrams (Mermaid syntax)
- Key design decisions
- Dependencies and integrations
- Deployment architecture

Use Mermaid diagrams where helpful.`,
		setup: `Generate a setup guide for this repository.
Include:
- Prerequisites and requirements
- Step-by-step installation
- Environment configuration
- Database setup if needed
- Development server instructions
- Troubleshooting common issues

Format as a clear, numbered guide.`
	};

	let name = $state(template?.name || '');
	let docType = $state(template?.doc_type || 'readme');
	let promptTemplate = $state(template?.prompt_template || '');
	let isDefault = $state(template?.is_default || false);
	let saving = $state(false);
	let errorMsg = $state('');

	async function handleSubmit() {
		if (!name.trim() || !promptTemplate.trim()) {
			errorMsg = 'Name and template content are required';
			return;
		}

		saving = true;
		errorMsg = '';

		try {
			const url = mode === 'edit' && template
				? `/api/templates/${template.id}`
				: '/api/templates';

			const method = mode === 'edit' ? 'PATCH' : 'POST';

			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: name.trim(),
					docType,
					promptTemplate: promptTemplate.trim(),
					isDefault
				})
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.message || 'Failed to save');
			}

			const { template: saved } = await res.json();
			onsave?.(saved);
		} catch (err) {
			errorMsg = err instanceof Error ? err.message : 'Failed to save template';
		} finally {
			saving = false;
		}
	}

	function loadDefault() {
		promptTemplate = defaultTemplates[docType] || '';
	}
</script>

<div class="space-y-6">
	{#if errorMsg}
		<div class="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
			<p class="text-red-400 text-sm">{errorMsg}</p>
		</div>
	{/if}

	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		<div>
			<label for="name" class="block text-sm font-medium text-zinc-400 mb-2">
				Template Name
			</label>
			<input
				id="name"
				type="text"
				bind:value={name}
				placeholder="e.g., Standard README"
				class="w-full bg-zinc-800 text-white px-4 py-2.5 rounded-lg border border-zinc-700 focus:border-violet-500 focus:outline-none placeholder:text-zinc-500"
				disabled={saving}
			/>
		</div>

		<div>
			<label for="docType" class="block text-sm font-medium text-zinc-400 mb-2">
				Document Type
			</label>
			<select
				id="docType"
				bind:value={docType}
				class="w-full bg-zinc-800 text-white px-4 py-2.5 rounded-lg border border-zinc-700 focus:border-violet-500 focus:outline-none"
				disabled={mode === 'edit' || saving}
			>
				{#each docTypes as type}
					<option value={type.value}>{type.label}</option>
				{/each}
			</select>
		</div>
	</div>

	<div>
		<div class="flex justify-between items-center mb-2">
			<label for="prompt" class="block text-sm font-medium text-zinc-400">
				Prompt Template
			</label>
			<button
				type="button"
				onclick={loadDefault}
				class="text-sm text-violet-400 hover:text-violet-300"
			>
				Load Default
			</button>
		</div>
		<textarea
			id="prompt"
			bind:value={promptTemplate}
			rows={12}
			placeholder="Enter the prompt template for AI documentation generation..."
			class="w-full bg-zinc-800 text-white px-4 py-3 rounded-lg border border-zinc-700 focus:border-violet-500 focus:outline-none placeholder:text-zinc-500 font-mono text-sm resize-y"
			disabled={saving}
		></textarea>
	</div>

	<!-- Variables Reference -->
	<div class="p-4 bg-zinc-800/50 rounded-lg">
		<p class="text-sm font-medium text-zinc-400 mb-2">Available Variables</p>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm text-zinc-500 font-mono">
			<span>{'{{repo_name}}'} - Repository name</span>
			<span>{'{{repo_full_name}}'} - owner/repo format</span>
			<span>{'{{branch}}'} - Default branch</span>
			<span>{'{{description}}'} - Repo description</span>
			<span>{'{{language}}'} - Primary language</span>
		</div>
	</div>

	<div class="flex items-center gap-4">
		<label class="flex items-center gap-2 cursor-pointer">
			<input
				type="checkbox"
				bind:checked={isDefault}
				class="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-violet-500 focus:ring-violet-500 focus:ring-offset-0"
				disabled={saving}
			/>
			<span class="text-zinc-400">Set as default for {docTypes.find(d => d.value === docType)?.label}</span>
		</label>
	</div>

	<div class="flex gap-3">
		<button
			type="button"
			onclick={handleSubmit}
			class="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-medium px-6 py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
			disabled={saving || !name.trim() || !promptTemplate.trim()}
		>
			{saving ? 'Saving...' : mode === 'edit' ? 'Update Template' : 'Create Template'}
		</button>
		<button
			type="button"
			onclick={() => oncancel?.()}
			class="px-6 py-2.5 text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-600 rounded-lg transition-colors"
			disabled={saving}
		>
			Cancel
		</button>
	</div>
</div>
