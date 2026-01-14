<script lang="ts">
	import UsageAnalytics from '$lib/components/UsageAnalytics.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Usage Analytics - CodeDoc AI</title>
</svelte:head>

<div class="min-h-screen bg-[#09090b]">
	<!-- Header -->
	<header class="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between h-16">
				<div class="flex items-center gap-4">
					<a href="/dashboard" class="text-zinc-400 hover:text-white transition-colors">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
						</svg>
					</a>
					<h1 class="text-xl font-bold text-white">Usage Analytics</h1>
				</div>
				<a href="/dashboard" class="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">
					Back to Dashboard
				</a>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<div class="mb-8">
			<p class="text-zinc-400">Track your documentation generation activity and usage patterns.</p>
		</div>

		<UsageAnalytics teamId={data.profile?.default_team_id} />
	</main>
</div>
