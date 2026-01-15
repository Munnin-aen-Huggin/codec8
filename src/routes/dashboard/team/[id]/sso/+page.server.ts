/**
 * SSO Settings Page Server Load
 *
 * Loads SSO configuration for team settings page.
 */

import { redirect, error } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabase';
import { getSSOConfig } from '$lib/server/saml';
import type { PageServerLoad } from './$types';

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

	const { id: teamId } = params;

	// Verify user is team owner
	const { data: membership, error: memberError } = await supabaseAdmin
		.from('team_members')
		.select('role')
		.eq('team_id', teamId)
		.eq('user_id', userId)
		.single();

	if (memberError || !membership) {
		throw error(403, 'Not a member of this team');
	}

	if (membership.role !== 'owner') {
		throw error(403, 'Only team owners can manage SSO settings');
	}

	// Get team details
	const { data: team, error: teamError } = await supabaseAdmin
		.from('teams')
		.select('id, name, slug, enterprise_tier, sso_required')
		.eq('id', teamId)
		.single();

	if (teamError || !team) {
		throw error(404, 'Team not found');
	}

	// Get SSO config if exists
	const ssoConfig = await getSSOConfig(teamId);

	return {
		team: {
			id: team.id,
			name: team.name,
			slug: team.slug,
			enterpriseTier: team.enterprise_tier,
			ssoRequired: team.sso_required
		},
		ssoConfig: ssoConfig
			? {
					id: ssoConfig.id,
					provider: ssoConfig.provider,
					entityId: ssoConfig.entity_id,
					ssoUrl: ssoConfig.sso_url,
					hasCertificate: !!ssoConfig.certificate,
					requireSso: ssoConfig.require_sso,
					jitProvisioning: ssoConfig.jit_provisioning,
					attributeMapping: ssoConfig.attribute_mapping
				}
			: null
	};
};
