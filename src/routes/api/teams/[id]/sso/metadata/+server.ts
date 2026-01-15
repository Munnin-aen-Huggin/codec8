/**
 * SAML SP Metadata Endpoint
 *
 * GET - Returns SP metadata XML for IdP configuration
 */

import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabaseAdmin } from '$lib/server/supabase';
import { generateMetadata, getSSOConfig } from '$lib/server/saml';

/**
 * GET /api/teams/[id]/sso/metadata
 * Get SAML Service Provider metadata XML
 */
export const GET: RequestHandler = async ({ params }) => {
	const { id: teamId } = params;

	// Verify team exists
	const { data: team, error: teamError } = await supabaseAdmin
		.from('teams')
		.select('id, slug')
		.eq('id', teamId)
		.single();

	if (teamError || !team) {
		throw error(404, 'Team not found');
	}

	// Get SSO config to use custom entity ID if configured
	const config = await getSSOConfig(teamId);
	const entityId = config?.entity_id;

	// Generate metadata XML
	const metadata = generateMetadata(entityId);

	// Return XML response
	return new Response(metadata, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
		}
	});
};
