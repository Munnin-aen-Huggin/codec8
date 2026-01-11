/**
 * Repository Detail Page Server Load
 *
 * Loads repository details and all generated documentation.
 */

import { redirect, error } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabase';
import type { PageServerLoad } from './$types';
import type { Documentation } from '$lib/types';

interface SessionData {
	userId: string;
	token: string;
}

export const load: PageServerLoad = async ({ cookies, params }) => {
	const sessionCookie = cookies.get('session');
	if (!sessionCookie) throw redirect(302, '/');

	let userId: string;
	try {
		const session: SessionData = JSON.parse(sessionCookie);
		userId = session.userId;
	} catch {
		cookies.delete('session', { path: '/' });
		throw redirect(302, '/');
	}

	if (!userId) {
		cookies.delete('session', { path: '/' });
		throw redirect(302, '/');
	}

	const { repoId } = params;

	// Fetch the repository (verify ownership)
	const { data: repo, error: repoError } = await supabaseAdmin
		.from('repositories')
		.select('*')
		.eq('id', repoId)
		.eq('user_id', userId)
		.single();

	if (repoError || !repo) {
		throw error(404, 'Repository not found');
	}

	// Fetch all documentation for this repo
	const { data: docs, error: docsError } = await supabaseAdmin
		.from('documentation')
		.select('*')
		.eq('repo_id', repoId)
		.order('type');

	if (docsError) {
		console.error('Failed to fetch documentation:', docsError);
	}

	// Organize docs by type for easy access
	const documentation: Record<string, Documentation> = {};
	for (const doc of docs || []) {
		documentation[doc.type] = doc;
	}

	return {
		repo,
		documentation,
		hasAnyDocs: Object.keys(documentation).length > 0
	};
};
