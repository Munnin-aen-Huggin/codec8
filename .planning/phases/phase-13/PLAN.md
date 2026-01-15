# Phase 13: Enterprise Authentication (SSO/SAML)

## Overview

Add SSO/SAML authentication for enterprise customers, enabling them to use their existing identity providers (Okta, Azure AD, Google Workspace) to manage team access.

## Goals

1. SAML 2.0 Service Provider (SP) implementation
2. Identity Provider (IdP) configuration UI
3. Just-in-time (JIT) provisioning of users
4. Directory sync for team member management
5. Enterprise tier with SSO-only access

## Architecture

### SAML 2.0 Flow

```
User → CodeDoc Login → IdP Selection → IdP Authentication → SAML Response → CodeDoc Session
```

### Database Schema

```sql
-- SSO Configuration for teams
CREATE TABLE IF NOT EXISTS sso_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID UNIQUE NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('okta', 'azure_ad', 'google', 'custom')),
  entity_id TEXT NOT NULL,
  sso_url TEXT NOT NULL,
  certificate TEXT NOT NULL,
  attribute_mapping JSONB DEFAULT '{}',
  require_sso BOOLEAN DEFAULT false,
  jit_provisioning BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SSO Sessions for tracking IdP sessions
CREATE TABLE IF NOT EXISTS sso_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  idp_session_id TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add SSO-related columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS
  sso_provider TEXT,
  sso_id TEXT,
  sso_team_id UUID REFERENCES teams(id);

-- Add enterprise tier to teams
ALTER TABLE teams ADD COLUMN IF NOT EXISTS
  enterprise_tier BOOLEAN DEFAULT false,
  sso_required BOOLEAN DEFAULT false;

-- Indexes
CREATE INDEX idx_sso_configs_team_id ON sso_configs(team_id);
CREATE INDEX idx_sso_sessions_user_id ON sso_sessions(user_id);
CREATE INDEX idx_profiles_sso_id ON profiles(sso_id) WHERE sso_id IS NOT NULL;
```

## Implementation Tasks

### Task 1: SAML Library Integration (13-01)

**Files to create:**
- `src/lib/server/saml.ts` - SAML 2.0 SP implementation

**Dependencies:**
- `@node-saml/node-saml` - SAML 2.0 library

**Implementation:**
```typescript
// src/lib/server/saml.ts
import { SAML } from '@node-saml/node-saml';

export interface SSOConfig {
  entityId: string;
  ssoUrl: string;
  certificate: string;
  attributeMapping: {
    email?: string;
    firstName?: string;
    lastName?: string;
    groups?: string;
  };
}

export async function createSAMLProvider(config: SSOConfig) {
  return new SAML({
    callbackUrl: `${PUBLIC_APP_URL}/auth/sso/callback`,
    entryPoint: config.ssoUrl,
    issuer: `${PUBLIC_APP_URL}/saml/metadata`,
    cert: config.certificate,
    wantAssertionsSigned: true,
    signatureAlgorithm: 'sha256'
  });
}

export async function validateSAMLResponse(
  saml: SAML,
  samlResponse: string
): Promise<SAMLUser> {
  // Validate and extract user info
}

export function generateMetadata(entityId: string): string {
  // Generate SP metadata XML
}
```

### Task 2: SSO Configuration API (13-02)

**Files to create:**
- `src/routes/api/teams/[id]/sso/+server.ts` - SSO config CRUD
- `src/routes/api/teams/[id]/sso/metadata/+server.ts` - SAML metadata endpoint

**Endpoints:**
- `GET /api/teams/[id]/sso` - Get SSO config
- `POST /api/teams/[id]/sso` - Create/update SSO config
- `DELETE /api/teams/[id]/sso` - Remove SSO config
- `GET /api/teams/[id]/sso/metadata` - Get SP metadata XML

### Task 3: SSO Authentication Routes (13-03)

**Files to create:**
- `src/routes/auth/sso/+server.ts` - Initiate SSO login
- `src/routes/auth/sso/callback/+server.ts` - Handle SAML response
- `src/routes/auth/sso/logout/+server.ts` - SLO (Single Logout)

**Flow:**
1. User clicks "Login with SSO"
2. User enters email domain or team slug
3. System looks up SSO config for team
4. Redirects to IdP with SAML AuthnRequest
5. IdP authenticates user
6. IdP posts SAML Response to callback
7. System validates response, creates/updates profile
8. System creates session and redirects to dashboard

### Task 4: SSO Configuration UI (13-04)

**Files to create:**
- `src/routes/dashboard/team/[id]/sso/+page.svelte` - SSO settings page
- `src/routes/dashboard/team/[id]/sso/+page.server.ts` - Load SSO config

**UI Components:**
- IdP provider selection (Okta, Azure AD, Google, Custom)
- Certificate upload/paste
- SSO URL configuration
- Attribute mapping configuration
- Test SSO connection
- Require SSO toggle

### Task 5: JIT Provisioning (13-05)

**Files to modify:**
- `src/lib/server/teams.ts` - Add JIT provisioning logic
- `src/routes/auth/sso/callback/+server.ts` - Handle new users

**Logic:**
1. SAML response contains user info
2. Check if user exists by SSO ID
3. If not, create profile with SSO info
4. Auto-add to team with default role
5. Create session

### Task 6: Directory Sync (13-06)

**Files to create:**
- `src/lib/server/directory-sync.ts` - SCIM 2.0 endpoint stubs
- `src/routes/api/scim/Users/+server.ts` - User provisioning
- `src/routes/api/scim/Groups/+server.ts` - Group provisioning

**Note:** Full SCIM implementation is complex. Phase 13 will include stubs for future expansion.

### Task 7: Enterprise Tier & Pricing (13-07)

**Files to modify:**
- `src/lib/server/stripe.ts` - Add enterprise tier
- `src/routes/api/stripe/webhook/+server.ts` - Handle enterprise subscriptions

**Stripe Products:**
- Enterprise: Custom pricing (contact sales)
- SSO Add-on: $99/mo for Team tier

## API Reference

### SSO Config
```typescript
interface SSOConfig {
  id: string;
  team_id: string;
  provider: 'okta' | 'azure_ad' | 'google' | 'custom';
  entity_id: string;
  sso_url: string;
  certificate: string;
  attribute_mapping: {
    email: string;
    firstName: string;
    lastName: string;
    groups: string;
  };
  require_sso: boolean;
  jit_provisioning: boolean;
}
```

### SAML User
```typescript
interface SAMLUser {
  nameId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  groups?: string[];
  attributes: Record<string, string>;
}
```

## Security Considerations

1. **Certificate Validation:** Always validate IdP certificate
2. **Response Replay:** Check InResponseTo and timestamps
3. **Audience Restriction:** Validate audience matches our entity ID
4. **Signature Verification:** Require signed assertions
5. **Session Binding:** Bind SSO session to IdP session
6. **Force SSO:** Enterprise teams can require SSO-only login

## Testing Plan

1. **Unit Tests:**
   - SAML request generation
   - Response validation
   - Attribute mapping

2. **Integration Tests:**
   - Mock IdP responses
   - JIT provisioning flow
   - Session management

3. **Manual Testing:**
   - Okta developer account
   - Azure AD test tenant
   - Google Workspace test

## Environment Variables

```
SAML_SP_ENTITY_ID=https://app.codedoc.ai/saml/metadata
SAML_PRIVATE_KEY_PATH=/path/to/sp.key
SAML_CERTIFICATE_PATH=/path/to/sp.crt
```

## Implementation Order

1. **13-01: SAML Library** - Core SAML implementation
2. **13-02: SSO Config API** - Database and API
3. **13-03: Auth Routes** - Login/callback flow
4. **13-04: UI** - Configuration interface
5. **13-05: JIT Provisioning** - Auto user creation
6. **13-06: Directory Sync** - SCIM stubs
7. **13-07: Enterprise Tier** - Pricing integration

## Dependencies

```json
{
  "@node-saml/node-saml": "^5.0.0"
}
```

## Estimated Complexity

| Task | Complexity | Notes |
|------|------------|-------|
| 13-01 | High | Core SAML implementation |
| 13-02 | Medium | Standard CRUD |
| 13-03 | High | Security-critical flow |
| 13-04 | Medium | Form-based UI |
| 13-05 | Medium | Extends existing logic |
| 13-06 | Low | Stubs only |
| 13-07 | Low | Stripe config |

## References

- [SAML 2.0 Specification](https://docs.oasis-open.org/security/saml/v2.0/)
- [node-saml Documentation](https://github.com/node-saml/node-saml)
- [Okta SAML Setup Guide](https://developer.okta.com/docs/guides/saml-application-setup/)
- [Azure AD SAML Setup](https://learn.microsoft.com/en-us/azure/active-directory/manage-apps/configure-saml-single-sign-on)
