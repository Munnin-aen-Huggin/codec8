import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createInvitation, getTeamInvitations, cancelInvitation } from '$lib/server/teams';
import { supabaseAdmin } from '$lib/server/supabase';

// GET /api/teams/[id]/invitations - Get pending invitations
export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	// Verify admin access
	const { data: membership } = await supabaseAdmin
		.from('team_members')
		.select('role')
		.eq('team_id', params.id)
		.eq('user_id', locals.user.id)
		.single();

	if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
		throw error(403, 'Only team admins can view invitations');
	}

	try {
		const invitations = await getTeamInvitations(params.id);
		return json({ invitations });
	} catch (err) {
		console.error('Error fetching invitations:', err);
		throw error(500, 'Failed to fetch invitations');
	}
};

// POST /api/teams/[id]/invitations - Create invitation
export const POST: RequestHandler = async ({ params, locals, request }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	// Verify admin access
	const { data: membership } = await supabaseAdmin
		.from('team_members')
		.select('role')
		.eq('team_id', params.id)
		.eq('user_id', locals.user.id)
		.single();

	if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
		throw error(403, 'Only team admins can invite members');
	}

	try {
		const { email, role } = await request.json();

		if (!email || !email.includes('@')) {
			throw error(400, 'Valid email is required');
		}

		if (role && !['admin', 'member'].includes(role)) {
			throw error(400, 'Role must be admin or member');
		}

		const invitation = await createInvitation(
			params.id,
			email,
			role || 'member',
			locals.user.id
		);

		return json({ invitation });
	} catch (err) {
		console.error('Error creating invitation:', err);
		throw error(500, err instanceof Error ? err.message : 'Failed to create invitation');
	}
};

// DELETE /api/teams/[id]/invitations - Cancel invitation
export const DELETE: RequestHandler = async ({ params, locals, request }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	// Verify admin access
	const { data: membership } = await supabaseAdmin
		.from('team_members')
		.select('role')
		.eq('team_id', params.id)
		.eq('user_id', locals.user.id)
		.single();

	if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
		throw error(403, 'Only team admins can cancel invitations');
	}

	try {
		const { invitationId } = await request.json();

		if (!invitationId) {
			throw error(400, 'Invitation ID is required');
		}

		await cancelInvitation(invitationId);
		return json({ success: true });
	} catch (err) {
		console.error('Error canceling invitation:', err);
		throw error(500, 'Failed to cancel invitation');
	}
};
