<script lang="ts">
	import { toast } from '$lib/stores/toast';
	import Header from '$lib/components/Header.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let name = '';
	let email = '';
	let githubUsername = '';
	let useCase = '';
	let isSubmitting = false;
	let isSubmitted = false;

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!name || !email || !githubUsername) {
			toast.error('Please fill in all required fields');
			return;
		}

		isSubmitting = true;

		try {
			const response = await fetch('/api/beta', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, githubUsername, useCase })
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Failed to sign up');
			}

			isSubmitted = true;
			toast.success('Thanks for signing up! Check your email for next steps.');
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Something went wrong');
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Beta Program - Codec8</title>
	<meta name="description" content="Join the Codec8 beta program and get early access to AI-powered documentation generation." />
</svelte:head>

{#if data.user}
	<Header
		username={data.user.github_username || data.user.email || ''}
		plan={data.user.plan || 'free'}
	/>
{/if}

<main class="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-12">
	<div class="max-w-2xl mx-auto px-4">
		{#if isSubmitted}
			<div class="bg-white rounded-2xl shadow-xl p-8 text-center">
				<div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
					<svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					</svg>
				</div>
				<h1 class="text-2xl font-bold text-gray-900 mb-4">You're on the list!</h1>
				<p class="text-gray-600 mb-6">
					Thanks for joining our beta program. We'll send you an email with your access credentials
					and a free Pro trial as a thank you for being an early tester.
				</p>
				<a href="/" class="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium">
					<svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
					</svg>
					Back to home
				</a>
			</div>
		{:else}
			<div class="text-center mb-8">
				<span class="inline-block px-4 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
					Limited Beta
				</span>
				<h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
					Be an Early Tester
				</h1>
				<p class="text-lg text-gray-600 max-w-lg mx-auto">
					Get free access to Codec8 and help shape the future of AI-powered documentation.
					Beta testers receive a free Pro trial!
				</p>
			</div>

			<div class="bg-white rounded-2xl shadow-xl p-8">
				<form on:submit={handleSubmit} class="space-y-6">
					<div>
						<label for="name" class="block text-sm font-medium text-gray-700 mb-1">
							Full Name <span class="text-red-500">*</span>
						</label>
						<input
							type="text"
							id="name"
							bind:value={name}
							required
							class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
							placeholder="John Doe"
						/>
					</div>

					<div>
						<label for="email" class="block text-sm font-medium text-gray-700 mb-1">
							Email Address <span class="text-red-500">*</span>
						</label>
						<input
							type="email"
							id="email"
							bind:value={email}
							required
							class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
							placeholder="john@example.com"
						/>
					</div>

					<div>
						<label for="github" class="block text-sm font-medium text-gray-700 mb-1">
							GitHub Username <span class="text-red-500">*</span>
						</label>
						<div class="relative">
							<span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
							<input
								type="text"
								id="github"
								bind:value={githubUsername}
								required
								class="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
								placeholder="johndoe"
							/>
						</div>
					</div>

					<div>
						<label for="useCase" class="block text-sm font-medium text-gray-700 mb-1">
							How will you use Codec8? <span class="text-gray-400">(optional)</span>
						</label>
						<textarea
							id="useCase"
							bind:value={useCase}
							rows="3"
							class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
							placeholder="e.g., I maintain 5+ open source projects and need help keeping docs up to date..."
						></textarea>
					</div>

					<button
						type="submit"
						disabled={isSubmitting}
						class="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isSubmitting ? 'Signing up...' : 'Join Beta Program'}
					</button>
				</form>

				<p class="mt-6 text-center text-sm text-gray-500">
					By signing up, you agree to provide feedback and help us improve Codec8.
				</p>
			</div>

			<div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
				<div class="bg-white/50 rounded-lg p-4">
					<div class="text-2xl font-bold text-indigo-600">7 Days</div>
					<div class="text-sm text-gray-600">Free Pro trial</div>
				</div>
				<div class="bg-white/50 rounded-lg p-4">
					<div class="text-2xl font-bold text-indigo-600">30 Repos</div>
					<div class="text-sm text-gray-600">During beta</div>
				</div>
				<div class="bg-white/50 rounded-lg p-4">
					<div class="text-2xl font-bold text-indigo-600">Direct</div>
					<div class="text-sm text-gray-600">Feedback channel</div>
				</div>
			</div>
		{/if}
	</div>
</main>
