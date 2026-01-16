import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createTeam, getUserTeams } from '$lib/server/teams';
import { supabaseAdmin } from '$lib/server/supabase';
import { getValidatedUserId } from '$lib/server/session';

// GET /api/teams - Get user's teams
export const GET: RequestHandler = async ({ cookies }) => {
	// CRITICAL SECURITY: Validate session server-side
	const userId = await getValidatedUserId(cookies);

	try {
		const teams = await getUserTeams(userId);
		return json({ teams });
	} catch (err) {
		console.error('Error fetching teams:', err);
		throw error(500, 'Failed to fetch teams');
	}
};

// POST /api/teams - Create new team
export const POST: RequestHandler = async ({ cookies, request }) => {
	// CRITICAL SECURITY: Validate session server-side
	const userId = await getValidatedUserId(cookies);

	// Check if user has Team tier
	const { data: profile } = await supabaseAdmin
		.from('profiles')
		.select('subscription_tier')
		.eq('id', userId)
		.single();

	if (profile?.subscription_tier !== 'team') {
		throw error(403, 'Team tier subscription required');
	}

	try {
		const { name } = await request.json();

		if (!name || name.trim().length < 2) {
			throw error(400, 'Team name must be at least 2 characters');
		}

		const team = await createTeam(userId, name.trim());
		return json({ team });
	} catch (err) {
		console.error('Error creating team:', err);
		throw error(500, err instanceof Error ? err.message : 'Failed to create team');
	}
};
