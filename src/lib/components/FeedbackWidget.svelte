<script lang="ts">
	import { toast } from '$lib/stores/toast';
	import { page } from '$app/stores';

	let isOpen = false;
	let type: 'bug' | 'feature' | 'other' = 'bug';
	let message = '';
	let isSubmitting = false;

	function toggleWidget() {
		isOpen = !isOpen;
		if (isOpen) {
			message = '';
			type = 'bug';
		}
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!message.trim()) {
			toast.error('Please enter your feedback');
			return;
		}

		isSubmitting = true;

		try {
			const response = await fetch('/api/feedback', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					type,
					message: message.trim(),
					page: $page.url.pathname,
					metadata: {
						userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
						screenSize:
							typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : null
					}
				})
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Failed to submit feedback');
			}

			toast.success('Thanks for your feedback!');
			isOpen = false;
			message = '';
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Something went wrong');
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="feedback-widget">
	{#if isOpen}
		<div class="feedback-panel">
			<div class="feedback-header">
				<h3>Send Feedback</h3>
				<button type="button" class="close-btn" on:click={toggleWidget} aria-label="Close feedback">
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<form on:submit={handleSubmit} class="feedback-form">
				<div class="type-selector">
					<button
						type="button"
						class="type-btn"
						class:active={type === 'bug'}
						on:click={() => (type = 'bug')}
					>
						<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
						</svg>
						Bug
					</button>
					<button
						type="button"
						class="type-btn"
						class:active={type === 'feature'}
						on:click={() => (type = 'feature')}
					>
						<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
						</svg>
						Feature
					</button>
					<button
						type="button"
						class="type-btn"
						class:active={type === 'other'}
						on:click={() => (type = 'other')}
					>
						<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
						</svg>
						Other
					</button>
				</div>

				<textarea
					bind:value={message}
					placeholder={type === 'bug'
						? 'Describe the bug you encountered...'
						: type === 'feature'
							? 'Describe the feature you would like...'
							: 'Tell us what you think...'}
					rows="4"
					class="feedback-textarea"
				></textarea>

				<button
					type="submit"
					class="submit-btn"
					disabled={isSubmitting || !message.trim()}
				>
					{isSubmitting ? 'Sending...' : 'Send Feedback'}
				</button>
			</form>
		</div>
	{/if}

	<button
		type="button"
		class="trigger-btn"
		class:open={isOpen}
		on:click={toggleWidget}
		aria-label="Open feedback widget"
	>
		{#if isOpen}
			<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			</svg>
		{:else}
			<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
			</svg>
		{/if}
	</button>
</div>

<style>
	.feedback-widget {
		position: fixed;
		bottom: 1.5rem;
		right: 1.5rem;
		z-index: 50;
	}

	.trigger-btn {
		width: 3.5rem;
		height: 3.5rem;
		border-radius: 50%;
		background: #4f46e5;
		color: white;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
		transition: all 0.2s;
	}

	.trigger-btn:hover {
		background: #4338ca;
		transform: scale(1.05);
	}

	.trigger-btn.open {
		background: #6b7280;
	}

	.feedback-panel {
		position: absolute;
		bottom: 4.5rem;
		right: 0;
		width: 320px;
		background: white;
		border-radius: 1rem;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
		overflow: hidden;
	}

	.feedback-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.feedback-header h3 {
		font-size: 1rem;
		font-weight: 600;
		color: #111827;
		margin: 0;
	}

	.close-btn {
		padding: 0.25rem;
		background: none;
		border: none;
		color: #6b7280;
		cursor: pointer;
		border-radius: 0.375rem;
	}

	.close-btn:hover {
		background: #f3f4f6;
		color: #374151;
	}

	.feedback-form {
		padding: 1rem;
	}

	.type-selector {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.type-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.375rem;
		padding: 0.5rem;
		font-size: 0.875rem;
		background: #f3f4f6;
		border: 1px solid transparent;
		border-radius: 0.5rem;
		color: #6b7280;
		cursor: pointer;
		transition: all 0.15s;
	}

	.type-btn:hover {
		background: #e5e7eb;
	}

	.type-btn.active {
		background: #eef2ff;
		border-color: #c7d2fe;
		color: #4f46e5;
	}

	.feedback-textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		resize: none;
		margin-bottom: 1rem;
	}

	.feedback-textarea:focus {
		outline: none;
		border-color: #a5b4fc;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
	}

	.submit-btn {
		width: 100%;
		padding: 0.75rem;
		background: #4f46e5;
		color: white;
		font-size: 0.875rem;
		font-weight: 500;
		border: none;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: background 0.15s;
	}

	.submit-btn:hover:not(:disabled) {
		background: #4338ca;
	}

	.submit-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	@media (max-width: 400px) {
		.feedback-panel {
			width: calc(100vw - 3rem);
			right: -0.5rem;
		}
	}
</style>
