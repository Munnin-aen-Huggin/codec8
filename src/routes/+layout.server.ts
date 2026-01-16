import { supabaseAdmin } from '$lib/server/supabase';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	// Check for session cookie - don't validate here, let pages handle auth
	const sessionCookie = cookies.get('session');

	if (!sessionCookie) {
		return { user: null };
	}

	// Parse session cookie to get userId
	let userId: string;
	try {
		const session = JSON.parse(sessionCookie);
		userId = session.userId;
	} catch {
		// Invalid format but don't clear - let dashboard handle it
		console.log('[Layout] Invalid session cookie format');
		return { user: null };
	}

	if (!userId) {
		return { user: null };
	}

	// Fetch profile for navigation display
	const { data: profile, error: profileError } = await supabaseAdmin
		.from('profiles')
		.select('id, email, github_username, plan')
		.eq('id', userId)
		.single();

	if (profileError) {
		console.error('[Layout] Profile fetch error:', profileError);
	}

	if (!profile) {
		// User no longer exists but don't clear cookie here
		console.log('[Layout] Profile not found for userId:', userId);
		return { user: null };
	}

	return { user: profile };
};
