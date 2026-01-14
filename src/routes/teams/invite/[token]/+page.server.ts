import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { supabaseAdmin } from '$lib/server/supabase';
import { acceptInvitation } from '$lib/server/teams';

function getUserIdFromSession(cookies: { get: (name: string) => string | undefined }): string | null {
	const session = cookies.get('session');
	if (!session) return null;
	try {
		const parsed = JSON.parse(session);
		return parsed.userId || null;
	} catch {
		return null;
	}
}

export const load: PageServerLoad = async ({ params, cookies }) => {
	const userId = getUserIdFromSession(cookies);

	// Get invitation details
	const { data: invitation, error: invError } = await supabaseAdmin
		.from('team_invitations')
		.select(`
			*,
			teams (
				id,
				name,
				slug
			),
			inviter:invited_by (
				email,
				github_username
			)
		`)
		.eq('token', params.token)
		.is('accepted_at', null)
		.single();

	if (invError || !invitation) {
		throw error(404, 'Invitation not found or already used');
	}

	// Check if expired
	if (new Date(invitation.expires_at) < new Date()) {
		throw error(410, 'This invitation has expired');
	}

	// Get user email if logged in
	let userEmail: string | null = null;
	if (userId) {
		const { data: profile } = await supabaseAdmin
			.from('profiles')
			.select('email')
			.eq('id', userId)
			.single();
		userEmail = profile?.email || null;
	}

	return {
		invitation: {
			id: invitation.id,
			email: invitation.email,
			role: invitation.role,
			expiresAt: invitation.expires_at,
			team: invitation.teams,
			invitedBy: invitation.inviter,
			token: params.token
		},
		isLoggedIn: !!userId,
		userEmail
	};
};

export const actions: Actions = {
	accept: async ({ params, cookies }) => {
		const userId = getUserIdFromSession(cookies);

		if (!userId) {
			throw redirect(303, `/auth/login?redirect=/teams/invite/${params.token}`);
		}

		try {
			const result = await acceptInvitation(params.token, userId);
			throw redirect(303, `/dashboard?joined=${result.team.slug}`);
		} catch (err) {
			if (err instanceof Response) throw err; // Re-throw redirects
			console.error('Error accepting invitation:', err);
			return {
				success: false,
				error: err instanceof Error ? err.message : 'Failed to accept invitation'
			};
		}
	}
};
