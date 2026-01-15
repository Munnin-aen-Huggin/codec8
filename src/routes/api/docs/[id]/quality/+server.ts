/**
 * Document Quality API
 *
 * GET - Get quality score for a document
 * POST - Score/rescore a document
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabaseAdmin } from '$lib/server/supabase';
import { scoreDocument, getDocumentScore } from '$lib/server/quality';

// GET /api/docs/[id]/quality - Get quality score
export const GET: RequestHandler = async ({ params, locals }) => {
	const user = locals.user;
	if (!user) {
		throw error(401, 'Unauthorized');
	}

	const docId = params.id;

	// Verify user owns this doc
	const { data: doc, error: docError } = await supabaseAdmin
		.from('documentation')
		.select('id, repo_id, repositories!inner(user_id)')
		.eq('id', docId)
		.single();

	if (docError || !doc) {
		throw error(404, 'Document not found');
	}

	const repo = doc.repositories as unknown as { user_id: string };
	if (repo.user_id !== user.id) {
		throw error(403, 'Access denied');
	}

	try {
		const score = await getDocumentScore(docId);

		if (!score) {
			return json({ score: null, message: 'No quality score available. Generate one with POST.' });
		}

		return json({ score });
	} catch (err) {
		console.error('[Quality API] Error fetching score:', err);
		throw error(500, 'Failed to fetch quality score');
	}
};

// POST /api/docs/[id]/quality - Score document
export const POST: RequestHandler = async ({ params, locals }) => {
	const user = locals.user;
	if (!user) {
		throw error(401, 'Unauthorized');
	}

	const docId = params.id;

	// Verify user owns this doc and get content
	const { data: doc, error: docError } = await supabaseAdmin
		.from('documentation')
		.select('id, type, content, repo_id, repositories!inner(user_id)')
		.eq('id', docId)
		.single();

	if (docError || !doc) {
		throw error(404, 'Document not found');
	}

	const repo = doc.repositories as unknown as { user_id: string };
	if (repo.user_id !== user.id) {
		throw error(403, 'Access denied');
	}

	try {
		const score = await scoreDocument(docId, doc.content, doc.type);

		if (!score) {
			throw error(500, 'Failed to score document');
		}

		return json({ score });
	} catch (err) {
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		console.error('[Quality API] Error scoring document:', err);
		throw error(500, 'Failed to score document');
	}
};
