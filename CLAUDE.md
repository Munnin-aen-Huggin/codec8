# CodeDoc AI

## Project Overview

CodeDoc AI is a SaaS application that automatically generates professional documentation from GitHub repositories using Claude AI. Users connect their GitHub repos and receive README files, API documentation, architecture diagrams (Mermaid), and setup guides.

**Business Model:** Three-tier pricing
- Free: 1 repo
- Lifetime Deal ($99): Unlimited repos
- Pro Setup ($497): LTD + 30-min onboarding call
- Done-For-You ($2,500+): We document everything

**Target Revenue:** $85K in 30 days via Product Hunt, Hacker News, Reddit, and LTD communities.

---

## Current Project State

**Build Day:** 3 of 7
**Current Phase:** Phase 2 - Core Feature

### Completed Features
- SvelteKit 2.0 setup with TypeScript
- Tailwind CSS styling
- Supabase database + RLS policies
- GitHub OAuth authentication
- Landing page with pricing
- Dashboard with repo listing
- Repository connection flow
- Vercel deployment
- Claude API client
- Doc generation endpoint structure

### In Progress
- Documentation generation testing
- Doc viewer/editor component
- Tab navigation for doc types

### Not Started
- Stripe payments
- License verification
- Polish and testing

---

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

---

## Project Structure

```
codedoc-ai/
├── src/
│   ├── routes/
│   │   ├── +page.svelte                 # Landing page
│   │   ├── +layout.svelte               # Root layout (loads auth)
│   │   ├── +layout.server.ts            # Server-side auth check
│   │   ├── auth/
│   │   │   ├── login/+server.ts         # Initiates GitHub OAuth
│   │   │   ├── callback/+server.ts      # Handles OAuth callback
│   │   │   └── logout/+server.ts        # Clears session
│   │   ├── dashboard/
│   │   │   ├── +page.svelte             # Main dashboard
│   │   │   ├── +page.server.ts          # Loads user repos
│   │   │   └── [repoId]/
│   │   │       ├── +page.svelte         # Repo detail + doc viewer
│   │   │       └── +page.server.ts      # Loads repo docs
│   │   └── api/
│   │       ├── repos/
│   │       │   ├── +server.ts           # GET: list repos, POST: connect
│   │       │   └── [id]/+server.ts      # GET/DELETE specific repo
│   │       ├── docs/
│   │       │   ├── generate/+server.ts  # POST: generate docs
│   │       │   └── [id]/+server.ts      # GET/PUT/DELETE doc
│   │       └── stripe/
│   │           ├── checkout/+server.ts  # POST: create checkout
│   │           └── webhook/+server.ts   # POST: handle events
│   ├── lib/
│   │   ├── components/
│   │   │   ├── RepoCard.svelte          # Repository display card
│   │   │   ├── DocEditor.svelte         # Markdown editor + preview
│   │   │   ├── DocTabs.svelte           # Tab navigation
│   │   │   ├── GenerateButton.svelte    # Generation trigger
│   │   │   ├── PricingCard.svelte       # Pricing tier card
│   │   │   └── Header.svelte            # Navigation header
│   │   ├── stores/
│   │   │   ├── auth.ts                  # User authentication state
│   │   │   ├── repos.ts                 # Repository state
│   │   │   └── docs.ts                  # Documentation state
│   │   ├── server/
│   │   │   ├── supabase.ts              # Supabase clients
│   │   │   ├── github.ts                # GitHub API functions
│   │   │   ├── claude.ts                # Claude API + prompts
│   │   │   └── stripe.ts                # Stripe functions
│   │   ├── utils/
│   │   │   ├── parser.ts                # Code parsing utilities
│   │   │   ├── prompts.ts               # AI prompt templates
│   │   │   └── license.ts               # License key generation
│   │   └── types.ts                     # TypeScript interfaces
│   └── app.css                          # Tailwind imports
├── .planning/
│   ├── PROJECT.md                       # Project overview
│   ├── ROADMAP.md                       # Development phases
│   └── STATE.md                         # Current status
├── static/
├── tests/
├── .env                                 # Environment variables (git-ignored)
├── svelte.config.js
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

---

## Database Schema

### profiles
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | References auth.users |
| email | TEXT | User email |
| github_username | TEXT | GitHub handle |
| github_token | TEXT | Encrypted OAuth token |
| plan | TEXT | free, ltd, pro, dfy |
| created_at | TIMESTAMPTZ | Account creation |

### repositories
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| user_id | UUID (FK) | References profiles |
| github_repo_id | BIGINT | GitHub's repo ID |
| name | TEXT | Repo name |
| full_name | TEXT | owner/repo |
| private | BOOLEAN | Visibility |
| default_branch | TEXT | main/master |
| last_synced | TIMESTAMPTZ | Last fetch |

### documentation
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| repo_id | UUID (FK) | References repositories |
| type | TEXT | readme, api, architecture, setup |
| content | TEXT | Markdown content |
| version | INTEGER | Increment on regen |
| generated_at | TIMESTAMPTZ | Generation time |

### licenses
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| user_id | UUID (FK) | References profiles |
| license_key | TEXT (UNIQUE) | XXXX-XXXX-XXXX-XXXX |
| tier | TEXT | ltd, pro, dfy |
| stripe_payment_id | TEXT | Stripe reference |
| activated_at | TIMESTAMPTZ | Activation time |

---

## API Endpoints

### Authentication
- `GET /auth/login` - Redirect to GitHub OAuth
- `GET /auth/callback` - Handle OAuth, create session
- `POST /auth/logout` - Clear session cookie

### Repositories
- `GET /api/repos` - List user's GitHub repos
- `POST /api/repos` - Connect a repository
- `GET /api/repos/[id]` - Get repo details
- `DELETE /api/repos/[id]` - Disconnect repo
- `POST /api/repos/[id]/sync` - Re-fetch repo contents

### Documentation
- `POST /api/docs/generate` - Generate docs (body: { repoId, types[] })
- `GET /api/docs/[repoId]` - Get all docs for repo
- `PUT /api/docs/[id]` - Update doc content
- `POST /api/docs/[id]/export` - Export as Markdown file
- `POST /api/docs/[id]/pr` - Create GitHub PR

### Payments
- `POST /api/stripe/checkout` - Create checkout session
- `POST /api/stripe/webhook` - Handle Stripe events

---

## Environment Variables

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
PUBLIC_APP_URL=
SESSION_SECRET=
```

---

## Coding Conventions

### Files
- Components: PascalCase (`RepoCard.svelte`)
- Stores: camelCase (`auth.ts`)
- Utils: camelCase (`parser.ts`)
- Types: PascalCase interfaces (`User`, `Repository`)

### Svelte
- Use `<script lang="ts">` in all components
- Props: `export let propName: Type`
- Reactive: `$: derivedValue = compute(source)`
- Events: `on:click={() => handler()}`
- Bindings: `bind:value={variable}`

### Stores
```typescript
// Pattern for all stores
import { writable, derived } from 'svelte/store';

function createStoreName() {
  const { subscribe, set, update } = writable<StateType>(initialState);
  return {
    subscribe,
    methodName: (param) => update(s => ({ ...s, changes })),
  };
}

export const storeName = createStoreName();
export const derivedValue = derived(storeName, $s => $s.property);
```

### Server Endpoints
```typescript
// Pattern for +server.ts files
import { json, error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, cookies, request }) => {
  // Verify auth
  // Fetch data
  // Return json() or throw error()/redirect()
};
```

### Error Handling
- Always use try/catch in server endpoints
- Return user-friendly error messages
- Log technical details server-side
- Use SvelteKit's `error()` helper for HTTP errors

### Testing
- Unit tests: `tests/unit/[category]/[name].test.ts`
- Use `describe`, `it`, `expect` from Vitest
- Component tests: `@testing-library/svelte`
- E2E tests: Playwright with `tests/e2e/[flow].spec.ts`

---

## Key Commands

```bash
# Development
npm run dev              # Start dev server (localhost:5173)
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm test                 # Run all tests
npm run test:unit        # Unit tests only
npm run test:e2e         # E2E tests

# Database
npx supabase db push     # Push schema changes
npx supabase gen types   # Generate TypeScript types

# Deployment
vercel                   # Deploy to Vercel
vercel --prod            # Deploy to production
```

---

## Important Notes

1. **Never commit .env** - Contains secrets
2. **GitHub tokens** - Must be encrypted before storing
3. **RLS policies** - All tables have Row Level Security
4. **Free tier limits** - Check repo count before connecting
5. **Rate limiting** - GitHub API: 5000/hr, Claude API: varies
6. **Session cookies** - httpOnly, secure, sameSite: lax

---

## GSD Planning Files

See `.planning/` directory for:
- `PROJECT.md` - Project overview and goals
- `ROADMAP.md` - Development phases and milestones
- `STATE.md` - Current status and next tasks

---

## Links

- Supabase Dashboard: https://supabase.com/dashboard
- GitHub OAuth Apps: https://github.com/settings/developers
- Stripe Dashboard: https://dashboard.stripe.com
- Vercel Dashboard: https://vercel.com/dashboard
- Claude API Docs: https://docs.anthropic.com
