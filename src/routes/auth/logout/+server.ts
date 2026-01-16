import { redirect } from '@sveltejs/kit';
import { invalidateSession, clearSessionCookie } from '$lib/server/session';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
	// CRITICAL SECURITY: Invalidate session server-side before clearing cookie
	const sessionCookie = cookies.get('session');

	if (sessionCookie) {
		try {
			const parsed = JSON.parse(sessionCookie);
			if (parsed.token) {
				// Invalidate the session in the database
				await invalidateSession(parsed.token);
			}
		} catch {
			// Invalid session format, just clear the cookie
		}
	}

	// Clear the session cookie
	clearSessionCookie(cookies);

	throw redirect(302, '/');
};
