/**
 * Directory Sync (SCIM 2.0) Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase with factory function
vi.mock('./supabase', () => {
	const mockFrom = vi.fn();
	const mock = {
		from: mockFrom,
		select: vi.fn(() => mock),
		insert: vi.fn(() => mock),
		update: vi.fn(() => mock),
		delete: vi.fn(() => mock),
		eq: vi.fn(() => mock),
		range: vi.fn(() => mock),
		single: vi.fn(() => Promise.resolve({ data: null, error: null }))
	};
	mockFrom.mockReturnValue(mock);
	return { supabaseAdmin: mock };
});

import {
	SCIM_SCHEMAS,
	createSCIMError,
	scimListGroups,
	type SCIMUser,
	type SCIMGroup,
	type SCIMListResponse,
	type SCIMError
} from './directory-sync';

describe('SCIM Schemas', () => {
	it('should have correct User schema URN', () => {
		expect(SCIM_SCHEMAS.USER).toBe('urn:ietf:params:scim:schemas:core:2.0:User');
	});

	it('should have correct Group schema URN', () => {
		expect(SCIM_SCHEMAS.GROUP).toBe('urn:ietf:params:scim:schemas:core:2.0:Group');
	});

	it('should have correct ListResponse schema URN', () => {
		expect(SCIM_SCHEMAS.LIST_RESPONSE).toBe('urn:ietf:params:scim:api:messages:2.0:ListResponse');
	});

	it('should have correct Error schema URN', () => {
		expect(SCIM_SCHEMAS.ERROR).toBe('urn:ietf:params:scim:api:messages:2.0:Error');
	});

	it('should have correct Enterprise User schema URN', () => {
		expect(SCIM_SCHEMAS.ENTERPRISE_USER).toBe(
			'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User'
		);
	});
});

describe('createSCIMError', () => {
	it('should create error with correct schema', () => {
		const error = createSCIMError(400, 'Bad request');

		expect(error.schemas).toContain(SCIM_SCHEMAS.ERROR);
	});

	it('should set status as string', () => {
		const error = createSCIMError(404, 'Not found');

		expect(error.status).toBe('404');
	});

	it('should set detail message', () => {
		const error = createSCIMError(500, 'Internal error');

		expect(error.detail).toBe('Internal error');
	});

	it('should include scimType when provided', () => {
		const error = createSCIMError(400, 'Invalid value', 'invalidValue');

		expect(error.scimType).toBe('invalidValue');
	});

	it('should not include scimType when not provided', () => {
		const error = createSCIMError(401, 'Unauthorized');

		expect(error.scimType).toBeUndefined();
	});
});

describe('scimListGroups', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return ListResponse schema', async () => {
		const result = await scimListGroups('team-123');

		expect(result.schemas).toContain(SCIM_SCHEMAS.LIST_RESPONSE);
	});

	it('should return Administrators and Members groups', async () => {
		const result = await scimListGroups('team-123');

		expect(result.Resources).toHaveLength(2);
		expect(result.Resources[0].displayName).toBe('Administrators');
		expect(result.Resources[1].displayName).toBe('Members');
	});

	it('should use team ID in group IDs', async () => {
		const result = await scimListGroups('team-123');

		expect(result.Resources[0].id).toBe('team-123-admins');
		expect(result.Resources[1].id).toBe('team-123-members');
	});

	it('should include Group schema in resources', async () => {
		const result = await scimListGroups('team-123');

		result.Resources.forEach((group) => {
			expect(group.schemas).toContain(SCIM_SCHEMAS.GROUP);
		});
	});

	it('should include meta with resourceType', async () => {
		const result = await scimListGroups('team-123');

		result.Resources.forEach((group) => {
			expect(group.meta?.resourceType).toBe('Group');
		});
	});
});

describe('SCIMUser type', () => {
	it('should allow minimal user', () => {
		const user: SCIMUser = {
			schemas: [SCIM_SCHEMAS.USER],
			userName: 'test@example.com'
		};

		expect(user.userName).toBe('test@example.com');
	});

	it('should allow full user', () => {
		const user: SCIMUser = {
			schemas: [SCIM_SCHEMAS.USER],
			id: 'user-123',
			externalId: 'ext-456',
			userName: 'test@example.com',
			name: {
				formatted: 'Test User',
				givenName: 'Test',
				familyName: 'User'
			},
			displayName: 'Test User',
			emails: [{ value: 'test@example.com', type: 'work', primary: true }],
			active: true,
			groups: [{ value: 'group-1', display: 'Admins' }],
			meta: {
				resourceType: 'User',
				created: '2026-01-15T00:00:00Z',
				lastModified: '2026-01-15T00:00:00Z',
				location: '/scim/v2/Users/user-123'
			}
		};

		expect(user.id).toBe('user-123');
		expect(user.name?.givenName).toBe('Test');
		expect(user.emails?.[0].primary).toBe(true);
	});
});

describe('SCIMGroup type', () => {
	it('should allow minimal group', () => {
		const group: SCIMGroup = {
			schemas: [SCIM_SCHEMAS.GROUP],
			displayName: 'Admins'
		};

		expect(group.displayName).toBe('Admins');
	});

	it('should allow full group with members', () => {
		const group: SCIMGroup = {
			schemas: [SCIM_SCHEMAS.GROUP],
			id: 'group-123',
			externalId: 'ext-group',
			displayName: 'Administrators',
			members: [
				{ value: 'user-1', display: 'User One' },
				{ value: 'user-2', display: 'User Two' }
			],
			meta: {
				resourceType: 'Group',
				created: '2026-01-15T00:00:00Z'
			}
		};

		expect(group.members).toHaveLength(2);
		expect(group.meta?.resourceType).toBe('Group');
	});
});

describe('SCIMError type', () => {
	it('should have required fields', () => {
		const error: SCIMError = {
			schemas: [SCIM_SCHEMAS.ERROR],
			status: '400'
		};

		expect(error.schemas).toContain(SCIM_SCHEMAS.ERROR);
		expect(error.status).toBe('400');
	});

	it('should allow optional detail', () => {
		const error: SCIMError = {
			schemas: [SCIM_SCHEMAS.ERROR],
			status: '404',
			detail: 'Resource not found'
		};

		expect(error.detail).toBe('Resource not found');
	});

	it('should allow optional scimType', () => {
		const error: SCIMError = {
			schemas: [SCIM_SCHEMAS.ERROR],
			status: '400',
			scimType: 'invalidValue'
		};

		expect(error.scimType).toBe('invalidValue');
	});
});

describe('SCIMListResponse type', () => {
	it('should have correct structure', () => {
		const response: SCIMListResponse<SCIMUser> = {
			schemas: [SCIM_SCHEMAS.LIST_RESPONSE],
			totalResults: 10,
			itemsPerPage: 25,
			startIndex: 1,
			Resources: []
		};

		expect(response.schemas).toContain(SCIM_SCHEMAS.LIST_RESPONSE);
		expect(response.totalResults).toBe(10);
		expect(response.itemsPerPage).toBe(25);
		expect(response.startIndex).toBe(1);
		expect(response.Resources).toEqual([]);
	});

	it('should work with User resources', () => {
		const response: SCIMListResponse<SCIMUser> = {
			schemas: [SCIM_SCHEMAS.LIST_RESPONSE],
			totalResults: 1,
			itemsPerPage: 25,
			startIndex: 1,
			Resources: [
				{
					schemas: [SCIM_SCHEMAS.USER],
					userName: 'test@example.com'
				}
			]
		};

		expect(response.Resources[0].userName).toBe('test@example.com');
	});

	it('should work with Group resources', () => {
		const response: SCIMListResponse<SCIMGroup> = {
			schemas: [SCIM_SCHEMAS.LIST_RESPONSE],
			totalResults: 2,
			itemsPerPage: 25,
			startIndex: 1,
			Resources: [
				{ schemas: [SCIM_SCHEMAS.GROUP], displayName: 'Admins' },
				{ schemas: [SCIM_SCHEMAS.GROUP], displayName: 'Members' }
			]
		};

		expect(response.Resources).toHaveLength(2);
	});
});
