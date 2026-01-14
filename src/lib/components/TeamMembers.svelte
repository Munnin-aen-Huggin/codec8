<script lang="ts">
	import type { TeamMember, TeamInvitation } from '$lib/types';

	interface Props {
		teamId: string;
		members: TeamMember[];
		invitations?: TeamInvitation[];
		isAdmin: boolean;
		currentUserId: string;
	}

	let { teamId, members, invitations = [], isAdmin, currentUserId }: Props = $props();

	let inviteEmail = $state('');
	let inviteRole = $state<'member' | 'admin'>('member');
	let isInviting = $state(false);
	let inviteError = $state('');
	let inviteSuccess = $state('');

	let removingId = $state<string | null>(null);
	let cancelingId = $state<string | null>(null);

	async function inviteMember() {
		if (!inviteEmail.trim()) return;

		isInviting = true;
		inviteError = '';
		inviteSuccess = '';

		try {
			const res = await fetch(`/api/teams/${teamId}/invitations`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: inviteEmail, role: inviteRole })
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.message || 'Failed to send invitation');
			}

			inviteSuccess = `Invitation sent to ${inviteEmail}`;
			inviteEmail = '';
			// Reload page to show new invitation
			setTimeout(() => window.location.reload(), 1500);
		} catch (err) {
			inviteError = err instanceof Error ? err.message : 'Failed to send invitation';
		} finally {
			isInviting = false;
		}
	}

	async function removeMember(memberId: string) {
		if (!confirm('Are you sure you want to remove this member?')) return;

		removingId = memberId;

		try {
			const res = await fetch(`/api/teams/${teamId}/members`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ memberId })
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.message || 'Failed to remove member');
			}

			window.location.reload();
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Failed to remove member');
		} finally {
			removingId = null;
		}
	}

	async function cancelInvitation(invitationId: string) {
		cancelingId = invitationId;

		try {
			const res = await fetch(`/api/teams/${teamId}/invitations`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ invitationId })
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.message || 'Failed to cancel invitation');
			}

			window.location.reload();
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Failed to cancel invitation');
		} finally {
			cancelingId = null;
		}
	}

	async function updateRole(memberId: string, newRole: 'admin' | 'member') {
		try {
			const res = await fetch(`/api/teams/${teamId}/members`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ memberId, role: newRole })
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.message || 'Failed to update role');
			}

			window.location.reload();
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Failed to update role');
		}
	}

	function getRoleBadgeClasses(role: string) {
		switch (role) {
			case 'owner':
				return 'bg-amber-500/20 text-amber-400';
			case 'admin':
				return 'bg-violet-500/20 text-violet-400';
			default:
				return 'bg-zinc-700 text-zinc-300';
		}
	}
</script>

<div class="space-y-6">
	<!-- Members List -->
	<div class="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
		<div class="px-6 py-4 border-b border-zinc-800">
			<h3 class="text-lg font-semibold text-white">Team Members</h3>
			<p class="text-zinc-400 text-sm">{members.length} member{members.length !== 1 ? 's' : ''}</p>
		</div>

		<ul class="divide-y divide-zinc-800">
			{#each members as member}
				<li class="px-6 py-4 flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400">
							{member.profile?.github_username?.[0]?.toUpperCase() || member.profile?.email?.[0]?.toUpperCase() || '?'}
						</div>
						<div>
							<p class="text-white font-medium">
								{member.profile?.github_username || member.profile?.email || 'Unknown'}
								{#if member.user_id === currentUserId}
									<span class="text-zinc-500 text-sm">(you)</span>
								{/if}
							</p>
							<p class="text-zinc-500 text-sm">{member.profile?.email}</p>
						</div>
					</div>

					<div class="flex items-center gap-3">
						{#if isAdmin && member.role !== 'owner' && member.user_id !== currentUserId}
							<select
								value={member.role}
								onchange={(e) => updateRole(member.id, e.currentTarget.value as 'admin' | 'member')}
								class="bg-zinc-800 text-zinc-300 text-sm px-3 py-1.5 rounded-lg border border-zinc-700 focus:border-violet-500 focus:outline-none"
							>
								<option value="admin">Admin</option>
								<option value="member">Member</option>
							</select>
						{:else}
							<span class="px-2.5 py-1 text-xs font-medium rounded-full capitalize {getRoleBadgeClasses(member.role)}">
								{member.role}
							</span>
						{/if}

						{#if isAdmin && member.role !== 'owner' && member.user_id !== currentUserId}
							<button
								onclick={() => removeMember(member.id)}
								disabled={removingId === member.id}
								class="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
								title="Remove member"
							>
								{#if removingId === member.id}
									<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
										<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
								{:else}
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
									</svg>
								{/if}
							</button>
						{/if}
					</div>
				</li>
			{/each}
		</ul>
	</div>

	<!-- Pending Invitations -->
	{#if isAdmin && invitations.length > 0}
		<div class="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
			<div class="px-6 py-4 border-b border-zinc-800">
				<h3 class="text-lg font-semibold text-white">Pending Invitations</h3>
				<p class="text-zinc-400 text-sm">{invitations.length} pending</p>
			</div>

			<ul class="divide-y divide-zinc-800">
				{#each invitations as invitation}
					<li class="px-6 py-4 flex items-center justify-between">
						<div>
							<p class="text-white">{invitation.email}</p>
							<p class="text-zinc-500 text-sm">
								Invited as {invitation.role} · Expires {new Date(invitation.expires_at).toLocaleDateString()}
							</p>
						</div>

						<button
							onclick={() => cancelInvitation(invitation.id)}
							disabled={cancelingId === invitation.id}
							class="px-3 py-1.5 text-sm text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
						>
							{cancelingId === invitation.id ? 'Canceling...' : 'Cancel'}
						</button>
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	<!-- Invite Form -->
	{#if isAdmin}
		<div class="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
			<h3 class="text-lg font-semibold text-white mb-4">Invite Member</h3>

			{#if inviteError}
				<div class="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
					<p class="text-red-400 text-sm">{inviteError}</p>
				</div>
			{/if}

			{#if inviteSuccess}
				<div class="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
					<p class="text-green-400 text-sm">{inviteSuccess}</p>
				</div>
			{/if}

			<form onsubmit={(e) => { e.preventDefault(); inviteMember(); }} class="flex gap-3">
				<input
					type="email"
					bind:value={inviteEmail}
					placeholder="teammate@company.com"
					required
					class="flex-1 bg-zinc-800 text-white px-4 py-2.5 rounded-lg border border-zinc-700 focus:border-violet-500 focus:outline-none placeholder:text-zinc-500"
				/>
				<select
					bind:value={inviteRole}
					class="bg-zinc-800 text-zinc-300 px-4 py-2.5 rounded-lg border border-zinc-700 focus:border-violet-500 focus:outline-none"
				>
					<option value="member">Member</option>
					<option value="admin">Admin</option>
				</select>
				<button
					type="submit"
					disabled={isInviting || !inviteEmail.trim()}
					class="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-medium px-6 py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
				>
					{isInviting ? 'Sending...' : 'Send Invite'}
				</button>
			</form>
		</div>
	{/if}
</div>
