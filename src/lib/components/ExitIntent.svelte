<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	let show = false;
	let email = '';
	let submitting = false;
	let submitted = false;
	let error = '';

	const STORAGE_KEY = 'codec8_exit_intent_shown';

	function handleMouseLeave(e: MouseEvent) {
		// Only trigger when mouse actually leaves the document (not just moving to nav)
		// Check if mouse is leaving the viewport entirely (relatedTarget is null or outside)
		const relatedTarget = e.relatedTarget as Node | null;
		const isLeavingDocument = !relatedTarget || !document.body.contains(relatedTarget);

		if (e.clientY < 10 && isLeavingDocument && !show && !hasBeenShown()) {
			show = true;
			markAsShown();
			trackEvent('exit_intent_shown');
		}
	}

	function hasBeenShown(): boolean {
		if (!browser) return true;
		return sessionStorage.getItem(STORAGE_KEY) === 'true';
	}

	function markAsShown(): void {
		if (browser) {
			sessionStorage.setItem(STORAGE_KEY, 'true');
		}
	}

	function trackEvent(eventName: string) {
		// Fire and forget analytics
		fetch('/api/analytics', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ event: eventName, source: 'exit_intent' })
		}).catch(() => {});
	}

	function close() {
		show = false;
	}

	function validateEmail(email: string): boolean {
		const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailPattern.test(email);
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';

		if (!email.trim()) {
			error = 'Please enter your email';
			return;
		}

		if (!validateEmail(email)) {
			error = 'Please enter a valid email address';
			return;
		}

		submitting = true;

		try {
			const response = await fetch('/api/leads', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: email.trim(), source: 'exit_intent' })
			});

			if (!response.ok) {
				const data = await response.json().catch(() => ({}));
				throw new Error(data.error || 'Failed to subscribe');
			}

			submitted = true;
			trackEvent('exit_intent_submitted');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
		} finally {
			submitting = false;
		}
	}

	onMount(() => {
		if (browser) {
			document.addEventListener('mouseout', handleMouseLeave as EventListener);
		}
	});

	onDestroy(() => {
		if (browser) {
			document.removeEventListener('mouseout', handleMouseLeave as EventListener);
		}
	});
</script>

{#if show}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div class="overlay" on:click={close} on:keydown={(e) => e.key === 'Escape' && close()} role="presentation">
		<div class="popup" on:click|stopPropagation on:keydown|stopPropagation role="dialog" aria-modal="true" aria-labelledby="exit-intent-title" tabindex="-1">
			<button class="close-btn" on:click={close} aria-label="Close popup">
				&times;
			</button>

			{#if submitted}
				<div class="success-state">
					<div class="success-icon">✓</div>
					<h2>Check your inbox!</h2>
					<p>We've sent you the "Documentation That Doesn't Suck" checklist.</p>
					<button class="close-link" on:click={close}>Close</button>
				</div>
			{:else}
				<h2 id="exit-intent-title">Wait — before you go...</h2>
				<p class="popup-subtitle">
					Get our <strong>"Documentation That Doesn't Suck"</strong> checklist
				</p>

				<div class="checklist-preview">
					<div class="checklist-item">✓ 12-point README quality check</div>
					<div class="checklist-item">✓ API documentation structure template</div>
					<div class="checklist-item">✓ Common doc mistakes to avoid</div>
				</div>

				<form on:submit={handleSubmit}>
					<input
						type="email"
						placeholder="your@email.com"
						bind:value={email}
						class="email-input"
						disabled={submitting}
					/>
					{#if error}
						<div class="error-message">{error}</div>
					{/if}
					<button type="submit" class="submit-btn" disabled={submitting}>
						{#if submitting}
							Sending...
						{:else}
							Send Me The Checklist
						{/if}
					</button>
				</form>

				<p class="privacy-note">No spam. Unsubscribe anytime.</p>
			{/if}
		</div>
	</div>
{/if}

<style>
	.overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10000;
		padding: 20px;
		animation: fadeIn 0.2s ease-out;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.popup {
		background: #111113;
		border: 1px solid #262628;
		border-radius: 16px;
		padding: 40px;
		max-width: 440px;
		width: 100%;
		position: relative;
		animation: slideUp 0.3s ease-out;
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.close-btn {
		position: absolute;
		top: 12px;
		right: 16px;
		background: none;
		border: none;
		color: #6b6b70;
		font-size: 28px;
		cursor: pointer;
		padding: 4px 8px;
		line-height: 1;
		transition: color 0.2s;
	}

	.close-btn:hover {
		color: #fff;
	}

	h2 {
		font-size: 1.5rem;
		font-weight: 700;
		color: #fff;
		margin-bottom: 12px;
		text-align: center;
	}

	.popup-subtitle {
		color: #a1a1a6;
		text-align: center;
		margin-bottom: 24px;
		font-size: 1rem;
	}

	.popup-subtitle strong {
		color: #10b981;
	}

	.checklist-preview {
		background: rgba(16, 185, 129, 0.05);
		border: 1px solid rgba(16, 185, 129, 0.2);
		border-radius: 10px;
		padding: 16px;
		margin-bottom: 24px;
	}

	.checklist-item {
		color: #a1a1a6;
		font-size: 0.9rem;
		padding: 6px 0;
	}

	.checklist-item:first-child {
		padding-top: 0;
	}

	.checklist-item:last-child {
		padding-bottom: 0;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.email-input {
		background: #000;
		border: 1px solid #262628;
		border-radius: 10px;
		padding: 14px 16px;
		color: #fff;
		font-size: 1rem;
		outline: none;
		transition: border-color 0.2s;
	}

	.email-input:focus {
		border-color: #10b981;
	}

	.email-input::placeholder {
		color: #6b6b70;
	}

	.email-input:disabled {
		opacity: 0.6;
	}

	.error-message {
		color: #ef4444;
		font-size: 0.9rem;
		text-align: center;
	}

	.submit-btn {
		background: #10b981;
		color: #000;
		border: none;
		border-radius: 10px;
		padding: 14px 24px;
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s;
	}

	.submit-btn:hover:not(:disabled) {
		background: #059669;
		transform: translateY(-1px);
	}

	.submit-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.privacy-note {
		text-align: center;
		color: #6b6b70;
		font-size: 0.85rem;
		margin-top: 16px;
	}

	/* Success state */
	.success-state {
		text-align: center;
		padding: 20px 0;
	}

	.success-icon {
		width: 60px;
		height: 60px;
		background: #10b981;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28px;
		color: #000;
		margin: 0 auto 20px;
	}

	.success-state h2 {
		color: #10b981;
	}

	.success-state p {
		color: #a1a1a6;
		margin-bottom: 24px;
	}

	.close-link {
		background: none;
		border: 1px solid #262628;
		color: #a1a1a6;
		padding: 10px 24px;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.close-link:hover {
		border-color: #10b981;
		color: #fff;
	}

	@media (max-width: 480px) {
		.popup {
			padding: 32px 24px;
		}

		h2 {
			font-size: 1.3rem;
		}
	}
</style>
