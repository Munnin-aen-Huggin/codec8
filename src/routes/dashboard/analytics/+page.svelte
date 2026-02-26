<script lang="ts">
	import UsageAnalytics from '$lib/components/UsageAnalytics.svelte';

	let { data } = $props();
	let upgrading = $state(false);
	let upgradeError = $state('');

	async function handleUpgrade() {
		upgrading = true;
		upgradeError = '';

		try {
			const res = await fetch('/api/stripe/checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ product: 'pro' })
			});

			const result = await res.json();

			if (result.success && result.url) {
				window.location.href = result.url;
			} else {
				upgradeError = result.message || 'Failed to start checkout';
				upgrading = false;
			}
		} catch (err) {
			upgradeError = 'Network error. Please try again.';
			upgrading = false;
		}
	}
</script>

<svelte:head>
	<title>Usage Analytics - Codec8</title>
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
		{#if data.hasAccess}
			<div class="mb-8">
				<p class="text-zinc-400">Track your documentation generation activity and usage patterns.</p>
			</div>

			<UsageAnalytics teamId={data.profile?.default_team_id} />
		{:else}
			<!-- Upgrade Prompt for Free Users -->
			<div class="max-w-2xl mx-auto text-center py-16">
				<div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center mx-auto mb-6">
					<svg class="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
					</svg>
				</div>

				<h2 class="text-2xl font-bold text-white mb-3">Unlock Usage Analytics</h2>
				<p class="text-zinc-400 mb-8 max-w-md mx-auto">
					Get detailed insights into your documentation generation activity, token usage, and team performance with a Pro or Team subscription.
				</p>

				<!-- Feature Preview -->
				<div class="grid gap-4 sm:grid-cols-2 text-left mb-8">
					<div class="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
						<div class="flex items-center gap-3 mb-2">
							<div class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
								<svg class="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
								</svg>
							</div>
							<h3 class="font-semibold text-white">30-Day Usage Charts</h3>
						</div>
						<p class="text-sm text-zinc-400">Visualize your daily documentation generation trends</p>
					</div>

					<div class="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
						<div class="flex items-center gap-3 mb-2">
							<div class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
								<svg class="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
							</div>
							<h3 class="font-semibold text-white">Document Breakdown</h3>
						</div>
						<p class="text-sm text-zinc-400">See which doc types you generate most often</p>
					</div>

					<div class="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
						<div class="flex items-center gap-3 mb-2">
							<div class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
								<svg class="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
								</svg>
							</div>
							<h3 class="font-semibold text-white">Monthly Quota</h3>
						</div>
						<p class="text-sm text-zinc-400">Track repo usage against your plan limits</p>
					</div>

					<div class="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
						<div class="flex items-center gap-3 mb-2">
							<div class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
								<svg class="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
								</svg>
							</div>
							<h3 class="font-semibold text-white">Team Activity</h3>
						</div>
						<p class="text-sm text-zinc-400">Track member contributions and usage</p>
					</div>
				</div>

				{#if upgradeError}
					<div class="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
						{upgradeError}
					</div>
				{/if}

				<div class="flex flex-col sm:flex-row gap-3 justify-center">
					<button
						onclick={handleUpgrade}
						disabled={upgrading}
						class="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors inline-flex items-center justify-center gap-2"
					>
						{#if upgrading}
							<svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Processing...
						{:else}
							<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
							</svg>
							Upgrade to Pro
						{/if}
					</button>
					<a href="/dashboard" class="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-xl transition-colors inline-flex items-center justify-center gap-2">
						Back to Dashboard
					</a>
				</div>
			</div>
		{/if}
	</main>
</div>
