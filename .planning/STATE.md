# CodeDoc AI - Current State

**Last Updated:** 2026-01-15

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-15)

**Core value:** Speed — complete docs in 60 seconds
**Current focus:** v2.0 Enterprise - SSO/SAML, audit logs, customization

## Milestone Status

**v1.0 MVP Launch:** SHIPPED 2026-01-14
**v1.1 Growth:** SHIPPED 2026-01-15
**v2.0 Enterprise:** Planning

## Current Position

Phase: 12 — Enterprise Authentication
Plan: Not started
Status: Ready to plan
Last activity: 2026-01-15 — v1.1 milestone complete

Progress: [░░░░░░░░░░] 0/? plans in Phase 12

**Next Action:** Plan v2.0 Enterprise features or launch activities

## Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| Auth (GitHub OAuth) | Complete | Working in production |
| Dashboard | Complete | With loading states |
| Repo Connection | Complete | With toast notifications |
| Doc Generation | Complete | Claude API integration |
| Doc Viewer/Editor | Complete | With markdown preview |
| Payments (Stripe) | Complete | Value-based pricing |
| UI Components | Complete | Toast, Skeleton, DocTabs, DocEditor |
| Unit Tests | Complete | 260 tests passing |
| E2E Tests | Complete | 48 tests passing |
| Try-Without-Signup | Complete | /try page, README only |
| Rate Limiting | Complete | IP-based demo limiting |
| Analytics | Complete | Event tracking |
| Landing Page | Complete | CRO-optimized |
| Auto-sync | Complete | GitHub webhooks |
| Team Collaboration | Complete | Invitations, roles, templates |
| Usage Analytics | Complete | 30-day charts |

## Current Pricing Model

| Tier | Price | Type | Features |
|------|-------|------|----------|
| Free Demo | $0 | - | README only, 1/day, public repos |
| Single Repo | $99 | One-time | All 4 doc types, 1 repo forever |
| Pro | $149/mo | Subscription | 30 repos/month, cancel anytime |
| Team | $399/mo | Subscription | 100 repos/month, 5 seats, cancel anytime |

## Test Coverage

| Category | Tests | Status |
|----------|-------|--------|
| Unit Tests | 260 | Passing |
| E2E Tests | 48 | Passing |
| **Total** | **308** | **All passing** |

## Quick Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run test:unit    # Run unit tests
npm run test:e2e     # Run E2E tests
npm run check        # TypeScript check
```

## Manual Launch Tasks

- [ ] Record demo video using script
- [ ] Capture screenshots for Product Hunt
- [ ] Create Stripe products with new price IDs
- [ ] Update Vercel env vars
- [ ] Product Hunt submission
- [ ] Hacker News Show HN post
- [ ] Reddit posts
- [ ] Email list setup
- [ ] Monitoring setup

## Key Decisions Made

| Decision | Rationale |
|----------|-----------|
| Value-based pricing | Tech writers = $400-800, we = $99 |
| Single Repo as POPULAR | Lower barrier than subscription |
| Remove fake social proof | Build trust, avoid backlash |
| Try-without-signup | Reduce friction |
| Comprehensive TDD | Ship confidently |
| Token-based invitations | Secure team invites |
| 5-minute webhook cooldown | Prevent spam regenerations |
| CSS-based payment badges | Avoid SVG rendering issues |

## Completed Milestones

| Milestone | Status | Notes |
|-----------|--------|-------|
| v1.0 MVP Launch | SHIPPED | 2026-01-14 |
| v1.1 Growth | SHIPPED | 2026-01-15 |

## Next Steps

1. **Launch:** Execute launch runbook (Product Hunt, HN, Reddit)
2. **Gather feedback:** Monitor user signups and conversions
3. **Plan v2.0:** Enterprise features based on customer demand

---

*v1.0 shipped: 2026-01-14*
*v1.1 shipped: 2026-01-15*
