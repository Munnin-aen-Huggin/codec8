<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	// Configurable end date - defaults to 7 days from now
	export let endDate: Date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
	export let originalPrice: number = 149;
	export let salePrice: number = 99;

	let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
	let dismissed = false;
	let interval: ReturnType<typeof setInterval> | null = null;

	const DISMISS_KEY = 'urgency_banner_dismissed';
	const DISMISS_DURATION = 24 * 60 * 60 * 1000; // 24 hours

	function calculateTimeLeft() {
		const now = new Date().getTime();
		const end = endDate.getTime();
		const difference = end - now;

		if (difference <= 0) {
			timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
			return;
		}

		timeLeft = {
			days: Math.floor(difference / (1000 * 60 * 60 * 24)),
			hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
			minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
			seconds: Math.floor((difference % (1000 * 60)) / 1000)
		};
	}

	function dismiss() {
		dismissed = true;
		if (browser) {
			localStorage.setItem(DISMISS_KEY, Date.now().toString());
		}
	}

	function checkDismissed(): boolean {
		if (!browser) return false;
		const dismissedAt = localStorage.getItem(DISMISS_KEY);
		if (!dismissedAt) return false;
		const elapsed = Date.now() - parseInt(dismissedAt, 10);
		return elapsed < DISMISS_DURATION;
	}

	onMount(() => {
		// Check if already dismissed
		if (checkDismissed()) {
			dismissed = true;
			return;
		}

		// Calculate initial time
		calculateTimeLeft();

		// Update every second
		interval = setInterval(calculateTimeLeft, 1000);
	});

	onDestroy(() => {
		if (interval) clearInterval(interval);
	});

	$: formattedTime = `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`;
	$: isExpired = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;
</script>

{#if !dismissed && !isExpired}
	<div class="urgency-banner" role="alert" aria-live="polite">
		<div class="banner-content">
			<span class="banner-icon">🚀</span>
			<span class="banner-text">
				<strong>Launch Special:</strong> ${salePrice}
				<span class="original-price">(normally ${originalPrice})</span>
				<span class="countdown-separator">—</span>
				<span class="countdown">Ends in <strong>{formattedTime}</strong></span>
			</span>
		</div>
		<button
			class="dismiss-btn"
			on:click={dismiss}
			aria-label="Dismiss banner"
		>
			<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
	</div>
{/if}

<style>
	.urgency-banner {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 999;
		background: linear-gradient(90deg, #10b981 0%, #059669 100%);
		color: #000;
		padding: 12px 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16px;
		font-size: 0.95rem;
		box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
	}

	.banner-content {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
		justify-content: center;
	}

	.banner-icon {
		font-size: 1.2rem;
	}

	.banner-text {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-wrap: wrap;
		justify-content: center;
	}

	.original-price {
		opacity: 0.8;
		text-decoration: line-through;
	}

	.countdown-separator {
		margin: 0 4px;
	}

	.countdown {
		font-weight: 500;
	}

	.countdown strong {
		font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
		letter-spacing: 0.02em;
	}

	.dismiss-btn {
		background: rgba(0, 0, 0, 0.2);
		border: none;
		border-radius: 50%;
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: #000;
		transition: background 0.2s;
		flex-shrink: 0;
	}

	.dismiss-btn:hover {
		background: rgba(0, 0, 0, 0.3);
	}

	.dismiss-btn svg {
		width: 16px;
		height: 16px;
	}

	/* Mobile */
	@media (max-width: 640px) {
		.urgency-banner {
			padding: 10px 12px;
			font-size: 0.85rem;
		}

		.countdown-separator {
			display: none;
		}

		.banner-text {
			text-align: center;
		}

		.countdown {
			display: block;
			width: 100%;
		}
	}
</style>
