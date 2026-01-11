/**
 * Documentation CRUD Endpoint
 *
 * GET /api/docs/[id] - Get a specific documentation
 * PUT /api/docs/[id] - Update documentation content
 * DELETE /api/docs/[id] - Delete documentation
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabaseAdmin } from '$lib/server/supabase';

/**
 * Get a specific documentation by ID
 */
export const GET: RequestHandler = async ({ cookies, params }) => {
	const session = cookies.get('session');
	if (!session) {
		throw error(401, 'Unauthorized');
	}

	let userId: string;
	try {
		const parsed = JSON.parse(session);
		userId = parsed.userId;
	} catch {
		throw error(401, 'Invalid session');
	}

	const { id } = params;

	// Fetch the documentation and verify ownership through repo
	const { data: doc, error: docError } = await supabaseAdmin
		.from('documentation')
		.select(`
			*,
			repositories!inner(user_id)
		`)
		.eq('id', id)
		.single();

	if (docError || !doc) {
		throw error(404, 'Documentation not found');
	}

	// Verify ownership
	if (doc.repositories.user_id !== userId) {
		throw error(403, 'Access denied');
	}

	// Return doc without the join data
	const { repositories, ...docData } = doc;
	return json(docData);
};

/**
 * Update documentation content
 */
export const PUT: RequestHandler = async ({ cookies, params, request }) => {
	const session = cookies.get('session');
	if (!session) {
		throw error(401, 'Unauthorized');
	}

	let userId: string;
	try {
		const parsed = JSON.parse(session);
		userId = parsed.userId;
	} catch {
		throw error(401, 'Invalid session');
	}

	const { id } = params;

	// Verify ownership first
	const { data: doc, error: docError } = await supabaseAdmin
		.from('documentation')
		.select(`
			*,
			repositories!inner(user_id)
		`)
		.eq('id', id)
		.single();

	if (docError || !doc) {
		throw error(404, 'Documentation not found');
	}

	if (doc.repositories.user_id !== userId) {
		throw error(403, 'Access denied');
	}

	// Parse request body
	const body = await request.json();
	const { content } = body;

	if (typeof content !== 'string') {
		throw error(400, 'Content must be a string');
	}

	// Update the documentation
	const { data: updated, error: updateError } = await supabaseAdmin
		.from('documentation')
		.update({
			content,
			version: doc.version + 1,
			generated_at: new Date().toISOString()
		})
		.eq('id', id)
		.select()
		.single();

	if (updateError) {
		console.error('Failed to update documentation:', updateError);
		throw error(500, 'Failed to update documentation');
	}

	return json(updated);
};

/**
 * Delete documentation
 */
export const DELETE: RequestHandler = async ({ cookies, params }) => {
	const session = cookies.get('session');
	if (!session) {
		throw error(401, 'Unauthorized');
	}

	let userId: string;
	try {
		const parsed = JSON.parse(session);
		userId = parsed.userId;
	} catch {
		throw error(401, 'Invalid session');
	}

	const { id } = params;

	// Verify ownership first
	const { data: doc, error: docError } = await supabaseAdmin
		.from('documentation')
		.select(`
			*,
			repositories!inner(user_id)
		`)
		.eq('id', id)
		.single();

	if (docError || !doc) {
		throw error(404, 'Documentation not found');
	}

	if (doc.repositories.user_id !== userId) {
		throw error(403, 'Access denied');
	}

	// Delete the documentation
	const { error: deleteError } = await supabaseAdmin
		.from('documentation')
		.delete()
		.eq('id', id);

	if (deleteError) {
		console.error('Failed to delete documentation:', deleteError);
		throw error(500, 'Failed to delete documentation');
	}

	return json({ success: true });
};
