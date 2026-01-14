import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createTeam, getUserTeams } from '$lib/server/teams';

// GET /api/teams - Get user's teams
export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	try {
		const teams = await getUserTeams(locals.user.id);
		return json({ teams });
	} catch (err) {
		console.error('Error fetching teams:', err);
		throw error(500, 'Failed to fetch teams');
	}
};

// POST /api/teams - Create new team
export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	// Check if user has Team tier
	if (locals.profile?.subscription_tier !== 'team') {
		throw error(403, 'Team tier subscription required');
	}

	try {
		const { name } = await request.json();

		if (!name || name.trim().length < 2) {
			throw error(400, 'Team name must be at least 2 characters');
		}

		const team = await createTeam(locals.user.id, name.trim());
		return json({ team });
	} catch (err) {
		console.error('Error creating team:', err);
		throw error(500, err instanceof Error ? err.message : 'Failed to create team');
	}
};
