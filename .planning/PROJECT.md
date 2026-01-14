# CodeDoc AI

## What This Is

CodeDoc AI is a SaaS application that automatically generates professional documentation from GitHub repositories using Claude AI. Users paste a repo URL and receive README files, API documentation, architecture diagrams (Mermaid), and setup guides in 60 seconds.

## Core Value

**Speed:** Complete documentation suite in 60 seconds vs 6-8 hours manually.

## Current State (v1.0 shipped)

- **Codebase:** 11,501 LOC TypeScript/Svelte
- **Tests:** 308 passing (260 unit + 48 E2E)
- **Tech stack:** SvelteKit 2.0, Supabase, Stripe, Claude API, Vercel
- **Status:** Ready for launch

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | SvelteKit 2.0 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| State | Svelte Stores |
| Database | Supabase PostgreSQL |
| Auth | GitHub OAuth via Supabase |
| AI | Claude API (claude-sonnet-4-20250514) |
| Payments | Stripe Checkout + Webhooks |
| Hosting | Vercel |
| Testing | Vitest + Playwright |

## Business Model

### Pricing Tiers (Value-Based)

| Tier | Price | Type | Features |
|------|-------|------|----------|
| Free Demo | $0 | - | README only, 1/day, public repos |
| Single Repo | $99 | One-time | All 4 doc types, 1 repo forever |
| Pro | $149/mo | Subscription | 30 repos/month, 7-day trial |
| Team | $399/mo | Subscription | 100 repos/month, 5 seats, 7-day trial |

### Revenue Goal

**Target:** $85K in 30 days

### Launch Channels

- Product Hunt
- Hacker News
- Reddit (r/SideProject, r/webdev, r/startups)

## Requirements

### Validated (v1.0)

- ✓ GitHub OAuth authentication — v1.0
- ✓ Repository connection and listing — v1.0
- ✓ AI documentation generation (4 types) — v1.0
- ✓ Doc viewer/editor with markdown preview — v1.0
- ✓ Stripe payments (one-time + subscription) — v1.0
- ✓ Try-without-signup demo — v1.0
- ✓ Rate limiting and bot detection — v1.0
- ✓ Beta signup and feedback system — v1.0
- ✓ CRO-optimized landing page — v1.0
- ✓ Comprehensive test coverage — v1.0

### Active (v1.1+)

- [ ] Auto-sync documentation on git push
- [ ] Team member invitations
- [ ] Custom documentation templates
- [ ] Slack integration for teams
- [ ] Usage analytics dashboard

### Out of Scope

- Mobile app — web-first, responsive design works
- Self-hosted option — SaaS only for now
- Non-GitHub repos — GitHub focus for MVP

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Value-based pricing ($99/$149/$399) | Tech writers charge $50-100/hr, 6-8hr job | — Pending |
| Single Repo as POPULAR tier | Lower barrier than subscription | — Pending |
| Try-without-signup | Reduce friction, showcase quality | ✓ Good |
| Remove fake social proof | Build trust, avoid backlash | ✓ Good |
| IP-based rate limiting | Prevent abuse without accounts | ✓ Good |
| Comprehensive TDD | Catch regressions, ship confidently | ✓ Good |

## Constraints

- Solo developer
- 7-day build sprints
- No external funding
- Claude API rate limits apply

## Success Metrics

- User signups
- Repos documented
- Demo → paid conversion rate
- Revenue per tier
- MRR growth

---
*Last updated: 2026-01-14 after v1.0 milestone*
