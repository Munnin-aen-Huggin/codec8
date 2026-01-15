/**
 * SCIM 2.0 User Resource Endpoint
 *
 * Handles individual user operations.
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	validateSCIMToken,
	scimGetUser,
	scimUpdateUser,
	scimDeprovisionUser,
	scimProvisionUser,
	createSCIMError,
	type SCIMUser
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
 * GET /api/scim/Users/:id
 * Get a single user
 */
export const GET: RequestHandler = async ({ request, params }) => {
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

	const { id } = params;

	try {
		const user = await scimGetUser(teamId, id);
		if (!user) {
			return json(createSCIMError(404, 'User not found'), {
				status: 404,
				headers: { 'Content-Type': SCIM_CONTENT_TYPE }
			});
		}
		return json(user, {
			headers: { 'Content-Type': SCIM_CONTENT_TYPE }
		});
	} catch (err) {
		console.error('[SCIM] Error getting user:', err);
		return json(createSCIMError(500, 'Internal server error'), {
			status: 500,
			headers: { 'Content-Type': SCIM_CONTENT_TYPE }
		});
	}
};

/**
 * PUT /api/scim/Users/:id
 * Replace a user (full update)
 */
export const PUT: RequestHandler = async ({ request, params }) => {
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

	const { id } = params;

	let scimUser: SCIMUser;
	try {
		scimUser = await request.json();
	} catch {
		return json(createSCIMError(400, 'Invalid JSON body'), {
			status: 400,
			headers: { 'Content-Type': SCIM_CONTENT_TYPE }
		});
	}

	// Add ID to user object
	scimUser.id = id;

	try {
		const user = await scimProvisionUser(teamId, scimUser);
		return json(user, {
			headers: { 'Content-Type': SCIM_CONTENT_TYPE }
		});
	} catch (err) {
		console.error('[SCIM] Error updating user:', err);
		return json(createSCIMError(500, 'Failed to update user'), {
			status: 500,
			headers: { 'Content-Type': SCIM_CONTENT_TYPE }
		});
	}
};

/**
 * PATCH /api/scim/Users/:id
 * Partial update a user
 */
export const PATCH: RequestHandler = async ({ request, params }) => {
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

	const { id } = params;

	let patchRequest: { Operations?: Array<{ op: string; path?: string; value?: unknown }> };
	try {
		patchRequest = await request.json();
	} catch {
		return json(createSCIMError(400, 'Invalid JSON body'), {
			status: 400,
			headers: { 'Content-Type': SCIM_CONTENT_TYPE }
		});
	}

	if (!patchRequest.Operations || !Array.isArray(patchRequest.Operations)) {
		return json(createSCIMError(400, 'Operations array required', 'invalidValue'), {
			status: 400,
			headers: { 'Content-Type': SCIM_CONTENT_TYPE }
		});
	}

	try {
		const user = await scimUpdateUser(teamId, id, patchRequest.Operations);
		if (!user) {
			return json(createSCIMError(404, 'User not found'), {
				status: 404,
				headers: { 'Content-Type': SCIM_CONTENT_TYPE }
			});
		}
		return json(user, {
			headers: { 'Content-Type': SCIM_CONTENT_TYPE }
		});
	} catch (err) {
		console.error('[SCIM] Error patching user:', err);
		return json(createSCIMError(500, 'Failed to update user'), {
			status: 500,
			headers: { 'Content-Type': SCIM_CONTENT_TYPE }
		});
	}
};

/**
 * DELETE /api/scim/Users/:id
 * Delete (deprovision) a user
 */
export const DELETE: RequestHandler = async ({ request, params }) => {
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

	const { id } = params;

	try {
		await scimDeprovisionUser(teamId, id);
		return new Response(null, { status: 204 });
	} catch (err) {
		console.error('[SCIM] Error deleting user:', err);
		return json(createSCIMError(500, 'Failed to delete user'), {
			status: 500,
			headers: { 'Content-Type': SCIM_CONTENT_TYPE }
		});
	}
};
