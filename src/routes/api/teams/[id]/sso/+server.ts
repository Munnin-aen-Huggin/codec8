/**
 * SSO Configuration API
 *
 * GET - Get SSO config for a team
 * POST - Create/update SSO config
 * DELETE - Remove SSO config
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabaseAdmin } from '$lib/server/supabase';
import {
	getSSOConfig,
	upsertSSOConfig,
	deleteSSOConfig,
	testSSOConnection,
	type SSOConfig
} from '$lib/server/saml';
import { logAuditEvent, AUDIT_ACTIONS } from '$lib/server/audit';

interface SessionData {
	userId: string;
	token: string;
}

/**
 * Verify user is team owner (required for SSO config changes)
 */
async function verifyTeamOwner(
	cookies: { get: (name: string) => string | undefined },
	teamId: string
): Promise<string> {
	const sessionCookie = cookies.get('session');
	if (!sessionCookie) {
		throw error(401, 'Unauthorized');
	}

	let userId: string;
	try {
		const session: SessionData = JSON.parse(sessionCookie);
		userId = session.userId;
	} catch {
		throw error(401, 'Invalid session');
	}

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
		throw error(403, 'Only team owners can manage SSO configuration');
	}

	return userId;
}

/**
 * GET /api/teams/[id]/sso
 * Get SSO configuration for a team
 */
export const GET: RequestHandler = async ({ params, cookies }) => {
	const { id: teamId } = params;

	// Verify session (any team member can view SSO config)
	const sessionCookie = cookies.get('session');
	if (!sessionCookie) {
		throw error(401, 'Unauthorized');
	}

	let userId: string;
	try {
		const session: SessionData = JSON.parse(sessionCookie);
		userId = session.userId;
	} catch {
		throw error(401, 'Invalid session');
	}

	// Verify user is team member (admin or owner)
	const { data: membership, error: memberError } = await supabaseAdmin
		.from('team_members')
		.select('role')
		.eq('team_id', teamId)
		.eq('user_id', userId)
		.single();

	if (memberError || !membership) {
		throw error(403, 'Not a member of this team');
	}

	if (membership.role !== 'owner' && membership.role !== 'admin') {
		throw error(403, 'Only team admins can view SSO configuration');
	}

	const config = await getSSOConfig(teamId);

	if (!config) {
		return json({ configured: false });
	}

	// Don't expose the full certificate in the response
	return json({
		configured: true,
		config: {
			id: config.id,
			provider: config.provider,
			entity_id: config.entity_id,
			sso_url: config.sso_url,
			require_sso: config.require_sso,
			jit_provisioning: config.jit_provisioning,
			attribute_mapping: config.attribute_mapping,
			has_certificate: !!config.certificate,
			created_at: config.created_at,
			updated_at: config.updated_at
		}
	});
};

/**
 * POST /api/teams/[id]/sso
 * Create or update SSO configuration
 */
export const POST: RequestHandler = async ({ params, cookies, request }) => {
	const { id: teamId } = params;
	const userId = await verifyTeamOwner(cookies, teamId);

	// Verify team has enterprise tier or SSO add-on
	const { data: team, error: teamError } = await supabaseAdmin
		.from('teams')
		.select('enterprise_tier, name')
		.eq('id', teamId)
		.single();

	if (teamError || !team) {
		throw error(404, 'Team not found');
	}

	// For now, require enterprise tier for SSO
	// TODO: Add SSO add-on check when pricing is implemented
	// if (!team.enterprise_tier) {
	// 	throw error(403, 'SSO requires Enterprise tier');
	// }

	const body = await request.json();
	const { provider, entity_id, sso_url, certificate, attribute_mapping, require_sso, jit_provisioning, test_only } = body;

	// Validate required fields
	if (!provider || !['okta', 'azure_ad', 'google', 'custom'].includes(provider)) {
		throw error(400, 'Invalid provider');
	}

	if (!entity_id) {
		throw error(400, 'Entity ID is required');
	}

	if (!sso_url) {
		throw error(400, 'SSO URL is required');
	}

	if (!certificate) {
		throw error(400, 'Certificate is required');
	}

	// Build config
	const configData: Omit<SSOConfig, 'id' | 'team_id' | 'created_at' | 'updated_at'> = {
		provider,
		entity_id,
		sso_url,
		certificate,
		attribute_mapping: attribute_mapping || {},
		require_sso: require_sso || false,
		jit_provisioning: jit_provisioning !== false // Default to true
	};

	// Test connection if requested
	if (test_only) {
		const testResult = await testSSOConnection(configData);
		return json(testResult);
	}

	try {
		const config = await upsertSSOConfig(teamId, configData);

		// Log audit event
		await logAuditEvent({
			teamId,
			userId,
			action: AUDIT_ACTIONS.SSO_CONFIGURED,
			resourceType: 'sso_config',
			resourceId: config.id,
			metadata: {
				provider,
				require_sso
			}
		});

		return json({
			success: true,
			config: {
				id: config.id,
				provider: config.provider,
				entity_id: config.entity_id,
				sso_url: config.sso_url,
				require_sso: config.require_sso,
				jit_provisioning: config.jit_provisioning
			}
		});
	} catch (err) {
		console.error('[SSO Config] Error saving config:', err);
		throw error(500, 'Failed to save SSO configuration');
	}
};

/**
 * DELETE /api/teams/[id]/sso
 * Remove SSO configuration
 */
export const DELETE: RequestHandler = async ({ params, cookies }) => {
	const { id: teamId } = params;
	const userId = await verifyTeamOwner(cookies, teamId);

	const existingConfig = await getSSOConfig(teamId);
	if (!existingConfig) {
		throw error(404, 'SSO configuration not found');
	}

	try {
		await deleteSSOConfig(teamId);

		// Update team to not require SSO
		await supabaseAdmin
			.from('teams')
			.update({ sso_required: false })
			.eq('id', teamId);

		// Log audit event
		await logAuditEvent({
			teamId,
			userId,
			action: AUDIT_ACTIONS.SSO_REMOVED,
			resourceType: 'sso_config',
			resourceId: existingConfig.id,
			metadata: {
				provider: existingConfig.provider
			}
		});

		return json({ success: true });
	} catch (err) {
		console.error('[SSO Config] Error deleting config:', err);
		throw error(500, 'Failed to delete SSO configuration');
	}
};
