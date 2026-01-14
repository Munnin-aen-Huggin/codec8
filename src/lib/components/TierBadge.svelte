<script lang="ts">
	export let tier: 'free' | 'single' | 'pro' | 'team' = 'free';
	export let used: number = 0;
	export let limit: number = 1;
	export let showUsage: boolean = true;

	$: usagePercent = Math.round((used / limit) * 100);
	$: isApproachingLimit = usagePercent >= 80;

	const tierConfig = {
		free: {
			label: 'Free',
			icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', // clock
			gradient: 'from-zinc-600 to-zinc-500',
			textColor: 'text-zinc-300',
			ringColor: 'ring-zinc-500/30'
		},
		single: {
			label: 'Single',
			icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', // document
			gradient: 'from-blue-600 to-blue-500',
			textColor: 'text-blue-300',
			ringColor: 'ring-blue-500/30'
		},
		pro: {
			label: 'Pro',
			icon: 'M5 13l4 4L19 7', // checkmark
			gradient: 'from-emerald-600 to-emerald-500',
			textColor: 'text-emerald-300',
			ringColor: 'ring-emerald-500/30'
		},
		team: {
			label: 'Team',
			icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', // users
			gradient: 'from-purple-600 to-purple-500',
			textColor: 'text-purple-300',
			ringColor: 'ring-purple-500/30'
		}
	};

	$: config = tierConfig[tier];
</script>

<div class="tier-badge-wrapper">
	<div
		class="tier-badge bg-gradient-to-r {config.gradient} {config.ringColor} ring-1"
		class:pulse={isApproachingLimit && showUsage}
	>
		<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d={config.icon} />
		</svg>
		<span class="tier-label">{config.label}</span>
		{#if showUsage && (tier === 'pro' || tier === 'team')}
			<span class="tier-usage {isApproachingLimit ? 'warning' : ''}">
				{used}/{limit}
			</span>
		{/if}
	</div>

	{#if isApproachingLimit && showUsage && (tier === 'pro' || tier === 'team')}
		<div class="limit-indicator">
			<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
			</svg>
		</div>
	{/if}
</div>

<style>
	.tier-badge-wrapper {
		position: relative;
		display: inline-flex;
	}

	.tier-badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		border-radius: 20px;
		font-size: 0.8rem;
		font-weight: 600;
		color: #fff;
		white-space: nowrap;
	}

	.tier-badge.pulse {
		animation: pulse-ring 2s ease-in-out infinite;
	}

	@keyframes pulse-ring {
		0%, 100% {
			box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.4);
		}
		50% {
			box-shadow: 0 0 0 8px rgba(251, 191, 36, 0);
		}
	}

	.tier-label {
		font-weight: 600;
	}

	.tier-usage {
		padding: 2px 6px;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 10px;
		font-size: 0.7rem;
		font-weight: 500;
	}

	.tier-usage.warning {
		background: rgba(251, 191, 36, 0.3);
		color: #fef3c7;
	}

	.limit-indicator {
		position: absolute;
		top: -4px;
		right: -4px;
		width: 16px;
		height: 16px;
		background: #f59e0b;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #000;
		animation: bounce 1s infinite;
	}

	@keyframes bounce {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-3px);
		}
	}
</style>
