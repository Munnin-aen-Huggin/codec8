# Codec8 - Current State

**Last Updated:** 2026-02-26

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-15)

**Core value:** Speed — complete docs in 60 seconds
**Current focus:** LAUNCHED — marketing and customer acquisition

## Milestone Status

**v1.0 MVP Launch:** SHIPPED 2026-01-14
**v1.1 Growth:** SHIPPED 2026-01-15
**v1.2 Upsells:** SHIPPED 2026-01-15
**v2.0 Enterprise:** SHIPPED 2026-01-15
**Phase 14 (Enterprise Customization):** DEFERRED — handling bespoke via paywall

## Current Position

Phase: All phases complete / Phase 14 deferred
Status: LIVE IN PRODUCTION
Last activity: 2026-02-26 — Full production launch

**Live at:** https://codec8.com
**Stripe:** Live mode (real payments enabled)
**Webhook:** Configured at codec8.com/api/stripe/webhook
**GitHub Repo:** Munnin-aen-Huggin/codec8
**Hosting:** Vercel (all 22 env vars configured)

**Next Action:** Submit launch posts and acquire customers

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
| Unit Tests | Complete | 334 tests passing |
| E2E Tests | Complete | 48 tests passing |
| Try-Without-Signup | Complete | /try page, README only |
| Rate Limiting | Complete | IP-based demo limiting |
| Analytics | Complete | Event tracking |
| Landing Page | Complete | CRO-optimized |
| Auto-sync | Complete | GitHub webhooks |
| Team Collaboration | Complete | Invitations, roles, templates |
| Usage Analytics | Complete | 30-day charts |
| Subscription Add-ons | Complete | Extra repos, seats, unlimited regen |
| Stale Doc Alerts | Complete | Staleness detection system |
| Doc Quality Scoring | Complete | AI-powered analysis |
| Audit Logs | Complete | Team compliance logging |
| SSO/SAML | Complete | Okta, Azure AD, Google Workspace |
| JIT Provisioning | Complete | Auto-create users on SSO login |
| SCIM Directory Sync | Complete | Stubs for IdP user sync |
| Enterprise Tier | Complete | Unlimited usage, all features |

## Current Pricing Model

| Tier | Price | Type | Features |
|------|-------|------|----------|
| Free Demo | $0 | - | README only, 1 per IP, public repos |
| Single Repo | $99 | One-time | All 4 doc types, 1 repo forever |
| Pro | $149/mo | Subscription | 30 repos/month, cancel anytime |
| Team | $399/mo | Subscription | 100 repos/month, 5 seats, cancel anytime |
| Enterprise | $999/mo | Subscription | Unlimited repos/seats, SSO included |

### Add-ons (Pro/Team)

| Add-on | Price | Features |
|--------|-------|----------|
| Unlimited Regenerations | $29/mo | Remove 5-min cooldown |
| Extra Repos | $5/10 repos/mo | Stackable |
| Additional Seats | $49/seat/mo | Team only |
| Audit Logs | $49/mo | Team compliance |
| SSO/SAML | $99/mo | Team only, enterprise auth |

## Test Coverage

| Category | Tests | Status |
|----------|-------|--------|
| Unit Tests | 334 | Passing |
| E2E Tests | 48 | Passing |
| **Total** | **382** | **All passing** |

## Quick Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run test:unit    # Run unit tests
npm run test:e2e     # Run E2E tests
npm run check        # TypeScript check
```

## Launch Readiness (2026-02-26)

- [x] Stripe live keys configured
- [x] 9 live products/prices created in Stripe
- [x] Stripe webhook endpoint set up
- [x] All 22 Vercel env vars updated
- [x] Video demo replaced with animated CSS mockup
- [x] codec8.com domain configured on Vercel
- [x] Production deployment live
- [x] Launch posts drafted (Product Hunt, Show HN, Reddit)
- [ ] Submit Product Hunt launch
- [ ] Post Show HN
- [ ] Post to r/SaaS, r/webdev, r/Entrepreneur
- [ ] Email list setup (Kit/ConvertKit)
- [ ] Monitoring/alerting setup

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
| v1.2 Upsells | SHIPPED | 2026-01-15 |
| v2.0 Enterprise | SHIPPED | 2026-01-15 |

## Next Steps

1. **Launch posts:** Submit Product Hunt, Show HN, and Reddit posts (drafts ready)
2. **Gather feedback:** Monitor user signups and conversions
3. **Enterprise requests:** Handle via paywall + bespoke manual process
4. **Email list:** Set up Kit/ConvertKit for lead capture

---

*v1.0 shipped: 2026-01-14*
*v1.1 shipped: 2026-01-15*
*v1.2 shipped: 2026-01-15*
*v2.0 shipped: 2026-01-15*
*Production launch: 2026-02-26*
