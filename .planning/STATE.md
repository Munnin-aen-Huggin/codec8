# CodeDoc AI - Current State

**Last Updated:** 2026-01-13

## Build Progress

**Current Phase:** Phase 7 - SaaS Transformation (COMPLETE)
**Plan Progress:** 7 of 7 plans complete
**Day:** Post-foundation, ready for launch

## Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| Auth (GitHub OAuth) | Complete | Working in production |
| Dashboard | Complete | With loading states |
| Repo Connection | Complete | With toast notifications |
| Doc Generation | Complete | Claude API integration |
| Doc Viewer/Editor | Complete | With markdown preview |
| Payments (Stripe) | Complete | Hybrid pricing model |
| UI Components | Complete | Toast, Skeleton, DocTabs, DocEditor |
| Unit Tests | Complete | Updated for new pricing |
| Polish | Complete | Mobile responsive, error handling |
| Beta Infrastructure | Complete | Signup page, feedback widget |
| Security Fixes | Complete | crypto.getRandomValues, DOMPurify |
| Launch Assets | Complete | Video script, PH draft, copy |
| Analytics | Complete | Event tracking for key actions |
| Rate Limiting | Complete | IP-based demo limiting |
| Try-Without-Signup | Complete | /try page, README only |
| Hybrid Pricing | Complete | $39 one-time, $99/$249 subscriptions |
| CRO Landing Page | Complete | New design with hybrid pricing |
| Dashboard Usage Display | Complete | Usage stats, purchased repos, upgrade CTAs |

## Completed Work

### Phase 1-5: Foundation through Pre-Launch
- See previous commit history for full details
- All foundation features complete

### Phase 7: SaaS Transformation (IN PROGRESS)

**Plan 07-01: Rate Limiting Utilities** - COMPLETE
- `src/lib/server/ratelimit.ts` - IP-based rate limiting
- `src/lib/server/botdetect.ts` - Bot detection utilities

**Plan 07-02: Demo API Endpoint** - COMPLETE
- `src/routes/api/try/+server.ts` - Demo generation endpoint
- `src/lib/server/usage.ts` - Subscription usage tracking

**Plan 07-03: Demo Page UI** - COMPLETE
- `src/routes/try/+page.svelte` - Demo page
- `src/lib/components/LockedDocPreview.svelte` - Upsell component

**Plan 07-04: Hybrid Pricing Implementation** - COMPLETE
- Updated `src/lib/server/stripe.ts` - New pricing model
- Updated webhook handler for both one-time and subscription payments

**Plan 07-05: Landing Page CRO Update** - COMPLETE
- Complete rewrite of `src/routes/+page.svelte`
- Removed all fake social proof (fake user counts, activity ticker, countdown)
- New sections: Hero, What You Get, Free vs Paid, How It Works, Pricing (4 tiers), FAQ accordion, Final CTA
- Updated related components to remove LTD references

**Plan 07-06: Analytics System** - COMPLETE
- `src/lib/server/analytics.ts` - Server-side event tracking to Supabase
- `src/lib/stores/analytics.ts` - Client-side anonymous ID store
- Event tracking added to demo, auth, payment, and doc generation flows

**Plan 07-07: Dashboard Usage Display** - COMPLETE
- Updated `src/routes/dashboard/+page.server.ts` - Fetches subscription/usage data
- Updated `src/routes/dashboard/+page.svelte` - Usage stats, purchased repos, upgrade CTAs
- Dark theme styling with emerald accent

## Current Position

Phase: 8 of 8 (Comprehensive Testing) - IN PROGRESS
Plan: 4 of 5 complete
Status: Executing Phase 8 test plans
Last activity: 2026-01-14 - Completed 08-04-PLAN.md (Rate Limiting Tests)

Progress: ██████████████░ 96% (4/5 Phase 8 plans complete)

## New Pricing Model

| Tier | Price | Type | Features |
|------|-------|------|----------|
| Free Demo | $0 | - | README only, 1/day, public repos |
| Single Repo | $39 | One-time | All 4 doc types, 1 repo forever |
| Pro | $99/mo | Subscription | 30 repos/month, all features |
| Team | $249/mo | Subscription | 100 repos/month, 5 seats |

## Next Steps

### Phase 8 In Progress - Comprehensive Testing
- [x] 08-01: Bot Detection & Parser Utility Tests (TDD) - 107 tests
- [x] 08-02: Prompt Builder & Analytics Tests (TDD) - 41 tests
- [x] 08-03: Svelte Store Tests - 56 tests
- [x] 08-04: Rate Limiting Tests with Mocks (TDD) - 32 tests
- [ ] 08-05: E2E Tests for Critical Flows

### Manual Tasks (Pre-Launch)
- [ ] Beta user recruitment (10-20 users)
- [ ] Create `beta_signups` and `feedback` tables in Supabase
- [ ] Record demo video using script
- [ ] Capture screenshots for Product Hunt
- [ ] Email list setup (third-party)
- [ ] Product Hunt submission
- [ ] Monitoring setup (Vercel Analytics, error tracking)

## Blockers

None currently.

## Component Inventory

### UI Components (`src/lib/components/`)
| Component | Status | Description |
|-----------|--------|-------------|
| Toast.svelte | Complete | Global toast notifications |
| DocTabs.svelte | Complete | Tab navigation for doc types |
| DocEditor.svelte | Complete | Markdown editor with preview |
| Skeleton.svelte | Complete | Loading skeleton animation |
| RepoCardSkeleton.svelte | Complete | Repo card loading state |
| RepoCard.svelte | Complete | Repository display card |
| Header.svelte | Complete | Responsive header with mobile menu |
| FeedbackWidget.svelte | Complete | Floating feedback button |
| LockedDocPreview.svelte | Complete | Upsell component for locked docs |

### Server Utilities (`src/lib/server/`)
| Utility | Status | Description |
|---------|--------|-------------|
| supabase.ts | Complete | Supabase clients |
| github.ts | Complete | GitHub API functions |
| claude.ts | Complete | Claude API + prompts |
| stripe.ts | Complete | Hybrid pricing functions |
| ratelimit.ts | Complete | Rate limiting utilities |
| botdetect.ts | Complete | Bot detection utilities |
| usage.ts | Complete | Subscription usage tracking |
| analytics.ts | Complete | Server-side event tracking |

### Stores (`src/lib/stores/`)
| Store | Status | Description |
|-------|--------|-------------|
| auth.ts | Complete | User authentication state |
| repos.ts | Complete | Repository state |
| toast.ts | Complete | Toast notifications |
| analytics.ts | Complete | Anonymous ID for tracking |

### Tests
| Test File | Tests | Status |
|-----------|-------|--------|
| toast.test.ts | 11 | Passing |
| license.test.ts | 10 | Updated for new pricing |
| demo.spec.ts | 1 | Needs browser setup |

## Quick Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run test:unit    # Run unit tests
npm run check        # TypeScript check
npm run preview      # Preview production build
```

## Environment Variables Needed

```
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
ANTHROPIC_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_SINGLE=
STRIPE_PRICE_PRO=
STRIPE_PRICE_TEAM=
PUBLIC_APP_URL=
```

## Launch Assets Location

| Asset | Location |
|-------|----------|
| Demo Video Script | `.planning/assets/demo-video-script.md` |
| Product Hunt Draft | `.planning/assets/product-hunt-submission.md` |
| Launch Copy | `.planning/assets/launch-copy.md` |
| Launch Day Runbook | `.planning/assets/launch-day-runbook.md` |

## Known Issues

| ID | Severity | Description | Status |
|----|----------|-------------|--------|
| UAT-001 | Major | Demo video script messaging needs adjustment | Open (deferred) |
