import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { updateTemplate, deleteTemplate, duplicateTemplate } from '$lib/server/templates';
import { supabaseAdmin } from '$lib/server/supabase';
import { getValidatedUserId } from '$lib/server/session';

// Helper to verify admin access
async function verifyAdminAccess(templateId: string, userId: string): Promise<string> {
	const { data: template } = await supabaseAdmin
		.from('doc_templates')
		.select('team_id')
		.eq('id', templateId)
		.single();

	if (!template) throw new Error('Template not found');

	const { data: member } = await supabaseAdmin
		.from('team_members')
		.select('role')
		.eq('team_id', template.team_id)
		.eq('user_id', userId)
		.single();

	if (!member || !['owner', 'admin'].includes(member.role)) {
		throw new Error('Admin access required');
	}

	return template.team_id;
}

// PATCH /api/templates/[id] - Update template
export const PATCH: RequestHandler = async ({ params, cookies, request }) => {
	// CRITICAL SECURITY: Validate session server-side
	const userId = await getValidatedUserId(cookies);

	try {
		const teamId = await verifyAdminAccess(params.id, userId);
		const updates = await request.json();

		const template = await updateTemplate(params.id, updates, teamId);
		return json({ template });
	} catch (err) {
		console.error('Error updating template:', err);
		throw error(500, err instanceof Error ? err.message : 'Failed to update template');
	}
};

// DELETE /api/templates/[id] - Delete template
export const DELETE: RequestHandler = async ({ params, cookies }) => {
	// CRITICAL SECURITY: Validate session server-side
	const userId = await getValidatedUserId(cookies);

	try {
		await verifyAdminAccess(params.id, userId);
		await deleteTemplate(params.id);
		return json({ success: true });
	} catch (err) {
		console.error('Error deleting template:', err);
		throw error(500, err instanceof Error ? err.message : 'Failed to delete template');
	}
};

// POST /api/templates/[id] - Duplicate template
export const POST: RequestHandler = async ({ params, cookies, request }) => {
	// CRITICAL SECURITY: Validate session server-side
	const userId = await getValidatedUserId(cookies);

	try {
		await verifyAdminAccess(params.id, userId);
		const { name } = await request.json();

		if (!name?.trim()) {
			throw error(400, 'Name required');
		}

		const template = await duplicateTemplate(params.id, name.trim(), userId);
		return json({ template });
	} catch (err) {
		console.error('Error duplicating template:', err);
		throw error(500, err instanceof Error ? err.message : 'Failed to duplicate template');
	}
};
