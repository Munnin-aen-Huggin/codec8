import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getTeamWithMembers } from '$lib/server/teams';
import { supabaseAdmin } from '$lib/server/supabase';

function getUserIdFromSession(cookies: { get: (name: string) => string | undefined }): string {
	const session = cookies.get('session');
	if (!session) {
		throw error(401, 'Unauthorized');
	}
	try {
		const parsed = JSON.parse(session);
		if (!parsed.userId) {
			throw error(401, 'Invalid session');
		}
		return parsed.userId;
	} catch {
		throw error(401, 'Invalid session');
	}
}

// GET /api/teams/[id] - Get team details
export const GET: RequestHandler = async ({ params, cookies }) => {
	const userId = getUserIdFromSession(cookies);

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
	const userId = getUserIdFromSession(cookies);

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
