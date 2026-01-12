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

### Phase 5: Pre-Launch (Days 8-14) - IN PROGRESS

**Status:** In progress (1/3 plans complete)

**Deliverables:**
- [x] Beta signup page (`/beta`)
- [x] Feedback collection system
- [x] Security fixes (crypto.getRandomValues, DOMPurify, .env.example)
- [ ] Beta testing with 10-20 users (manual)
- [ ] Bug fixes from beta feedback (manual)
- [ ] Demo video (2-3 minutes)
- [ ] Screenshots for launch assets
- [ ] Product Hunt submission prep
- [ ] Launch copy and messaging
- [ ] Email list setup

**Key Files:**
- `src/routes/beta/` - Beta signup page
- `src/routes/api/beta/+server.ts` - Beta signup API
- `src/routes/api/feedback/+server.ts` - Feedback API
- `src/lib/components/FeedbackWidget.svelte` - Feedback widget
- `.env.example` - Environment variable documentation

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
