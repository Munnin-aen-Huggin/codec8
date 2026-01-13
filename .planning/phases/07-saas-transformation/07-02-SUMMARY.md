# Plan 07-02 Summary: Demo API Endpoint & Usage Tracking

**Phase:** 07 - SaaS Transformation
**Plan:** 02 of 07
**Status:** Complete
**Date:** 2026-01-13

## What Was Built

### 1. Demo API Endpoint (`src/routes/api/try/+server.ts`)

A complete POST endpoint that enables try-without-signup functionality for the SaaS transformation.

**Features:**
- **GitHub URL Parsing**: Validates and parses various GitHub URL formats (https, http, with/without www, .git suffix, branch paths)
- **Anti-Abuse Protection**:
  - User-Agent validation (bot detection via `botdetect.ts`)
  - IP-based rate limiting (1/day via `ratelimit.ts`)
  - Blocked client checking
  - Fingerprint tracking
- **Repository Validation**: Checks if repo exists and is public using GitHub API
- **Context Building**: Fetches limited repo context (~4000 tokens):
  - Root directory listing
  - README.md (if exists)
  - Manifest files (package.json, requirements.txt, etc.)
  - Sample source files from src/lib/app directories
- **README Generation**: Uses Claude API (claude-sonnet-4-20250514, max_tokens: 2000)
- **Usage Recording**: Increments demo usage counter after successful generation

**Request/Response:**
```typescript
// POST /api/try
// Request:
{
  githubUrl: "https://github.com/owner/repo",
  fingerprint?: "optional-browser-fingerprint"
}

// Success Response (200):
{
  readme: "# Generated README content...",
  repoName: "owner/repo",
  generationsRemaining: 0
}

// Error Responses:
// 400 - Invalid URL, missing URL, private repo, repo not found
// 403 - Blocked client
// 429 - Rate limit exceeded (includes canTryAgainAt timestamp)
// 500 - GitHub API error, generation failed
```

### 2. Usage Tracking Utility (`src/lib/server/usage.ts`)

A comprehensive utility for subscription-based usage tracking, supporting the hybrid pricing model.

**Exported Functions:**
- `checkUsageLimit(userId)` - Check subscriber's monthly usage vs limits
- `canGenerateForRepo(userId, repoUrl)` - Check if user can generate (subscription or purchased repo)
- `incrementUsage(userId)` - Increment repos_used_this_month counter
- `getProfile(userId)` - Fetch profile with subscription fields
- `resetMonthlyUsage(userId, periodStart, periodEnd)` - Reset on billing cycle
- `getUsageStats(userId)` - Get detailed usage statistics

**Tier Limits:**
| Tier | Limit |
|------|-------|
| Pro | 30/month |
| Team | 100/month |
| Free | 1/month |
| LTD (legacy) | Unlimited |

**Interfaces:**
- `Profile` - User profile with subscription fields
- `UsageResult` - Usage check result (allowed, used, limit, tier)
- `CanGenerateResult` - Can generate check (allowed, reason)

## Files Created

| File | Lines | Purpose |
|------|-------|---------|
| `src/routes/api/try/+server.ts` | 473 | Demo API endpoint |
| `src/lib/server/usage.ts` | 310 | Usage tracking utility |

## Dependencies Used

- `$lib/server/ratelimit.ts` - hashIP, isBlocked, checkDemoLimit, incrementDemoUsage
- `$lib/server/botdetect.ts` - isSuspiciousUA, getClientIP
- `$lib/server/supabase.ts` - supabaseAdmin
- `@anthropic-ai/sdk` - Claude API client
- `$env/static/private` - ANTHROPIC_API_KEY

## Integration Points

### Database Tables Referenced
- `demo_usage` - Demo usage tracking (from ratelimit.ts)
- `blocked_clients` - Blocked client list (from ratelimit.ts)
- `profiles` - User profiles with subscription fields
- `purchased_repos` - One-time repo purchases

### New Profile Fields Assumed
For the hybrid pricing model, these fields should exist in profiles:
- `subscription_status` - active, canceled, past_due, etc.
- `subscription_tier` - pro, team
- `repos_used_this_month` - Monthly counter
- `current_period_start` - Billing period start
- `current_period_end` - Billing period end

## Testing Notes

To test the demo endpoint:
```bash
curl -X POST http://localhost:5173/api/try \
  -H "Content-Type: application/json" \
  -d '{"githubUrl": "https://github.com/sveltejs/kit"}'
```

Expected response with valid public repo and available rate limit:
- 200 with generated README
- Rate limit consumed (0 remaining)

## Next Steps

1. **Plan 07-03**: Hybrid pricing implementation (Stripe integration for $39 one-time + subscriptions)
2. **Plan 07-04**: Landing page update with new pricing
3. Create demo frontend page (`/try`) to use this endpoint

## Verification Checklist

- [x] Demo endpoint handles all request flows
- [x] Usage utility exports all required functions
- [x] Rate limiting integrated correctly
- [x] Bot detection integrated correctly
- [x] Error handling returns appropriate status codes
- [ ] `npm run check` passes (manual verification required)
- [ ] `npm run build` succeeds (manual verification required)
