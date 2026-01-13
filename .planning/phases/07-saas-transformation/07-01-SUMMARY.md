---
phase: 07-saas-transformation
plan: 01
subsystem: security, infra
tags: [rate-limiting, bot-detection, security, demo-protection]

# Dependency graph
requires:
  - phase: 05-pre-launch
    provides: Core application, auth, analytics
provides:
  - Rate limiting utilities (IP hashing, usage tracking)
  - Bot detection utilities (UA patterns, IP extraction)
  - Database interaction for demo_usage and blocked_clients tables
affects: [07-02, demo-endpoint, api-protection]

# Tech tracking
tech-stack:
  added: []
  patterns: [SHA256 hashing for IP privacy, regex patterns for bot detection]

key-files:
  created:
    - src/lib/server/ratelimit.ts
    - src/lib/server/botdetect.ts
  modified: []

key-decisions:
  - "Use SHA256 hashing for all IP addresses - never store raw IPs"
  - "Bot detection via user-agent regex patterns"
  - "Support multiple proxy headers (x-forwarded-for, cf-connecting-ip, etc.)"
  - "1 demo request per day per IP limit"

patterns-established:
  - "IP hashing with crypto.createHash('sha256')"
  - "Bot detection via user-agent pattern matching"
  - "Proxy header extraction order: x-forwarded-for > x-real-ip > cf-connecting-ip"

issues-created: []

# Metrics
duration: 5min
completed: 2026-01-13
---

# Phase 7.1: Rate Limiting Utilities Summary

**Server-side utilities for rate limiting and bot detection to protect the demo endpoint**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-13
- **Completed:** 2026-01-13
- **Tasks:** 2 automated
- **Files created:** 2

## Accomplishments

- Created rate limiting utility module with 5 exported functions:
  - `hashIP(ip)` - SHA256 hash of IP address for privacy
  - `hashFingerprint(fp)` - SHA256 hash of browser fingerprint
  - `isBlocked(ipHash, fingerprint?)` - Check blocked_clients table
  - `checkDemoLimit(ipHash)` - Check demo_usage table (1/day limit)
  - `incrementDemoUsage(ipHash, metadata)` - Track demo usage with metadata
  - `blockClient(ipHash, reason, durationHours?)` - Add to blocked_clients

- Created bot detection utility module with 2 exported functions:
  - `isSuspiciousUA(userAgent)` - Check against 24 bot patterns
  - `getClientIP(request)` - Extract IP from proxy headers

## Task Commits

Tasks to be committed:

1. **Task 1: Rate Limiting Utility Module** - `feat(07-01): add rate limiting utility module`
2. **Task 2: Bot Detection Utility Module** - `feat(07-01): add bot detection utility module`

## Files Created

### src/lib/server/ratelimit.ts
- IP and fingerprint hashing with SHA256
- Database queries to blocked_clients and demo_usage tables
- Upsert logic for tracking daily demo usage
- Configurable block duration (temporary or permanent)

### src/lib/server/botdetect.ts
- 24 regex patterns for common bots (curl, wget, python-requests, scrapy, puppeteer, etc.)
- User-agent validation (empty/missing UAs are suspicious)
- Multi-header IP extraction for various proxy setups

## Bot Patterns Detected

The following automation tools are flagged as suspicious:
- HTTP clients: curl, wget, HTTPie, Postman, Insomnia
- Python: requests, urllib, Scrapy
- Node.js: axios, node-fetch, got, undici
- Browser automation: Puppeteer, Playwright, Selenium, PhantomJS
- Others: Java, Perl, Ruby, Mechanize

## Database Tables Required

**Note:** These tables must be created via manual SQL before the utilities can work:

1. `demo_usage` table:
   - ip_hash (TEXT, PK part)
   - date (DATE, PK part)
   - usage_count (INTEGER)
   - last_repo_url (TEXT)
   - user_agent (TEXT)
   - fingerprint (TEXT, nullable)
   - is_suspicious (BOOLEAN)
   - last_used_at (TIMESTAMPTZ)

2. `blocked_clients` table:
   - id (UUID, PK)
   - ip_hash (TEXT)
   - fingerprint (TEXT, nullable)
   - reason (TEXT)
   - blocked_at (TIMESTAMPTZ)
   - expires_at (TIMESTAMPTZ, nullable - null = permanent)

## Decisions Made

1. **SHA256 for IP hashing:** Industry standard, irreversible, privacy-preserving
2. **Fingerprint support:** Optional additional layer for detecting evasion
3. **Generous bot patterns:** Better to flag and log suspicious activity than miss abuse
4. **Multi-proxy support:** Works with Vercel, Cloudflare, nginx, and direct connections

## Deviations from Plan

None - plan executed as written.

## Issues Encountered

None.

## Verification Required

Before proceeding to Plan 07-02:
- [ ] `npm run check` passes
- [ ] `npm run build` succeeds
- [ ] Create demo_usage and blocked_clients tables in Supabase

## Next Phase Readiness

- Rate limiting infrastructure ready
- Bot detection ready for use
- Ready for 07-02-PLAN.md (Demo Page and API Endpoint)

---
*Phase: 07-saas-transformation*
*Plan: 01*
*Completed: 2026-01-13*
