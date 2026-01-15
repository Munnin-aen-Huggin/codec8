/**
 * SAML 2.0 Service Provider Implementation
 *
 * Provides SSO authentication via SAML 2.0 protocol.
 * Supports Okta, Azure AD, Google Workspace, and custom IdPs.
 */

import { SAML, ValidateInResponseTo, type Profile } from '@node-saml/node-saml';
import { PUBLIC_APP_URL } from '$env/static/public';
import { env } from '$env/dynamic/private';
import { supabaseAdmin } from './supabase';

// ============================================
// Types
// ============================================

export interface SSOConfig {
	id: string;
	team_id: string;
	provider: 'okta' | 'azure_ad' | 'google' | 'custom';
	entity_id: string;
	sso_url: string;
	certificate: string;
	attribute_mapping: AttributeMapping;
	require_sso: boolean;
	jit_provisioning: boolean;
	created_at: string;
	updated_at: string;
}

export interface AttributeMapping {
	email?: string;
	firstName?: string;
	lastName?: string;
	groups?: string;
}

export interface SAMLUser {
	nameId: string;
	email: string;
	firstName?: string;
	lastName?: string;
	groups?: string[];
	attributes: Record<string, string | string[]>;
	sessionIndex?: string;
}

export interface SAMLAuthRequest {
	redirectUrl: string;
	requestId: string;
}

// Default attribute names for common IdPs
const DEFAULT_ATTRIBUTE_MAPPINGS: Record<string, AttributeMapping> = {
	okta: {
		email: 'email',
		firstName: 'firstName',
		lastName: 'lastName',
		groups: 'groups'
	},
	azure_ad: {
		email:
			'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
		firstName:
			'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
		lastName:
			'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
		groups:
			'http://schemas.microsoft.com/ws/2008/06/identity/claims/groups'
	},
	google: {
		email: 'email',
		firstName: 'firstName',
		lastName: 'lastName'
	},
	custom: {
		email: 'email',
		firstName: 'firstName',
		lastName: 'lastName',
		groups: 'groups'
	}
};

// ============================================
// SAML Provider Factory
// ============================================

/**
 * Create a SAML instance for a specific SSO configuration
 */
export function createSAMLProvider(config: SSOConfig): SAML {
	const baseUrl = PUBLIC_APP_URL.replace(/\/$/, '');

	return new SAML({
		callbackUrl: `${baseUrl}/auth/sso/callback`,
		entryPoint: config.sso_url,
		issuer: config.entity_id || `${baseUrl}/saml/metadata`,
		idpCert: config.certificate,
		wantAssertionsSigned: true,
		signatureAlgorithm: 'sha256',
		digestAlgorithm: 'sha256',
		identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
		acceptedClockSkewMs: 60000, // 1 minute clock skew tolerance
		validateInResponseTo: ValidateInResponseTo.never, // Simplified for initial implementation
		disableRequestedAuthnContext: true
	});
}

/**
 * Create a SAML instance for logout
 */
export function createSAMLProviderForLogout(
	config: SSOConfig,
	logoutUrl?: string
): SAML {
	const baseUrl = PUBLIC_APP_URL.replace(/\/$/, '');

	return new SAML({
		callbackUrl: `${baseUrl}/auth/sso/callback`,
		entryPoint: config.sso_url,
		logoutUrl: logoutUrl || config.sso_url,
		issuer: config.entity_id || `${baseUrl}/saml/metadata`,
		idpCert: config.certificate,
		signatureAlgorithm: 'sha256'
	});
}

// ============================================
// Authentication Flow
// ============================================

/**
 * Generate SAML authentication request URL
 */
export async function generateAuthRequest(
	config: SSOConfig,
	relayState?: string
): Promise<SAMLAuthRequest> {
	const saml = createSAMLProvider(config);

	const url = await saml.getAuthorizeUrlAsync(relayState || '', undefined, {});

	// Extract request ID from URL if needed
	const requestId = crypto.randomUUID();

	return {
		redirectUrl: url,
		requestId
	};
}

/**
 * Validate SAML response and extract user information
 */
export async function validateSAMLResponse(
	config: SSOConfig,
	samlResponse: string
): Promise<SAMLUser> {
	const saml = createSAMLProvider(config);
	const attributeMapping = {
		...DEFAULT_ATTRIBUTE_MAPPINGS[config.provider],
		...config.attribute_mapping
	};

	const result = await saml.validatePostResponseAsync({ SAMLResponse: samlResponse });

	if (!result.profile) {
		throw new Error('No profile in SAML response');
	}

	const profile = result.profile as Profile;
	const attributes = profile as unknown as Record<string, unknown>;

	// Extract user info using attribute mapping
	const user: SAMLUser = {
		nameId: profile.nameID || '',
		email: extractAttribute(attributes, attributeMapping.email || 'email'),
		firstName: extractAttribute(attributes, attributeMapping.firstName || 'firstName'),
		lastName: extractAttribute(attributes, attributeMapping.lastName || 'lastName'),
		groups: extractAttributeArray(attributes, attributeMapping.groups || 'groups'),
		attributes: attributes as Record<string, string | string[]>,
		sessionIndex: profile.sessionIndex
	};

	if (!user.email) {
		throw new Error('Email not found in SAML response');
	}

	return user;
}

// ============================================
// Metadata Generation
// ============================================

/**
 * Generate SP metadata XML for IdP configuration
 */
export function generateMetadata(entityId?: string): string {
	const baseUrl = PUBLIC_APP_URL.replace(/\/$/, '');
	const spEntityId = entityId || `${baseUrl}/saml/metadata`;
	const acsUrl = `${baseUrl}/auth/sso/callback`;
	const sloUrl = `${baseUrl}/auth/sso/logout`;

	// Get SP certificate if configured
	const spCert = env.SAML_SP_CERTIFICATE || '';
	const certBlock = spCert
		? `
    <KeyDescriptor use="signing">
      <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
        <ds:X509Data>
          <ds:X509Certificate>${spCert.replace(/-----BEGIN CERTIFICATE-----|-----END CERTIFICATE-----|\n/g, '')}</ds:X509Certificate>
        </ds:X509Data>
      </ds:KeyInfo>
    </KeyDescriptor>`
		: '';

	return `<?xml version="1.0" encoding="UTF-8"?>
<EntityDescriptor xmlns="urn:oasis:names:tc:SAML:2.0:metadata"
                  entityID="${spEntityId}">
  <SPSSODescriptor AuthnRequestsSigned="false"
                   WantAssertionsSigned="true"
                   protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    ${certBlock}
    <NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</NameIDFormat>
    <AssertionConsumerService index="0"
                               isDefault="true"
                               Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                               Location="${acsUrl}" />
    <SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                         Location="${sloUrl}" />
  </SPSSODescriptor>
</EntityDescriptor>`;
}

// ============================================
// SSO Configuration Management
// ============================================

/**
 * Get SSO config for a team
 */
export async function getSSOConfig(teamId: string): Promise<SSOConfig | null> {
	const { data, error } = await supabaseAdmin
		.from('sso_configs')
		.select('*')
		.eq('team_id', teamId)
		.single();

	if (error || !data) {
		return null;
	}

	return data as SSOConfig;
}

/**
 * Get SSO config by team slug (for login flow)
 */
export async function getSSOConfigBySlug(
	slug: string
): Promise<{ config: SSOConfig; team: { id: string; name: string } } | null> {
	const { data: team, error: teamError } = await supabaseAdmin
		.from('teams')
		.select('id, name')
		.eq('slug', slug)
		.single();

	if (teamError || !team) {
		return null;
	}

	const config = await getSSOConfig(team.id);
	if (!config) {
		return null;
	}

	return { config, team };
}

/**
 * Create or update SSO config
 */
export async function upsertSSOConfig(
	teamId: string,
	config: Omit<SSOConfig, 'id' | 'team_id' | 'created_at' | 'updated_at'>
): Promise<SSOConfig> {
	const { data, error } = await supabaseAdmin
		.from('sso_configs')
		.upsert(
			{
				team_id: teamId,
				...config,
				updated_at: new Date().toISOString()
			},
			{
				onConflict: 'team_id'
			}
		)
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to save SSO config: ${error.message}`);
	}

	return data as SSOConfig;
}

/**
 * Delete SSO config
 */
export async function deleteSSOConfig(teamId: string): Promise<void> {
	const { error } = await supabaseAdmin
		.from('sso_configs')
		.delete()
		.eq('team_id', teamId);

	if (error) {
		throw new Error(`Failed to delete SSO config: ${error.message}`);
	}
}

// ============================================
// SSO Session Management
// ============================================

/**
 * Create SSO session record
 */
export async function createSSOSession(
	userId: string,
	teamId: string,
	idpSessionId?: string,
	expiresInHours: number = 8
): Promise<string> {
	const expiresAt = new Date();
	expiresAt.setHours(expiresAt.getHours() + expiresInHours);

	const { data, error } = await supabaseAdmin
		.from('sso_sessions')
		.insert({
			user_id: userId,
			team_id: teamId,
			idp_session_id: idpSessionId,
			expires_at: expiresAt.toISOString()
		})
		.select('id')
		.single();

	if (error) {
		throw new Error(`Failed to create SSO session: ${error.message}`);
	}

	return data.id;
}

/**
 * Validate SSO session
 */
export async function validateSSOSession(
	userId: string,
	teamId: string
): Promise<boolean> {
	const { data, error } = await supabaseAdmin
		.from('sso_sessions')
		.select('id, expires_at')
		.eq('user_id', userId)
		.eq('team_id', teamId)
		.gt('expires_at', new Date().toISOString())
		.single();

	return !error && !!data;
}

/**
 * Invalidate all SSO sessions for a user
 */
export async function invalidateSSOSessions(userId: string): Promise<void> {
	await supabaseAdmin
		.from('sso_sessions')
		.delete()
		.eq('user_id', userId);
}

// ============================================
// Helpers
// ============================================

function extractAttribute(
	attributes: Record<string, unknown>,
	key: string
): string {
	const value = attributes[key];
	if (Array.isArray(value)) {
		return value[0]?.toString() || '';
	}
	return value?.toString() || '';
}

function extractAttributeArray(
	attributes: Record<string, unknown>,
	key: string
): string[] {
	const value = attributes[key];
	if (Array.isArray(value)) {
		return value.map((v) => v?.toString() || '').filter(Boolean);
	}
	if (value) {
		return [value.toString()];
	}
	return [];
}

/**
 * Test SSO connection by attempting to generate auth request
 */
export async function testSSOConnection(
	config: Omit<SSOConfig, 'id' | 'team_id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; error?: string }> {
	try {
		const testConfig = {
			...config,
			id: 'test',
			team_id: 'test',
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		} as SSOConfig;

		const saml = createSAMLProvider(testConfig);

		// Try to generate an auth URL to verify config is valid
		await saml.getAuthorizeUrlAsync('test', undefined, {});

		return { success: true };
	} catch (err) {
		return {
			success: false,
			error: err instanceof Error ? err.message : 'Unknown error'
		};
	}
}
