import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getTeamTemplates, createTemplate, getDefaultTemplates } from '$lib/server/templates';
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

// GET /api/templates - List team templates or defaults
export const GET: RequestHandler = async ({ cookies, url }) => {
	const userId = getUserIdFromSession(cookies);

	const showDefaults = url.searchParams.get('defaults') === 'true';

	if (showDefaults) {
		return json({ templates: getDefaultTemplates() });
	}

	// Get user's team
	const { data: profile } = await supabaseAdmin
		.from('profiles')
		.select('default_team_id')
		.eq('id', userId)
		.single();

	const teamId = profile?.default_team_id;
	if (!teamId) {
		throw error(400, 'No team selected');
	}

	try {
		const templates = await getTeamTemplates(teamId);
		return json({ templates });
	} catch (err) {
		console.error('Error fetching templates:', err);
		throw error(500, 'Failed to fetch templates');
	}
};

// POST /api/templates - Create new template
export const POST: RequestHandler = async ({ cookies, request }) => {
	const userId = getUserIdFromSession(cookies);

	// Get user profile and verify team tier
	const { data: profile } = await supabaseAdmin
		.from('profiles')
		.select('subscription_tier, default_team_id')
		.eq('id', userId)
		.single();

	if (profile?.subscription_tier !== 'team') {
		throw error(403, 'Team subscription required');
	}

	const teamId = profile?.default_team_id;
	if (!teamId) {
		throw error(400, 'No team selected');
	}

	// Verify user is team admin
	const { data: member } = await supabaseAdmin
		.from('team_members')
		.select('role')
		.eq('team_id', teamId)
		.eq('user_id', userId)
		.single();

	if (!member || !['owner', 'admin'].includes(member.role)) {
		throw error(403, 'Admin access required');
	}

	try {
		const { docType, name, promptTemplate, isDefault } = await request.json();

		if (!docType || !name || !promptTemplate) {
			throw error(400, 'Missing required fields');
		}

		const validTypes = ['readme', 'api', 'architecture', 'setup'];
		if (!validTypes.includes(docType)) {
			throw error(400, 'Invalid document type');
		}

		const template = await createTemplate(
			teamId,
			docType,
			name.trim(),
			promptTemplate,
			userId,
			isDefault || false
		);

		return json({ template });
	} catch (err) {
		console.error('Error creating template:', err);
		throw error(500, err instanceof Error ? err.message : 'Failed to create template');
	}
};
