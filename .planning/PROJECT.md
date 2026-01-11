# CodeDoc AI

## Overview

CodeDoc AI is a SaaS application that automatically generates professional documentation from GitHub repositories using Claude AI. Users connect their GitHub repos and receive README files, API documentation, architecture diagrams (Mermaid), and setup guides.

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

### Pricing Tiers

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | 1 repository |
| Lifetime Deal (LTD) | $99 | Unlimited repos |
| Pro Setup | $497 | LTD + 30-min onboarding call |
| Done-For-You (DFY) | $2,500+ | Complete documentation service |

### Revenue Goal

**Target:** $85K in 30 days

### Launch Channels

- Product Hunt
- Hacker News
- Reddit (r/SideProject, r/webdev, r/startups)
- LTD communities (AppSumo, SaaSMantra, etc.)

## Key Features

1. **GitHub Integration** - OAuth connect, repo browsing, automatic sync
2. **AI Documentation** - README, API docs, architecture diagrams, setup guides
3. **Doc Editor** - Markdown editing with live preview
4. **Export Options** - Download as Markdown, create GitHub PR
5. **License System** - Key-based activation for paid tiers

## Success Metrics

- User signups
- Repos connected
- Docs generated
- Conversion rate (free to paid)
- Revenue per tier

## Team

Solo developer project with 7-day build sprint followed by 7-day pre-launch and 7-day launch phases.
