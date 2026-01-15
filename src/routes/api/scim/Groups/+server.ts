/**
 * SCIM 2.0 Groups Endpoint
 *
 * Handles group operations from identity providers.
 * Groups in CodeDoc map to team roles (admin, member).
 *
 * Note: This is a stub implementation. Full group sync
 * would allow IdPs to manage team roles via SCIM.
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	validateSCIMToken,
	scimListGroups,
	createSCIMError
} from '$lib/server/directory-sync';

const SCIM_CONTENT_TYPE = 'application/scim+json';

/**
 * Extract bearer token from Authorization header
 */
function extractBearerToken(request: Request): string | null {
	const auth = request.headers.get('Authorization');
	if (!auth?.startsWith('Bearer ')) {
		return null;
	}
	return auth.slice(7);
}

/**
 * GET /api/scim/Groups
 * List groups (returns predefined role-based groups)
 */
export const GET: RequestHandler = async ({ request }) => {
	const token = extractBearerToken(request);
	if (!token) {
		return json(createSCIMError(401, 'Authorization required'), {
			status: 401,
			headers: { 'Content-Type': SCIM_CONTENT_TYPE }
		});
	}

	const { valid, teamId } = await validateSCIMToken(token);
	if (!valid || !teamId) {
		return json(createSCIMError(401, 'Invalid SCIM token'), {
			status: 401,
			headers: { 'Content-Type': SCIM_CONTENT_TYPE }
		});
	}

	try {
		const response = await scimListGroups(teamId);
		return json(response, {
			headers: { 'Content-Type': SCIM_CONTENT_TYPE }
		});
	} catch (err) {
		console.error('[SCIM] Error listing groups:', err);
		return json(createSCIMError(500, 'Internal server error'), {
			status: 500,
			headers: { 'Content-Type': SCIM_CONTENT_TYPE }
		});
	}
};

/**
 * POST /api/scim/Groups
 * Create group - Not supported (groups are role-based)
 */
export const POST: RequestHandler = async ({ request }) => {
	const token = extractBearerToken(request);
	if (!token) {
		return json(createSCIMError(401, 'Authorization required'), {
			status: 401,
			headers: { 'Content-Type': SCIM_CONTENT_TYPE }
		});
	}

	const { valid } = await validateSCIMToken(token);
	if (!valid) {
		return json(createSCIMError(401, 'Invalid SCIM token'), {
			status: 401,
			headers: { 'Content-Type': SCIM_CONTENT_TYPE }
		});
	}

	// Group creation not supported - we use fixed role-based groups
	return json(createSCIMError(501, 'Group creation not supported. CodeDoc uses role-based groups.'), {
		status: 501,
		headers: { 'Content-Type': SCIM_CONTENT_TYPE }
	});
};
