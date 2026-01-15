<script lang="ts">
	import { onMount } from 'svelte';

	export let teamId: string | null = null;
	export let compact: boolean = false;

	interface Stats {
		totalDocs: number;
		reposConnected: number;
		avgGenerationTime: number;
		docsByType: Record<string, number>;
		dailyUsage: Array<{ date: string; count: number }>;
	}

	let stats: Stats | null = null;
	let quotaUsed = 0;
	let quotaLimit = 30;
	let memberUsage: Array<{ userId: string; username: string; count: number }> = [];
	let loading = true;
	let error = '';

	const docTypeColors: Record<string, string> = {
		readme: '#10b981',
		api: '#3b82f6',
		architecture: '#8b5cf6',
		setup: '#f59e0b'
	};

	const docTypeLabels: Record<string, string> = {
		readme: 'README',
		api: 'API Docs',
		architecture: 'Architecture',
		setup: 'Setup Guide'
	};

	onMount(async () => {
		try {
			const url = teamId ? `/api/analytics/usage?teamId=${teamId}` : '/api/analytics/usage';
			const res = await fetch(url);
			if (!res.ok) {
				if (res.status === 403) {
					error = 'Upgrade to Pro or Team for analytics';
				} else {
					throw new Error('Failed to load');
				}
				return;
			}

			const data = await res.json();
			stats = data.stats;
			quotaUsed = data.quotaUsed || 0;
			quotaLimit = data.quotaLimit || 30;
			memberUsage = data.memberUsage || [];
		} catch (err) {
			error = 'Unable to load usage data';
		} finally {
			loading = false;
		}
	});

	function getMaxDailyCount(): number {
		if (!stats) return 10;
		return Math.max(...stats.dailyUsage.map(d => d.count), 5);
	}

	function formatDate(dateStr: string): string {
		const d = new Date(dateStr);
		return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}

	function formatMs(ms: number): string {
		if (ms < 1000) return `${ms}ms`;
		return `${(ms / 1000).toFixed(1)}s`;
	}

	$: quotaPercent = quotaLimit > 0 ? (quotaUsed / quotaLimit) * 100 : 0;
	$: isNearLimit = quotaPercent >= 80;
</script>

<div class="space-y-6">
	{#if loading}
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
			{#each Array(4) as _}
				<div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
					<div class="h-4 w-20 bg-zinc-800 rounded mb-2 animate-pulse"></div>
					<div class="h-8 w-16 bg-zinc-800 rounded animate-pulse"></div>
				</div>
			{/each}
		</div>
	{:else if error}
		<div class="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center text-zinc-400">{error}</div>
	{:else if stats}
		<!-- Summary Cards -->
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
			<div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
				<p class="text-zinc-500 text-sm">Total Docs Generated</p>
				<p class="text-2xl font-bold text-white">{stats.totalDocs}</p>
			</div>
			<div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
				<p class="text-zinc-500 text-sm">Repos Connected</p>
				<p class="text-2xl font-bold text-white">{stats.reposConnected}</p>
			</div>
			<div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
				<p class="text-zinc-500 text-sm">Avg Generation Time</p>
				<p class="text-2xl font-bold text-white">{formatMs(stats.avgGenerationTime)}</p>
			</div>
			<div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
				<p class="text-zinc-500 text-sm">Quota Used</p>
				<p class="text-2xl font-bold {isNearLimit ? 'text-amber-400' : 'text-white'}">
					{quotaUsed}/{quotaLimit}
				</p>
			</div>
		</div>

		<!-- Quota Progress -->
		<div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
			<div class="flex justify-between items-center mb-2">
				<span class="text-zinc-400">Monthly Quota</span>
				<span class="text-sm {isNearLimit ? 'text-amber-400' : 'text-zinc-500'}">
					{quotaPercent.toFixed(0)}% used
				</span>
			</div>
			<div class="h-3 bg-zinc-800 rounded-full overflow-hidden">
				<div
					class="h-full transition-all duration-500 rounded-full {isNearLimit ? 'bg-amber-500' : 'bg-emerald-500'}"
					style="width: {Math.min(quotaPercent, 100)}%"
				></div>
			</div>
		</div>

		{#if !compact}
			<!-- Daily Usage Chart -->
			<div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
				<h3 class="text-lg font-semibold text-white mb-4">Daily Usage (Last 30 Days)</h3>
				<div class="h-40 flex items-end gap-1">
					{#each stats.dailyUsage as day}
						{@const height = getMaxDailyCount() > 0 ? (day.count / getMaxDailyCount()) * 100 : 0}
						<div class="flex-1 flex flex-col items-center group relative">
							<div
								class="w-full bg-violet-500/80 rounded-t transition-all hover:bg-violet-500"
								style="height: {Math.max(height, 2)}%"
							></div>
							<!-- Tooltip -->
							<div class="absolute bottom-full mb-2 hidden group-hover:block z-10">
								<div class="bg-zinc-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
									{formatDate(day.date)}: {day.count} docs
								</div>
							</div>
						</div>
					{/each}
				</div>
				<div class="flex justify-between mt-2 text-xs text-zinc-500">
					<span>{formatDate(stats.dailyUsage[0]?.date || '')}</span>
					<span>{formatDate(stats.dailyUsage[stats.dailyUsage.length - 1]?.date || '')}</span>
				</div>
			</div>

			<!-- Doc Types Breakdown -->
			<div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
				<h3 class="text-lg font-semibold text-white mb-4">By Document Type</h3>
				<div class="space-y-3">
					{#each Object.entries(stats.docsByType) as [type, count]}
						{@const percent = stats.totalDocs > 0 ? (count / stats.totalDocs) * 100 : 0}
						<div>
							<div class="flex justify-between text-sm mb-1">
								<span class="text-zinc-400">{docTypeLabels[type] || type}</span>
								<span class="text-zinc-500">{count} ({percent.toFixed(0)}%)</span>
							</div>
							<div class="h-2 bg-zinc-800 rounded-full overflow-hidden">
								<div
									class="h-full rounded-full transition-all duration-500"
									style="width: {percent}%; background-color: {docTypeColors[type] || '#6b7280'}"
								></div>
							</div>
						</div>
					{/each}
					{#if Object.keys(stats.docsByType).length === 0}
						<p class="text-zinc-500 text-sm">No documentation generated yet</p>
					{/if}
				</div>
			</div>

			<!-- Team Member Usage (if team) -->
			{#if memberUsage.length > 0}
				<div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
					<h3 class="text-lg font-semibold text-white mb-4">Team Member Activity</h3>
					<div class="space-y-2">
						{#each memberUsage as member}
							{@const percent = stats.totalDocs > 0 ? (member.count / stats.totalDocs) * 100 : 0}
							<div class="flex items-center gap-3">
								<div class="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center">
									<span class="text-zinc-400 text-sm font-medium">
										{member.username[0]?.toUpperCase() || '?'}
									</span>
								</div>
								<div class="flex-1">
									<div class="flex justify-between text-sm">
										<span class="text-white">{member.username}</span>
										<span class="text-zinc-500">{member.count} docs</span>
									</div>
									<div class="h-1.5 bg-zinc-800 rounded-full mt-1 overflow-hidden">
										<div
											class="h-full bg-violet-500 rounded-full"
											style="width: {percent}%"
										></div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		{/if}
	{/if}
</div>
