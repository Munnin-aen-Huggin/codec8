<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>Join {data.invitation.team.name} | CodeDoc AI</title>
</svelte:head>

<div class="min-h-screen bg-[#09090b] flex items-center justify-center px-4">
	<div class="max-w-md w-full">
		<div class="bg-zinc-900 rounded-xl border border-zinc-800 p-8">
			<!-- Header -->
			<div class="text-center mb-8">
				<div class="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
					<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
					</svg>
				</div>
				<h1 class="text-2xl font-bold text-white mb-2">Team Invitation</h1>
				<p class="text-zinc-400">You've been invited to join a team</p>
			</div>

			<!-- Invitation Details -->
			<div class="bg-zinc-800/50 rounded-lg p-4 mb-6 space-y-3">
				<div>
					<span class="text-zinc-500 text-sm">Team</span>
					<p class="text-white font-semibold">{data.invitation.team.name}</p>
				</div>
				<div>
					<span class="text-zinc-500 text-sm">Role</span>
					<p class="text-white capitalize">{data.invitation.role}</p>
				</div>
				<div>
					<span class="text-zinc-500 text-sm">Invited by</span>
					<p class="text-white">
						{data.invitation.invitedBy?.github_username || data.invitation.invitedBy?.email || 'Team Admin'}
					</p>
				</div>
				<div>
					<span class="text-zinc-500 text-sm">Sent to</span>
					<p class="text-white">{data.invitation.email}</p>
				</div>
			</div>

			<!-- Error Message -->
			{#if form?.error}
				<div class="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
					<p class="text-red-400 text-sm">{form.error}</p>
				</div>
			{/if}

			<!-- Actions -->
			{#if data.isLoggedIn}
				{#if data.userEmail?.toLowerCase() === data.invitation.email.toLowerCase()}
					<form method="POST" action="?/accept" use:enhance>
						<button
							type="submit"
							class="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
						>
							Accept Invitation
						</button>
					</form>
				{:else}
					<div class="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
						<p class="text-yellow-400 text-sm">
							This invitation was sent to <strong>{data.invitation.email}</strong>, but you're logged in as <strong>{data.userEmail}</strong>.
							Please log in with the correct account.
						</p>
					</div>
					<a
						href="/auth/logout?redirect=/teams/invite/{data.invitation.token}"
						class="block w-full text-center bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
					>
						Switch Account
					</a>
				{/if}
			{:else}
				<a
					href="/auth/login?redirect=/teams/invite/{data.invitation.token}"
					class="block w-full text-center bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
				>
					Sign In to Accept
				</a>
				<p class="text-zinc-500 text-sm text-center mt-4">
					Don't have an account? Signing in will create one automatically.
				</p>
			{/if}

			<!-- Expiration Notice -->
			<p class="text-zinc-600 text-xs text-center mt-6">
				This invitation expires on {new Date(data.invitation.expiresAt).toLocaleDateString()}
			</p>
		</div>

		<!-- Back Link -->
		<div class="text-center mt-6">
			<a href="/" class="text-zinc-500 hover:text-zinc-400 text-sm">
				← Back to CodeDoc AI
			</a>
		</div>
	</div>
</div>
