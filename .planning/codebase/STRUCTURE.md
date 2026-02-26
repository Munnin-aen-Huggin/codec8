# Codebase Structure

**Analysis Date:** 2026-01-12

## Directory Layout

```
codec8/
├── src/                    # Application source code
│   ├── routes/            # SvelteKit pages and API endpoints
│   ├── lib/               # Shared libraries and components
│   └── app.css            # Global styles (Tailwind imports)
├── static/                 # Static assets
├── tests/                  # Test files (E2E)
├── .planning/             # Project planning documents
├── package.json            # Dependencies and scripts
├── svelte.config.js        # SvelteKit configuration
├── vite.config.ts          # Vite build configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── eslint.config.js        # ESLint configuration
└── playwright.config.ts    # Playwright E2E configuration
```

## Directory Purposes

**src/routes/**
- Purpose: SvelteKit file-based routing (pages + API)
- Contains: +page.svelte, +page.server.ts, +server.ts, +layout.svelte
- Subdirectories:
  - `auth/` - OAuth login, callback, logout endpoints
  - `dashboard/` - Main app pages with [repoId] dynamic route
  - `api/` - REST API endpoints (repos, docs, stripe, subscribe)
  - `checkout/` - Payment success page

**src/lib/**
- Purpose: Shared code importable via `$lib` alias
- Subdirectories:
  - `components/` - Reusable Svelte UI components
  - `server/` - Server-only modules (supabase, github, claude, stripe)
  - `stores/` - Svelte reactive stores (auth, repos, toast)
  - `utils/` - Utility functions (parser, prompts, license)
- Key files: `types.ts`, `index.ts`

**src/lib/components/**
- Purpose: Reusable Svelte UI components
- Contains: PascalCase .svelte files
- Key files:
  - `DocEditor.svelte` - Markdown editor with preview (428 lines)
  - `DocTabs.svelte` - Tab navigation for doc types
  - `RepoCard.svelte` - Repository display card
  - `Header.svelte` - Navigation header (298 lines)
  - `Toast.svelte` - Notification component
  - `Skeleton.svelte` - Loading placeholder
  - `RepoCardSkeleton.svelte` - Repo card loading state

**src/lib/server/**
- Purpose: Server-side only modules (external API clients)
- Contains: camelCase .ts files
- Key files:
  - `supabase.ts` - Database clients (admin + anon)
  - `github.ts` - GitHub API integration
  - `claude.ts` - Claude AI client and generation
  - `stripe.ts` - Stripe payment processing

**src/lib/stores/**
- Purpose: Svelte reactive state stores
- Contains: camelCase .ts files
- Key files:
  - `auth.ts` - User authentication state
  - `repos.ts` - Repository state management
  - `toast.ts` - Notification queue

**src/lib/utils/**
- Purpose: Shared utility functions
- Contains: camelCase .ts files
- Key files:
  - `parser.ts` - Repository context building (290+ lines)
  - `prompts.ts` - AI prompt templates
  - `license.ts` - License key generation and validation

## Key File Locations

**Entry Points:**
- `src/routes/+layout.server.ts` - Root server load (auth state)
- `src/routes/+layout.svelte` - Root layout component
- `src/routes/+page.svelte` - Landing page

**Configuration:**
- `tsconfig.json` - TypeScript config (strict mode)
- `svelte.config.js` - SvelteKit adapter and aliases
- `vite.config.ts` - Build and test configuration
- `tailwind.config.js` - Tailwind theme
- `eslint.config.js` - Linting rules
- `.prettierrc` - Code formatting

**Core Logic:**
- `src/lib/server/claude.ts` - AI documentation generation
- `src/lib/server/github.ts` - GitHub API wrapper
- `src/lib/utils/parser.ts` - Repository analysis
- `src/lib/utils/prompts.ts` - Prompt building

**Testing:**
- `src/lib/stores/toast.test.ts` - Store unit tests
- `src/lib/utils/license.test.ts` - Utility unit tests
- `src/routes/page.svelte.spec.ts` - Component tests
- `e2e/demo.test.ts` - E2E tests

**Documentation:**
- `CLAUDE.md` - AI assistant instructions
- `ARCHITECTURE.md` - System design documentation
- `.planning/` - Project planning files

## Naming Conventions

**Files:**
- PascalCase.svelte: Svelte components (`DocEditor.svelte`)
- camelCase.ts: TypeScript modules (`parser.ts`)
- +page.svelte, +server.ts: SvelteKit route files
- *.test.ts, *.spec.ts: Test files

**Directories:**
- kebab-case: All directories (`src/lib`, `src/routes`)
- Plural for collections: `components/`, `stores/`, `utils/`
- Singular for features: `auth/`, `checkout/`

**Special Patterns:**
- `[param]/` - Dynamic route segments (`[repoId]/`)
- `$lib/` - Import alias for `src/lib/`
- `$env/` - SvelteKit environment variables

## Where to Add New Code

**New Feature:**
- Primary code: `src/routes/` (pages) or `src/lib/` (shared)
- Tests: Co-located `*.test.ts` or `tests/` directory
- Config if needed: Root directory

**New Component:**
- Implementation: `src/lib/components/ComponentName.svelte`
- Types: `src/lib/types.ts` or inline
- Tests: `src/lib/components/ComponentName.spec.ts`

**New API Endpoint:**
- Definition: `src/routes/api/[resource]/+server.ts`
- Handler: Same file (GET, POST, etc. exports)
- Tests: `src/routes/api/[resource]/+server.test.ts`

**New Server Module:**
- Implementation: `src/lib/server/module-name.ts`
- Types: Export from same file or `src/lib/types.ts`

**New Store:**
- Implementation: `src/lib/stores/storeName.ts`
- Tests: `src/lib/stores/storeName.test.ts`

**Utilities:**
- Shared helpers: `src/lib/utils/helper-name.ts`
- Type definitions: `src/lib/types.ts`

## Special Directories

**.planning/**
- Purpose: Project planning and status documents
- Contains: PROJECT.md, ROADMAP.md, STATE.md, codebase/
- Committed: Yes

**node_modules/**
- Purpose: npm dependencies
- Source: `npm install`
- Committed: No (gitignored)

**.svelte-kit/**
- Purpose: SvelteKit build artifacts
- Source: Auto-generated during build
- Committed: No (gitignored)

**build/**
- Purpose: Production build output
- Source: `npm run build`
- Committed: No (gitignored)

---

*Structure analysis: 2026-01-12*
*Update when directory structure changes*
