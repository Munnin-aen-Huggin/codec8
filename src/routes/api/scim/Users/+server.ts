/**
 * SCIM 2.0 Users Endpoint
 *
 * Handles user provisioning operations from identity providers.
 *
 * Endpoints:
 * - GET /api/scim/Users - List users
 * - POST /api/scim/Users - Create user
 * - GET /api/scim/Users/:id - Get user
 * - PUT /api/scim/Users/:id - Replace user
 * - PATCH /api/scim/Users/:id - Update user
 * - DELETE /api/scim/Users/:id - Delete user
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	validateSCIMToken,
	scimListUsers,
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
 * GET /api/scim/Users
 * List users (with optional filter)
 */
export const GET: RequestHandler = async ({ request, url }) => {
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

	// Parse query parameters
	const filter = url.searchParams.get('filter') || undefined;
	const startIndex = parseInt(url.searchParams.get('startIndex') || '1');
	const count = parseInt(url.searchParams.get('count') || '100');

	try {
		const response = await scimListUsers(teamId, filter, startIndex, count);
		return json(response, {
			headers: { 'Content-Type': SCIM_CONTENT_TYPE }
		});
	} catch (err) {
		console.error('[SCIM] Error listing users:', err);
		return json(createSCIMError(500, 'Internal server error'), {
			status: 500,
			headers: { 'Content-Type': SCIM_CONTENT_TYPE }
		});
	}
};

/**
 * POST /api/scim/Users
 * Create a new user
 */
export const POST: RequestHandler = async ({ request }) => {
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

	let scimUser: SCIMUser;
	try {
		scimUser = await request.json();
	} catch {
		return json(createSCIMError(400, 'Invalid JSON body'), {
			status: 400,
			headers: { 'Content-Type': SCIM_CONTENT_TYPE }
		});
	}

	// Validate required fields
	if (!scimUser.userName) {
		return json(createSCIMError(400, 'userName is required', 'invalidValue'), {
			status: 400,
			headers: { 'Content-Type': SCIM_CONTENT_TYPE }
		});
	}

	try {
		const user = await scimProvisionUser(teamId, scimUser);
		return json(user, {
			status: 201,
			headers: {
				'Content-Type': SCIM_CONTENT_TYPE,
				'Location': `/api/scim/Users/${user.id}`
			}
		});
	} catch (err) {
		console.error('[SCIM] Error creating user:', err);
		return json(createSCIMError(500, 'Failed to create user'), {
			status: 500,
			headers: { 'Content-Type': SCIM_CONTENT_TYPE }
		});
	}
};
