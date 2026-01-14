# CodeDoc AI Roadmap

## Milestone 1: MVP Launch (21 Days)

### Phase 1: Foundation (Days 1-2) - COMPLETE

**Status:** Complete

**Deliverables:**
- [x] SvelteKit 2.0 project setup with TypeScript
- [x] Tailwind CSS configuration
- [x] Supabase database schema and RLS policies
- [x] GitHub OAuth authentication flow
- [x] Landing page with pricing
- [x] Dashboard skeleton
- [x] Repository connection flow
- [x] Vercel deployment

**Key Files:**
- `src/routes/auth/` - OAuth handlers
- `src/routes/dashboard/` - Dashboard pages
- `src/lib/components/RepoCard.svelte` - Repo display

---

### Phase 2: Core Feature (Day 3) - COMPLETE

**Status:** Complete

**Deliverables:**
- [x] Claude API client setup
- [x] Prompt templates for doc types (README, API, architecture, setup)
- [x] Documentation generation endpoint
- [x] Repo detail page structure
- [x] Basic doc viewer

**Key Files:**
- `src/lib/server/claude.ts` - Claude API integration
- `src/lib/utils/prompts.ts` - Prompt templates
- `src/routes/api/docs/` - Doc API endpoints
- `src/routes/dashboard/[repoId]/` - Repo detail page

**Remaining (moved to Phase 4):**
- Doc editor component with full editing
- Tab navigation for doc types
- Markdown preview enhancements
- Export functionality

---

### Phase 3: Payments (Day 4) - COMPLETE

**Status:** Complete

**Deliverables:**
- [x] Stripe product/price setup (config in stripe.ts)
- [x] Checkout session creation
- [x] Webhook handler for payment events
- [x] License key generation
- [x] Plan upgrade flow
- [x] Usage limits enforcement (in license.ts)
- [x] Success page with license display
- [x] Dashboard upgrade button
- [x] Login redirect for checkout

**Key Files:**
- `src/lib/server/stripe.ts` - Stripe API client + helpers
- `src/routes/api/stripe/checkout/+server.ts` - Checkout endpoint
- `src/routes/api/stripe/webhook/+server.ts` - Webhook handler
- `src/routes/checkout/success/` - Success page
- `src/lib/utils/license.ts` - License utilities

---

### Phase 4: Polish (Day 5) - COMPLETE

**Status:** Complete

**Deliverables:**
- [x] Toast notification system (replaces all alerts)
- [x] Loading skeleton components
- [x] DocTabs reusable component
- [x] DocEditor with live preview
- [x] Header with mobile menu
- [x] Mobile responsive improvements
- [x] Unit tests (22 tests passing)

**Key Files:**
- `src/lib/stores/toast.ts` - Toast state management
- `src/lib/components/Toast.svelte` - Toast UI component
- `src/lib/components/DocTabs.svelte` - Tab navigation
- `src/lib/components/DocEditor.svelte` - Markdown editor
- `src/lib/components/Skeleton.svelte` - Loading skeleton
- `src/lib/components/Header.svelte` - Responsive header
- `src/lib/stores/toast.test.ts` - Toast unit tests
- `src/lib/utils/license.test.ts` - License utility tests

---

### Phase 5: Pre-Launch (Days 8-14) - COMPLETE

**Status:** Complete (3/3 plans complete)

**Deliverables:**
- [x] Beta signup page (`/beta`)
- [x] Feedback collection system
- [x] Security fixes (crypto.getRandomValues, DOMPurify, .env.example)
- [x] Demo video script (8 scenes, 2-3 min)
- [x] Product Hunt submission draft
- [x] Launch copy (Twitter, HN, Reddit, Email, LinkedIn, Discord)
- [x] Analytics event tracking
- [x] Launch day runbook
- [ ] Beta testing with 10-20 users (manual)
- [ ] Bug fixes from beta feedback (manual)
- [ ] Demo video recording (manual)
- [ ] Screenshots for launch assets (manual)
- [ ] Email list setup (manual)
- [ ] Product Hunt submission (manual)

**Key Files:**
- `src/routes/beta/` - Beta signup page
- `src/routes/api/beta/+server.ts` - Beta signup API
- `src/routes/api/feedback/+server.ts` - Feedback API
- `src/lib/components/FeedbackWidget.svelte` - Feedback widget
- `src/lib/utils/analytics.ts` - Event tracking utility
- `.env.example` - Environment variable documentation
- `.planning/assets/demo-video-script.md` - Video script
- `.planning/assets/product-hunt-submission.md` - PH draft
- `.planning/assets/launch-copy.md` - Multi-platform copy
- `.planning/assets/launch-day-runbook.md` - Launch operations guide

---

### Phase 6: Launch (Days 15-21) - NOT STARTED

**Status:** Pending

**Deliverables:**
- [ ] Product Hunt launch
- [ ] Hacker News Show HN post
- [ ] Reddit posts (r/SideProject, r/webdev, r/startups)
- [ ] LTD community outreach
- [ ] Customer support setup
- [ ] Analytics monitoring
- [ ] Iterate based on feedback

---

### Phase 7: SaaS Transformation - Hybrid Pricing & Try Without Signup

**Status:** Complete (7/7 plans complete)

**Goal:** Transform from LTD pricing to hybrid subscription model with try-without-signup activation

**Depends on:** Phase 6
**Plans:** 7 plans (6 complete)

**Sub-Phases:**
- Phase 7.1: Rate Limiting & Bot Detection
- Phase 7.2: Demo API Endpoint & Usage Tracking
- Phase 7.3: Demo Page UI
- Phase 7.4: Hybrid Pricing Implementation
- Phase 7.5: Landing Page CRO Update
- Phase 7.6: Analytics & Event Tracking
- Phase 7.7: Final Testing & Polish

**New Pricing Model:**
| Tier | Price | Type | Limits |
|------|-------|------|--------|
| Free Demo | $0 | - | 1 README/day, public repos |
| Single Repo | $39 | One-time | Full suite, 1 repo, forever |
| Pro | $99/mo | Subscription | 30 repos/mo, all features |
| Team | $249/mo | Subscription | 100 repos/mo, 5 seats |

**Key Files Created:**
- `src/routes/try/+page.svelte` - Demo page
- `src/routes/api/try/+server.ts` - Demo API endpoint
- `src/lib/server/ratelimit.ts` - Rate limiting utilities
- `src/lib/server/botdetect.ts` - Bot detection
- `src/lib/server/usage.ts` - Usage tracking
- `src/lib/components/LockedDocPreview.svelte` - Upsell component
- `src/lib/server/analytics.ts` - Server-side event tracking
- `src/lib/stores/analytics.ts` - Client-side anonymous ID store

**Key Files Modified:**
- `src/lib/server/stripe.ts` - Hybrid pricing
- `src/routes/api/stripe/webhook/+server.ts` - Handle both payment types, event tracking
- `src/routes/+page.svelte` - CRO-optimized landing page
- `src/routes/dashboard/+page.svelte` - Usage display, dark theme, upgrade CTAs
- `src/routes/dashboard/+page.server.ts` - Fetch subscription/usage data
- `src/routes/auth/callback/+server.ts` - Auth event tracking
- `src/routes/api/docs/generate/+server.ts` - Doc generation tracking

**Success Criteria:**
- [x] Try without signup works (1/day per IP)
- [x] Hybrid pricing active ($39 one-time + $99/$249 subscriptions)
- [x] No fake social proof anywhere
- [x] Events tracked for conversion funnel
- [x] Dashboard shows usage stats and purchased repos
- [x] Upgrade CTAs for free users

**Completed Plans:**
- [x] 07-01: Rate Limiting Utilities (ratelimit.ts, botdetect.ts)
- [x] 07-02: Demo API Endpoint & Usage Tracking (api/try/+server.ts, usage.ts)
- [x] 07-03: Demo Page UI (routes/try/+page.svelte, LockedDocPreview.svelte)
- [x] 07-04: Hybrid Pricing Implementation (stripe.ts, webhook, checkout)
- [x] 07-05: Landing Page CRO Update (complete rewrite, removed fake social proof)
- [x] 07-06: Analytics & Event Tracking (server/analytics.ts, stores/analytics.ts)
- [x] 07-07: Dashboard Usage Display (dashboard loader, usage UI, dark theme)

**Details:**
See `.planning/phases/07-saas-transformation/` for detailed implementation plans.

---

### Phase 8: Comprehensive Test Coverage

**Status:** In Progress (3/5 plans complete)

**Goal:** Achieve comprehensive test coverage across the codebase using TDD methodology.

**Plans:**
- Phase 8.1: Bot Detection & Parser Utility Tests (TDD)
- Phase 8.2: Prompt Builder & Analytics Tests (TDD)
- Phase 8.3: Svelte Store Tests
- Phase 8.4: Rate Limiting Tests with Mocks (TDD)
- Phase 8.5: E2E Tests for Critical Flows

**Test Categories:**
| Category | Files | Expected Tests |
|----------|-------|----------------|
| Pure Utils | botdetect.ts, parser.ts | 35+ |
| Prompts | prompts.ts | 15+ |
| Stores | auth.ts, repos.ts, analytics.ts | 20+ |
| Rate Limiting | ratelimit.ts | 25+ |
| E2E | landing, demo pages | 18+ |
| **Total** | | **113+ new tests** |

**Key Files to Create:**
- `src/lib/server/botdetect.test.ts`
- `src/lib/utils/parser.test.ts`
- `src/lib/utils/prompts.test.ts`
- `src/lib/stores/auth.test.ts`
- `src/lib/stores/repos.test.ts`
- `src/lib/stores/analytics.test.ts`
- `src/lib/server/ratelimit.test.ts`
- `e2e/landing.test.ts`
- `e2e/try.test.ts`

**Success Criteria:**
- [ ] 100+ new tests passing
- [ ] All pure functions have unit tests
- [ ] All stores have unit tests
- [ ] Critical E2E flows covered
- [ ] Test suite runs in <60 seconds

**Details:**
See `.planning/phases/08-comprehensive-testing/` for detailed test plans.

---

## Future Milestones

### Milestone 2: Growth Features
- Team/organization support
- Custom branding
- API access for developers
- Integrations (Notion, Confluence)

### Milestone 3: Enterprise
- SSO/SAML
- Audit logs
- SLA support
- On-premise option
