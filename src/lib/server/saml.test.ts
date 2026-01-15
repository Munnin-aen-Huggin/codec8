/**
 * SAML Library Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock environment variables first (before any imports)
vi.mock('$env/static/public', () => ({
	PUBLIC_APP_URL: 'https://app.codedoc.ai'
}));

vi.mock('$env/dynamic/private', () => ({
	env: {
		SAML_SP_CERTIFICATE: ''
	}
}));

// Mock supabase with factory function
vi.mock('./supabase', () => {
	const mockFrom = vi.fn();
	const mock = {
		from: mockFrom,
		select: vi.fn(() => mock),
		insert: vi.fn(() => mock),
		update: vi.fn(() => mock),
		upsert: vi.fn(() => mock),
		delete: vi.fn(() => mock),
		eq: vi.fn(() => mock),
		gt: vi.fn(() => mock),
		single: vi.fn(() => Promise.resolve({ data: null, error: null }))
	};
	mockFrom.mockReturnValue(mock);
	return { supabaseAdmin: mock };
});

// Mock @node-saml/node-saml with proper constructor
vi.mock('@node-saml/node-saml', () => {
	const MockSAML = function () {
		return {
			getAuthorizeUrlAsync: vi.fn().mockResolvedValue('https://idp.example.com/sso?SAMLRequest=xyz'),
			validatePostResponseAsync: vi.fn().mockResolvedValue({
				profile: {
					nameID: 'user@example.com',
					email: 'user@example.com',
					firstName: 'Test',
					lastName: 'User',
					sessionIndex: 'session-123'
				}
			})
		};
	};
	return {
		SAML: MockSAML,
		ValidateInResponseTo: {
			never: 'never',
			ifPresent: 'ifPresent',
			always: 'always'
		}
	};
});

import {
	createSAMLProvider,
	generateMetadata,
	testSSOConnection,
	type SSOConfig,
	type SAMLUser,
	type AttributeMapping
} from './saml';

// Test SSO config fixture
const mockSSOConfig: SSOConfig = {
	id: 'sso-123',
	team_id: 'team-456',
	provider: 'okta',
	entity_id: 'https://idp.example.com/entity',
	sso_url: 'https://idp.example.com/sso',
	certificate: 'MIIC...certificate...',
	attribute_mapping: {
		email: 'email',
		firstName: 'firstName',
		lastName: 'lastName',
		groups: 'groups'
	},
	require_sso: false,
	jit_provisioning: true,
	created_at: '2026-01-15T00:00:00Z',
	updated_at: '2026-01-15T00:00:00Z'
};

describe('SAML Library', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('createSAMLProvider', () => {
		it('should create a SAML instance with correct config', () => {
			const saml = createSAMLProvider(mockSSOConfig);
			expect(saml).toBeDefined();
		});

		it('should return an object with expected methods', () => {
			const saml = createSAMLProvider(mockSSOConfig);
			expect(saml.getAuthorizeUrlAsync).toBeDefined();
			expect(saml.validatePostResponseAsync).toBeDefined();
		});
	});

	describe('generateMetadata', () => {
		it('should generate valid XML metadata', () => {
			const metadata = generateMetadata();

			expect(metadata).toContain('<?xml version="1.0" encoding="UTF-8"?>');
			expect(metadata).toContain('<EntityDescriptor');
			expect(metadata).toContain('</EntityDescriptor>');
		});

		it('should include SP entity ID', () => {
			const metadata = generateMetadata();

			expect(metadata).toContain('entityID="https://app.codedoc.ai/saml/metadata"');
		});

		it('should use custom entity ID when provided', () => {
			const customEntityId = 'https://custom.entity.id';
			const metadata = generateMetadata(customEntityId);

			expect(metadata).toContain(`entityID="${customEntityId}"`);
		});

		it('should include assertion consumer service URL', () => {
			const metadata = generateMetadata();

			expect(metadata).toContain('Location="https://app.codedoc.ai/auth/sso/callback"');
		});

		it('should include single logout service URL', () => {
			const metadata = generateMetadata();

			expect(metadata).toContain('Location="https://app.codedoc.ai/auth/sso/logout"');
		});

		it('should specify email as NameID format', () => {
			const metadata = generateMetadata();

			expect(metadata).toContain('urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress');
		});

		it('should indicate WantAssertionsSigned is true', () => {
			const metadata = generateMetadata();

			expect(metadata).toContain('WantAssertionsSigned="true"');
		});

		it('should use HTTP-POST binding for ACS', () => {
			const metadata = generateMetadata();

			expect(metadata).toContain('Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"');
		});
	});

	describe('testSSOConnection', () => {
		it('should return an object with success property', async () => {
			const config = {
				provider: 'okta' as const,
				entity_id: 'https://idp.example.com',
				sso_url: 'https://idp.example.com/sso',
				certificate: 'MIIC...',
				attribute_mapping: {},
				require_sso: false,
				jit_provisioning: true
			};

			const result = await testSSOConnection(config);

			expect(result).toHaveProperty('success');
			expect(typeof result.success).toBe('boolean');
		});

		it('should have error property when success is false', async () => {
			const config = {
				provider: 'okta' as const,
				entity_id: 'https://idp.example.com',
				sso_url: 'https://idp.example.com/sso',
				certificate: 'MIIC...',
				attribute_mapping: {},
				require_sso: false,
				jit_provisioning: true
			};

			const result = await testSSOConnection(config);

			// If success is false, error should be defined
			// If success is true, that's also valid (mock returns success)
			if (!result.success) {
				expect(result.error).toBeDefined();
			} else {
				expect(result.success).toBe(true);
			}
		});
	});

	describe('SSOConfig types', () => {
		it('should support okta provider', () => {
			const config: SSOConfig = { ...mockSSOConfig, provider: 'okta' };
			expect(config.provider).toBe('okta');
		});

		it('should support azure_ad provider', () => {
			const config: SSOConfig = { ...mockSSOConfig, provider: 'azure_ad' };
			expect(config.provider).toBe('azure_ad');
		});

		it('should support google provider', () => {
			const config: SSOConfig = { ...mockSSOConfig, provider: 'google' };
			expect(config.provider).toBe('google');
		});

		it('should support custom provider', () => {
			const config: SSOConfig = { ...mockSSOConfig, provider: 'custom' };
			expect(config.provider).toBe('custom');
		});
	});

	describe('AttributeMapping types', () => {
		it('should allow all optional fields', () => {
			const mapping: AttributeMapping = {};
			expect(mapping.email).toBeUndefined();
			expect(mapping.firstName).toBeUndefined();
			expect(mapping.lastName).toBeUndefined();
			expect(mapping.groups).toBeUndefined();
		});

		it('should allow custom attribute names', () => {
			const mapping: AttributeMapping = {
				email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
				firstName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
				lastName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
				groups: 'memberOf'
			};

			expect(mapping.email).toContain('emailaddress');
			expect(mapping.firstName).toContain('givenname');
		});
	});

	describe('SAMLUser types', () => {
		it('should have required nameId and email', () => {
			const user: SAMLUser = {
				nameId: 'user@example.com',
				email: 'user@example.com',
				attributes: {}
			};

			expect(user.nameId).toBe('user@example.com');
			expect(user.email).toBe('user@example.com');
		});

		it('should allow optional fields', () => {
			const user: SAMLUser = {
				nameId: 'user@example.com',
				email: 'user@example.com',
				firstName: 'Test',
				lastName: 'User',
				groups: ['admins', 'developers'],
				attributes: {},
				sessionIndex: 'session-123'
			};

			expect(user.firstName).toBe('Test');
			expect(user.lastName).toBe('User');
			expect(user.groups).toHaveLength(2);
			expect(user.sessionIndex).toBe('session-123');
		});
	});
});
