import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getTeamWithMembers } from '$lib/server/teams';
import { supabaseAdmin } from '$lib/server/supabase';
import { getValidatedUserId } from '$lib/server/session';

// GET /api/teams/[id] - Get team details
export const GET: RequestHandler = async ({ params, cookies }) => {
	// CRITICAL SECURITY: Validate session server-side
	const userId = await getValidatedUserId(cookies);

	try {
		const result = await getTeamWithMembers(params.id, userId);
		return json(result);
	} catch (err) {
		console.error('Error fetching team:', err);
		throw error(500, err instanceof Error ? err.message : 'Failed to fetch team');
	}
};

// DELETE /api/teams/[id] - Delete team (owner only)
export const DELETE: RequestHandler = async ({ params, cookies }) => {
	// CRITICAL SECURITY: Validate session server-side
	const userId = await getValidatedUserId(cookies);

	// Verify ownership
	const { data: team } = await supabaseAdmin
		.from('teams')
		.select('owner_id')
		.eq('id', params.id)
		.single();

	if (team?.owner_id !== userId) {
		throw error(403, 'Only the team owner can delete the team');
	}

	try {
		await supabaseAdmin.from('teams').delete().eq('id', params.id);
		return json({ success: true });
	} catch (err) {
		console.error('Error deleting team:', err);
		throw error(500, 'Failed to delete team');
	}
};
