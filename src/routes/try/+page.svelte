<script lang="ts">
	import { page } from '$app/stores';
	import { marked } from 'marked';
	import { onMount, onDestroy } from 'svelte';
	import DOMPurify from 'dompurify';
	import LockedDocPreview from '$lib/components/LockedDocPreview.svelte';
	import { toast } from '$lib/stores/toast';

	// Initialize DOMPurify on mount (only works in browser)
	let purify: typeof DOMPurify | null = null;

	// Rotating tips for generating state
	const tips = [
		{ icon: '💡', text: 'Did you know? The average developer spends 6-8 hours writing documentation.' },
		{ icon: '⚡', text: 'CodeDoc AI analyzes your entire codebase in under 60 seconds.' },
		{ icon: '💰', text: 'Professional technical writers charge $50-100/hour.' },
		{ icon: '🚀', text: 'Great documentation increases developer adoption by 3x.' },
		{ icon: '✨', text: 'We use advanced AI to understand your code context deeply.' }
	];
	let currentTipIndex = 0;
	let tipInterval: ReturnType<typeof setInterval> | null = null;

	// Progress stages
	const stages = [
		{ id: 1, label: 'Reading file structure', icon: '📂' },
		{ id: 2, label: 'Analyzing code patterns', icon: '🔍' },
		{ id: 3, label: 'Generating documentation', icon: '✍️' }
	];
	let currentStage = 0;
	let progress = 0;

	onMount(() => {
		purify = DOMPurify;
	});

	onDestroy(() => {
		if (tipInterval) clearInterval(tipInterval);
	});

	/**
	 * Safely render markdown to sanitized HTML
	 */
	function renderMarkdown(markdown: string): string {
		const rawHtml = marked(markdown) as string;
		if (purify) {
			return purify.sanitize(rawHtml, {
				ALLOWED_TAGS: [
					'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
					'p', 'br', 'hr',
					'ul', 'ol', 'li',
					'blockquote', 'pre', 'code',
					'em', 'strong', 'a', 'img',
					'table', 'thead', 'tbody', 'tr', 'th', 'td',
					'del', 'sup', 'sub', 'span', 'div'
				],
				ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel']
			});
		}
		return rawHtml;
	}

	function startTipRotation() {
		currentTipIndex = 0;
		tipInterval = setInterval(() => {
			currentTipIndex = (currentTipIndex + 1) % tips.length;
		}, 4000);
	}

	function stopTipRotation() {
		if (tipInterval) {
			clearInterval(tipInterval);
			tipInterval = null;
		}
	}

	// Auto-populate from URL param if present
	let githubUrl = $page.url.searchParams.get('url') || '';
	let isLoading = false;
	let loadingStage = '';
	let generatedReadme = '';
	let repoName = '';
	let error = '';
	let limitReached = false;
	let copied = false;

	async function handleSubmit() {
		// Reset state
		error = '';
		generatedReadme = '';
		limitReached = false;
		isLoading = true;
		copied = false;
		currentStage = 0;
		progress = 0;

		// Start tip rotation
		startTipRotation();

		try {
			// Stage 1: Reading file structure
			currentStage = 1;
			loadingStage = 'Reading file structure...';
			progress = 15;
			await new Promise(r => setTimeout(r, 800));

			// Stage 2: Analyzing code patterns
			currentStage = 2;
			loadingStage = 'Analyzing code patterns...';
			progress = 35;

			const response = await fetch('/api/try', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ githubUrl })
			});

			const data = await response.json();

			if (!response.ok) {
				if (response.status === 429) {
					limitReached = true;
					error = data.message || 'Daily demo limit reached.';
				} else {
					error = data.message || 'Failed to generate documentation';
				}
				return;
			}

			// Stage 3: Generating documentation
			currentStage = 3;
			loadingStage = 'Generating documentation...';
			progress = 85;
			await new Promise(r => setTimeout(r, 500));

			progress = 100;

			generatedReadme = data.readme;
			repoName = data.repoName;
			toast.success('README generated successfully!');

		} catch (err) {
			error = 'Something went wrong. Please try again.';
			console.error('Demo generation error:', err);
		} finally {
			isLoading = false;
			loadingStage = '';
			stopTipRotation();
		}
	}

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(generatedReadme);
			copied = true;
			toast.success('Copied to clipboard!');
			setTimeout(() => { copied = false; }, 2000);
		} catch (err) {
			toast.error('Failed to copy to clipboard');
		}
	}

	$: renderedMarkdown = generatedReadme ? renderMarkdown(generatedReadme) : '';
	$: currentTip = tips[currentTipIndex];
</script>

<svelte:head>
	<title>Try CodeDoc AI - Generate README Without Signup</title>
	<meta name="description" content="Generate professional README documentation for your GitHub repository. No signup required. Try it now!" />
</svelte:head>

<div class="min-h-screen bg-[#09090b] text-white">
	<!-- Header -->
	<header class="border-b border-zinc-800">
		<div class="container mx-auto px-4 py-4 flex items-center justify-between">
			<a href="/" class="text-xl font-bold hover:text-emerald-400 transition-colors">
				CodeDoc AI
			</a>
			<a href="/auth/login" class="text-sm text-zinc-400 hover:text-white transition-colors">
				Sign In
			</a>
		</div>
	</header>

	<!-- Main Content -->
	<main class="container mx-auto px-4 py-12 max-w-4xl">
		<!-- Hero Section -->
		<div class="text-center mb-12">
			<h1 class="text-4xl md:text-5xl font-bold mb-4">
				See it work.
			</h1>
			<p class="text-lg text-zinc-400 max-w-2xl mx-auto">
				Enter any public GitHub repository URL and get a professional README in seconds.
				No signup required.
			</p>
		</div>

		<!-- Input Form -->
		<form on:submit|preventDefault={handleSubmit} class="mb-8">
			<div class="flex flex-col sm:flex-row gap-4">
				<input
					type="text"
					bind:value={githubUrl}
					placeholder="https://github.com/owner/repo"
					disabled={isLoading}
					class="flex-1 px-4 py-4 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
				/>
				<button
					type="submit"
					disabled={isLoading || !githubUrl.trim()}
					class="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-500 whitespace-nowrap text-lg"
				>
					{#if isLoading}
						<span class="flex items-center gap-2">
							<svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
							</svg>
							Generating...
						</span>
					{:else}
						Generate README
					{/if}
				</button>
			</div>
		</form>

		<!-- Loading State - Enhanced with stages and tips -->
		{#if isLoading}
			<div class="bg-zinc-900/50 border border-zinc-800 rounded-lg p-8 mb-8">
				<div class="flex flex-col items-center gap-6">
					<!-- Progress Bar -->
					<div class="w-full max-w-md">
						<div class="h-2 bg-zinc-800 rounded-full overflow-hidden">
							<div
								class="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
								style="width: {progress}%;"
							></div>
						</div>
						<p class="text-xs text-zinc-500 text-right mt-1">{progress}%</p>
					</div>

					<!-- Stage Indicators -->
					<div class="flex items-center gap-4 text-sm">
						{#each stages as stage}
							<div class="flex items-center gap-2 {currentStage >= stage.id ? 'text-emerald-400' : 'text-zinc-600'}">
								<span class="text-lg">{currentStage > stage.id ? '✓' : stage.icon}</span>
								<span class="hidden sm:inline">{stage.label}</span>
							</div>
							{#if stage.id < stages.length}
								<div class="w-8 h-px {currentStage > stage.id ? 'bg-emerald-500' : 'bg-zinc-700'}"></div>
							{/if}
						{/each}
					</div>

					<!-- Current Stage Label -->
					<p class="text-lg text-emerald-400 font-medium">{loadingStage}</p>

					<!-- Rotating Tips -->
					<div class="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 max-w-md w-full">
						<div class="flex items-start gap-3 min-h-[48px]">
							<span class="text-2xl flex-shrink-0">{currentTip.icon}</span>
							<p class="text-zinc-300 text-sm leading-relaxed">{currentTip.text}</p>
						</div>
					</div>

					<p class="text-xs text-zinc-500">This usually takes 15-30 seconds</p>
				</div>
			</div>
		{/if}

		<!-- Error State -->
		{#if error && !limitReached}
			<div class="bg-red-500/10 border border-red-500/30 rounded-lg p-6 mb-8">
				<div class="flex items-start gap-3">
					<svg class="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<div>
						<h3 class="text-red-400 font-semibold mb-1">Generation Failed</h3>
						<p class="text-zinc-400">{error}</p>
						<button
							on:click={handleSubmit}
							class="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm"
						>
							Try Again
						</button>
					</div>
				</div>
			</div>
		{/if}

		<!-- Rate Limit Reached State -->
		{#if limitReached}
			<div class="bg-amber-500/10 border border-amber-500/30 rounded-lg p-8 mb-8 text-center">
				<div class="text-4xl mb-4">
					<svg class="w-16 h-16 mx-auto text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
					</svg>
				</div>
				<h3 class="text-xl font-semibold text-amber-400 mb-2">Daily Limit Reached</h3>
				<p class="text-zinc-400 mb-6 max-w-md mx-auto">
					You've used your free demo for today. Get full access to all 4 documentation types.
				</p>
				<div class="space-y-3">
					<a
						href="/auth/login?intent=purchase&product=single"
						class="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg transition-all"
					>
						Get All 4 Docs — $99
						<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
						</svg>
					</a>
					<p class="text-sm text-zinc-400">
						Or <a href="/auth/login?intent=purchase&tier=pro" class="text-emerald-400 hover:text-emerald-300 underline">subscribe to Pro for unlimited</a>
					</p>
				</div>
			</div>
		{/if}

		<!-- Success State: Generated README -->
		{#if generatedReadme && !isLoading}
			<div class="mb-12">
				<!-- Result Header -->
				<div class="flex items-center justify-between mb-4">
					<div>
						<h2 class="text-2xl font-bold text-white">Generated README</h2>
						{#if repoName}
							<p class="text-sm text-zinc-500">for {repoName}</p>
						{/if}
					</div>
					<button
						on:click={copyToClipboard}
						class="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm transition-colors"
					>
						{#if copied}
							<svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
							Copied!
						{:else}
							<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
							</svg>
							Copy
						{/if}
					</button>
				</div>

				<!-- Markdown Preview -->
				<div class="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
					<div class="px-4 py-2 bg-zinc-800/50 border-b border-zinc-700 flex items-center gap-2">
						<div class="w-3 h-3 rounded-full bg-red-500"></div>
						<div class="w-3 h-3 rounded-full bg-yellow-500"></div>
						<div class="w-3 h-3 rounded-full bg-green-500"></div>
						<span class="text-xs text-zinc-500 ml-2">README</span>
					</div>
					<div class="p-6 prose prose-invert prose-sm max-w-none prose-headings:text-white prose-p:text-zinc-300 prose-li:text-zinc-300 prose-strong:text-white prose-code:text-emerald-400 prose-code:bg-zinc-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-zinc-800 prose-a:text-emerald-400">
						{@html renderedMarkdown}
					</div>
				</div>
			</div>

			<!-- Upsell Section with Value Anchor -->
			<div class="mb-12">
				<!-- Section Header -->
				<div class="text-center mb-8">
					<h2 class="text-2xl font-bold text-white mb-2">Unlock the complete documentation suite</h2>
					<p class="text-zinc-400">
						<span class="text-zinc-500 line-through">$400-800</span>
						<span class="text-emerald-400 font-semibold ml-2">$99 one-time</span>
					</p>
				</div>

				<!-- Locked Doc Previews -->
				<div class="grid md:grid-cols-3 gap-4 mb-8">
					<LockedDocPreview
						docType="api"
						ctaText="Included in $99 package"
						ctaHref="/auth/login?intent=purchase&product=single"
					/>
					<LockedDocPreview
						docType="architecture"
						ctaText="Included in $99 package"
						ctaHref="/auth/login?intent=purchase&product=single"
					/>
					<LockedDocPreview
						docType="setup"
						ctaText="Included in $99 package"
						ctaHref="/auth/login?intent=purchase&product=single"
					/>
				</div>

				<!-- Value Anchor Box -->
				<div class="bg-zinc-900/80 border border-zinc-700 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
					<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
						<div>
							<p class="text-zinc-300 mb-2">
								Technical writers charge <span class="text-white font-semibold">$50-100/hr × 6-8 hours</span> = <span class="text-zinc-500 line-through">$400-800</span>
							</p>
							<p class="text-lg">
								You pay <span class="text-emerald-400 font-bold text-xl">$99</span>. <span class="text-white font-semibold">Once.</span>
							</p>
						</div>
					</div>

					<!-- What's Included Checklist -->
					<div class="mt-4 pt-4 border-t border-zinc-700">
						<div class="grid grid-cols-2 gap-2 text-sm">
							<div class="flex items-center gap-2 text-zinc-300">
								<svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
								README
							</div>
							<div class="flex items-center gap-2 text-zinc-300">
								<svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
								API Documentation
							</div>
							<div class="flex items-center gap-2 text-zinc-300">
								<svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
								Architecture Diagram
							</div>
							<div class="flex items-center gap-2 text-zinc-300">
								<svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
								Setup Guide
							</div>
							<div class="flex items-center gap-2 text-zinc-300">
								<svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
								Private repos
							</div>
							<div class="flex items-center gap-2 text-zinc-300">
								<svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
								Regenerate: $19
							</div>
						</div>
					</div>
				</div>

				<!-- Primary CTA -->
				<div class="text-center space-y-4">
					<a
						href="/auth/login?intent=purchase&product=single"
						class="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-lg transition-all text-lg shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
					>
						Get Complete Docs — $99
						<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
						</svg>
					</a>
					<p class="text-sm text-zinc-500">
						30-day refund guarantee
					</p>
					<p class="text-sm text-zinc-400">
						Or <a href="/auth/login?intent=purchase&tier=pro" class="text-emerald-400 hover:text-emerald-300 underline">subscribe to Pro for unlimited repos</a>
					</p>
				</div>
			</div>
		{/if}

		<!-- Empty State (before form submission) -->
		{#if !isLoading && !generatedReadme && !error && !limitReached}
			<div class="text-center text-zinc-500 py-12">
				<div class="text-6xl mb-4 opacity-50">
					<svg class="w-20 h-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
				</div>
				<p class="text-lg mb-2">Enter a GitHub URL to get started</p>
				<p class="text-sm">Example: https://github.com/sveltejs/kit</p>
			</div>
		{/if}
	</main>

	<!-- Footer -->
	<footer class="border-t border-zinc-800 py-8">
		<div class="container mx-auto px-4 text-center">
			<a href="/" class="text-zinc-500 hover:text-white transition-colors text-sm">
				Back to homepage
			</a>
		</div>
	</footer>
</div>
