import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabaseAdmin } from '$lib/server/supabase';

export const POST: RequestHandler = async ({ cookies }) => {
	// Verify authentication
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

	if (!userId) {
		throw error(401, 'Invalid session');
	}

	// Mark user as onboarded
	const { error: updateError } = await supabaseAdmin
		.from('profiles')
		.update({ onboarded: true })
		.eq('id', userId);

	if (updateError) {
		console.error('Failed to mark user as onboarded:', updateError);
		throw error(500, 'Failed to update profile');
	}

	return json({ success: true });
};
