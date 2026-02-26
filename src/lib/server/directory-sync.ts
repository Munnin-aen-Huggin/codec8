/**
 * Directory Sync (SCIM 2.0) Stubs
 *
 * SCIM (System for Cross-domain Identity Management) allows IdPs to
 * automatically provision and deprovision users in Codec8.
 *
 * This file contains stubs for future SCIM 2.0 implementation.
 * Full implementation would support:
 * - User provisioning/deprovisioning
 * - Group management
 * - User attribute updates
 * - Bulk operations
 *
 * SCIM 2.0 Spec: https://datatracker.ietf.org/doc/html/rfc7644
 */

import { supabaseAdmin } from './supabase';

// SCIM 2.0 Schema URNs
export const SCIM_SCHEMAS = {
	USER: 'urn:ietf:params:scim:schemas:core:2.0:User',
	GROUP: 'urn:ietf:params:scim:schemas:core:2.0:Group',
	ENTERPRISE_USER: 'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User',
	LIST_RESPONSE: 'urn:ietf:params:scim:api:messages:2.0:ListResponse',
	ERROR: 'urn:ietf:params:scim:api:messages:2.0:Error'
};

// SCIM User Resource
export interface SCIMUser {
	schemas: string[];
	id?: string;
	externalId?: string;
	userName: string;
	name?: {
		formatted?: string;
		familyName?: string;
		givenName?: string;
	};
	displayName?: string;
	emails?: Array<{
		value: string;
		type?: string;
		primary?: boolean;
	}>;
	active?: boolean;
	groups?: Array<{
		value: string;
		display?: string;
	}>;
	meta?: {
		resourceType: string;
		created?: string;
		lastModified?: string;
		location?: string;
	};
}

// SCIM Group Resource
export interface SCIMGroup {
	schemas: string[];
	id?: string;
	externalId?: string;
	displayName: string;
	members?: Array<{
		value: string;
		display?: string;
	}>;
	meta?: {
		resourceType: string;
		created?: string;
		lastModified?: string;
		location?: string;
	};
}

// SCIM List Response
export interface SCIMListResponse<T> {
	schemas: string[];
	totalResults: number;
	itemsPerPage: number;
	startIndex: number;
	Resources: T[];
}

// SCIM Error Response
export interface SCIMError {
	schemas: string[];
	status: string;
	scimType?: string;
	detail?: string;
}

/**
 * Create SCIM error response
 */
export function createSCIMError(
	status: number,
	detail: string,
	scimType?: string
): SCIMError {
	return {
		schemas: [SCIM_SCHEMAS.ERROR],
		status: String(status),
		scimType,
		detail
	};
}

/**
 * Validate SCIM bearer token
 * Teams will have a unique SCIM token for directory sync
 */
export async function validateSCIMToken(
	token: string
): Promise<{ valid: boolean; teamId?: string }> {
	if (!token) {
		return { valid: false };
	}

	// Look up SCIM token in database
	const { data: config, error } = await supabaseAdmin
		.from('sso_configs')
		.select('team_id')
		.eq('scim_token', token)
		.single();

	if (error || !config) {
		return { valid: false };
	}

	return {
		valid: true,
		teamId: config.team_id
	};
}

/**
 * STUB: Create or update user via SCIM
 * Called when IdP provisions a user
 */
export async function scimProvisionUser(
	teamId: string,
	scimUser: SCIMUser
): Promise<SCIMUser> {
	console.log('[SCIM] User provision request:', { teamId, userName: scimUser.userName });

	// Extract email from SCIM user
	const email = scimUser.emails?.find(e => e.primary)?.value
		|| scimUser.emails?.[0]?.value
		|| scimUser.userName;

	// Check if user exists
	const { data: existingUser } = await supabaseAdmin
		.from('profiles')
		.select('id')
		.eq('email', email.toLowerCase())
		.single();

	let userId: string;

	if (existingUser) {
		userId = existingUser.id;

		// Update existing user's SSO info
		await supabaseAdmin
			.from('profiles')
			.update({
				sso_id: scimUser.externalId || scimUser.id,
				sso_team_id: teamId
			})
			.eq('id', userId);
	} else {
		// Create new user
		userId = crypto.randomUUID();

		await supabaseAdmin.from('profiles').insert({
			id: userId,
			email: email.toLowerCase(),
			github_username: scimUser.displayName || scimUser.userName,
			sso_id: scimUser.externalId || scimUser.id,
			sso_team_id: teamId,
			plan: 'free'
		});

		// Add to team
		await supabaseAdmin.from('team_members').insert({
			team_id: teamId,
			user_id: userId,
			role: 'member'
		});
	}

	// Return SCIM user response
	return {
		schemas: [SCIM_SCHEMAS.USER],
		id: userId,
		externalId: scimUser.externalId,
		userName: scimUser.userName,
		name: scimUser.name,
		displayName: scimUser.displayName,
		emails: scimUser.emails,
		active: true,
		meta: {
			resourceType: 'User',
			created: new Date().toISOString(),
			lastModified: new Date().toISOString()
		}
	};
}

/**
 * STUB: Deactivate user via SCIM
 * Called when IdP deprovisions a user
 */
export async function scimDeprovisionUser(
	teamId: string,
	userId: string
): Promise<void> {
	console.log('[SCIM] User deprovision request:', { teamId, userId });

	// Remove user from team (don't delete their account)
	await supabaseAdmin
		.from('team_members')
		.delete()
		.eq('team_id', teamId)
		.eq('user_id', userId);

	// Clear SSO association
	await supabaseAdmin
		.from('profiles')
		.update({ sso_team_id: null })
		.eq('id', userId)
		.eq('sso_team_id', teamId);
}

/**
 * STUB: Update user attributes via SCIM PATCH
 */
export async function scimUpdateUser(
	teamId: string,
	userId: string,
	operations: Array<{ op: string; path?: string; value?: unknown }>
): Promise<SCIMUser | null> {
	console.log('[SCIM] User update request:', { teamId, userId, operations });

	// Get current user
	const { data: user, error } = await supabaseAdmin
		.from('profiles')
		.select('*')
		.eq('id', userId)
		.single();

	if (error || !user) {
		return null;
	}

	// Process SCIM PATCH operations
	for (const op of operations) {
		if (op.op === 'replace' && op.path === 'active' && op.value === false) {
			// Deactivate user
			await scimDeprovisionUser(teamId, userId);
		}
		// Add more operation handlers as needed
	}

	return {
		schemas: [SCIM_SCHEMAS.USER],
		id: userId,
		userName: user.email,
		active: true,
		meta: {
			resourceType: 'User',
			lastModified: new Date().toISOString()
		}
	};
}

/**
 * STUB: List users via SCIM
 */
export async function scimListUsers(
	teamId: string,
	filter?: string,
	startIndex = 1,
	count = 100
): Promise<SCIMListResponse<SCIMUser>> {
	console.log('[SCIM] List users request:', { teamId, filter, startIndex, count });

	// Get team members
	const { data: members, error, count: totalCount } = await supabaseAdmin
		.from('team_members')
		.select(`
			user_id,
			profiles:user_id (
				id,
				email,
				github_username,
				sso_id,
				created_at
			)
		`, { count: 'exact' })
		.eq('team_id', teamId)
		.range(startIndex - 1, startIndex - 1 + count - 1);

	if (error) {
		console.error('[SCIM] Error listing users:', error);
		return {
			schemas: [SCIM_SCHEMAS.LIST_RESPONSE],
			totalResults: 0,
			itemsPerPage: count,
			startIndex,
			Resources: []
		};
	}

	// Convert to SCIM users
	const resources: SCIMUser[] = (members || []).map((m) => {
		const profile = m.profiles as unknown as {
			id: string;
			email: string;
			github_username: string;
			sso_id: string;
			created_at: string;
		};

		return {
			schemas: [SCIM_SCHEMAS.USER],
			id: profile?.id,
			externalId: profile?.sso_id,
			userName: profile?.email,
			displayName: profile?.github_username,
			emails: profile?.email ? [{ value: profile.email, primary: true }] : [],
			active: true,
			meta: {
				resourceType: 'User',
				created: profile?.created_at
			}
		};
	});

	return {
		schemas: [SCIM_SCHEMAS.LIST_RESPONSE],
		totalResults: totalCount || 0,
		itemsPerPage: count,
		startIndex,
		Resources: resources
	};
}

/**
 * STUB: Get single user via SCIM
 */
export async function scimGetUser(
	teamId: string,
	userId: string
): Promise<SCIMUser | null> {
	const { data: member } = await supabaseAdmin
		.from('team_members')
		.select(`
			profiles:user_id (
				id,
				email,
				github_username,
				sso_id,
				created_at
			)
		`)
		.eq('team_id', teamId)
		.eq('user_id', userId)
		.single();

	if (!member) {
		return null;
	}

	const profile = member.profiles as unknown as {
		id: string;
		email: string;
		github_username: string;
		sso_id: string;
		created_at: string;
	};

	return {
		schemas: [SCIM_SCHEMAS.USER],
		id: profile?.id,
		externalId: profile?.sso_id,
		userName: profile?.email,
		displayName: profile?.github_username,
		emails: profile?.email ? [{ value: profile.email, primary: true }] : [],
		active: true,
		meta: {
			resourceType: 'User',
			created: profile?.created_at
		}
	};
}

/**
 * STUB: Group operations placeholder
 * Groups map to team roles in Codec8
 */
export async function scimListGroups(
	teamId: string
): Promise<SCIMListResponse<SCIMGroup>> {
	// Return predefined groups based on team roles
	const groups: SCIMGroup[] = [
		{
			schemas: [SCIM_SCHEMAS.GROUP],
			id: `${teamId}-admins`,
			displayName: 'Administrators',
			meta: { resourceType: 'Group' }
		},
		{
			schemas: [SCIM_SCHEMAS.GROUP],
			id: `${teamId}-members`,
			displayName: 'Members',
			meta: { resourceType: 'Group' }
		}
	];

	return {
		schemas: [SCIM_SCHEMAS.LIST_RESPONSE],
		totalResults: groups.length,
		itemsPerPage: 100,
		startIndex: 1,
		Resources: groups
	};
}
