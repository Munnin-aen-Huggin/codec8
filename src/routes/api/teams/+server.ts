import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createTeam, getUserTeams } from '$lib/server/teams';
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

// GET /api/teams - Get user's teams
export const GET: RequestHandler = async ({ cookies }) => {
	const userId = getUserIdFromSession(cookies);

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
	const userId = getUserIdFromSession(cookies);

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
