import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { removeTeamMember, leaveTeam, updateMemberRole } from '$lib/server/teams';
import { getValidatedUserId } from '$lib/server/session';

// DELETE /api/teams/[id]/members - Remove member or leave team
export const DELETE: RequestHandler = async ({ params, cookies, request }) => {
	// CRITICAL SECURITY: Validate session server-side
	const userId = await getValidatedUserId(cookies);

	try {
		const { memberId, action } = await request.json();

		if (action === 'leave') {
			// User leaving the team
			await leaveTeam(params.id, userId);
			return json({ success: true, message: 'Left team successfully' });
		}

		if (!memberId) {
			throw error(400, 'Member ID is required');
		}

		// Admin removing a member
		await removeTeamMember(params.id, memberId, userId);
		return json({ success: true, message: 'Member removed successfully' });
	} catch (err) {
		console.error('Error removing member:', err);
		throw error(500, err instanceof Error ? err.message : 'Failed to remove member');
	}
};

// PATCH /api/teams/[id]/members - Update member role
export const PATCH: RequestHandler = async ({ cookies, request }) => {
	// CRITICAL SECURITY: Validate session server-side
	const userId = await getValidatedUserId(cookies);

	try {
		const { memberId, role } = await request.json();

		if (!memberId) {
			throw error(400, 'Member ID is required');
		}

		if (!role || !['admin', 'member'].includes(role)) {
			throw error(400, 'Role must be admin or member');
		}

		await updateMemberRole(memberId, role, userId);
		return json({ success: true, message: 'Role updated successfully' });
	} catch (err) {
		console.error('Error updating role:', err);
		throw error(500, err instanceof Error ? err.message : 'Failed to update role');
	}
};
