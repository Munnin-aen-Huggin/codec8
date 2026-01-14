<script lang="ts">
	export let used: number = 0;
	export let limit: number = 30;
	export let tier: string = 'pro';
	export let periodEnd: string | null = null;
	export let breakdown: { readme: number; api: number; architecture: number; setup: number } = {
		readme: 0,
		api: 0,
		architecture: 0,
		setup: 0
	};

	$: usagePercent = Math.round((used / limit) * 100);
	$: isApproachingLimit = usagePercent >= 80;
	$: totalDocs = breakdown.readme + breakdown.api + breakdown.architecture + breakdown.setup;

	// Calculate days remaining in period
	$: daysRemaining = periodEnd
		? Math.max(0, Math.ceil((new Date(periodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
		: null;

	// Calculate usage trend (docs per day average)
	$: docsPerDay = daysRemaining && daysRemaining > 0
		? Math.round((totalDocs / (30 - daysRemaining)) * 10) / 10
		: 0;

	const docTypes = [
		{ key: 'readme', label: 'README', color: '#3b82f6' },
		{ key: 'api', label: 'API Docs', color: '#10b981' },
		{ key: 'architecture', label: 'Architecture', color: '#8b5cf6' },
		{ key: 'setup', label: 'Setup Guide', color: '#f59e0b' }
	] as const;
</script>

<div class="usage-analytics">
	<div class="analytics-header">
		<h3>Usage Analytics</h3>
		{#if daysRemaining !== null}
			<div class="period-badge">
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				{daysRemaining} days left
			</div>
		{/if}
	</div>

	<!-- Main Usage Bar -->
	<div class="usage-main">
		<div class="usage-header">
			<span class="usage-label">Repos Generated</span>
			<span class="usage-value {isApproachingLimit ? 'warning' : ''}">{used} / {limit}</span>
		</div>
		<div class="usage-bar-container">
			<div
				class="usage-bar {isApproachingLimit ? 'warning' : ''}"
				style="width: {Math.min(usagePercent, 100)}%"
			></div>
		</div>
		{#if isApproachingLimit}
			<p class="usage-warning">
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
				</svg>
				Approaching limit - {limit - used} repos remaining
			</p>
		{/if}
	</div>

	<!-- Doc Type Breakdown -->
	<div class="breakdown-section">
		<h4>Documentation Breakdown</h4>
		<div class="breakdown-grid">
			{#each docTypes as docType}
				<div class="breakdown-item">
					<div class="breakdown-icon" style="background: {docType.color}20; color: {docType.color}">
						{breakdown[docType.key]}
					</div>
					<span class="breakdown-label">{docType.label}</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Stats Row -->
	<div class="stats-row">
		<div class="stat">
			<span class="stat-value">{totalDocs}</span>
			<span class="stat-label">Total Docs</span>
		</div>
		<div class="stat">
			<span class="stat-value">{docsPerDay || '-'}</span>
			<span class="stat-label">Avg/Day</span>
		</div>
		<div class="stat">
			<span class="stat-value">{usagePercent}%</span>
			<span class="stat-label">Used</span>
		</div>
	</div>
</div>

<style>
	.usage-analytics {
		background: #18181b;
		border: 1px solid #27272a;
		border-radius: 12px;
		padding: 20px;
	}

	.analytics-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20px;
	}

	.analytics-header h3 {
		font-size: 1rem;
		font-weight: 600;
		color: #fff;
		margin: 0;
	}

	.period-badge {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 4px 10px;
		background: #27272a;
		border-radius: 6px;
		font-size: 0.8rem;
		color: #a1a1aa;
	}

	.usage-main {
		margin-bottom: 20px;
	}

	.usage-header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 8px;
	}

	.usage-label {
		font-size: 0.875rem;
		color: #a1a1aa;
	}

	.usage-value {
		font-size: 0.875rem;
		font-weight: 600;
		color: #fff;
	}

	.usage-value.warning {
		color: #fbbf24;
	}

	.usage-bar-container {
		height: 8px;
		background: #27272a;
		border-radius: 4px;
		overflow: hidden;
	}

	.usage-bar {
		height: 100%;
		background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
		border-radius: 4px;
		transition: width 0.3s ease;
	}

	.usage-bar.warning {
		background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
	}

	.usage-warning {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-top: 8px;
		font-size: 0.8rem;
		color: #fbbf24;
	}

	.breakdown-section {
		margin-bottom: 20px;
	}

	.breakdown-section h4 {
		font-size: 0.8rem;
		font-weight: 500;
		color: #71717a;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0 0 12px 0;
	}

	.breakdown-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 8px;
	}

	.breakdown-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
	}

	.breakdown-icon {
		width: 40px;
		height: 40px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1rem;
		font-weight: 600;
	}

	.breakdown-label {
		font-size: 0.7rem;
		color: #71717a;
		text-align: center;
	}

	.stats-row {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
		padding-top: 16px;
		border-top: 1px solid #27272a;
	}

	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
	}

	.stat-value {
		font-size: 1.25rem;
		font-weight: 700;
		color: #fff;
	}

	.stat-label {
		font-size: 0.7rem;
		color: #71717a;
		text-transform: uppercase;
	}

	@media (max-width: 480px) {
		.breakdown-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
