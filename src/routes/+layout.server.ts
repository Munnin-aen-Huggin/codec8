import { supabaseAdmin } from '$lib/server/supabase';
import { validateSessionFromCookie, clearSessionCookie } from '$lib/server/session';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	// CRITICAL SECURITY: Validate session server-side
	const sessionResult = await validateSessionFromCookie(cookies);

	if (!sessionResult.valid || !sessionResult.userId) {
		// Clear invalid session cookie if present
		if (cookies.get('session')) {
			clearSessionCookie(cookies);
		}
		return { user: null };
	}

	const userId = sessionResult.userId;

	const { data: profile } = await supabaseAdmin
		.from('profiles')
		.select('id, email, github_username, plan')
		.eq('id', userId)
		.single();

	if (!profile) {
		// User no longer exists, clear session
		clearSessionCookie(cookies);
		return { user: null };
	}

	return { user: profile };
};
