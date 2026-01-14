# CodeDoc AI - Current State

**Last Updated:** 2026-01-14

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-14)

**Core value:** Speed — complete docs in 60 seconds
**Current focus:** v1.0 shipped, ready for launch

## Milestone Status

**v1.0 MVP Launch:** SHIPPED 2026-01-14

## Current Position

Phase: Post-v1.0 (Planning v1.1)
Plan: Not started
Status: Ready to plan next milestone
Last activity: 2026-01-14 — v1.0 milestone complete

Progress: [MILESTONE COMPLETE] v1.0 shipped

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

## Current Pricing Model

| Tier | Price | Type | Features |
|------|-------|------|----------|
| Free Demo | $0 | - | README only, 1/day, public repos |
| Single Repo | $99 | One-time | All 4 doc types, 1 repo forever |
| Pro | $149/mo | Subscription | 30 repos/month, 7-day trial |
| Team | $399/mo | Subscription | 100 repos/month, 5 seats, 7-day trial |

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

## Next Steps

1. **Launch:** Execute launch runbook
2. **Monitor:** Track signups, conversions, feedback
3. **v1.1 Planning:** Based on user feedback

---

*v1.0 shipped: 2026-01-14*
