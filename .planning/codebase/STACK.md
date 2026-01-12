# Technology Stack

**Analysis Date:** 2026-01-12

## Languages

**Primary:**
- TypeScript 5.9.3 - All application code (`tsconfig.json`)

**Secondary:**
- JavaScript - Build scripts, config files (`svelte.config.js`, `eslint.config.js`)

## Runtime

**Environment:**
- Node.js 25.x (LTS)
- ES Modules (`package.json` type: "module")

**Package Manager:**
- npm 10.x
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- SvelteKit 2.49.1 - Full-stack web framework (`svelte.config.js`)
- Svelte 5.45.6 - Component framework (`src/lib/components/`)
- Tailwind CSS 3.4.19 - Utility CSS (`tailwind.config.js`, `src/app.css`)

**Testing:**
- Vitest 4.0.15 - Unit testing (`vite.config.ts`)
- Playwright 1.57.0 - E2E testing (`playwright.config.ts`)
- @testing-library/svelte 5.3.1 - Component testing

**Build/Dev:**
- Vite 7.2.6 - Build tool and dev server (`vite.config.ts`)
- TypeScript 5.9.3 - Compilation (`tsconfig.json`)
- PostCSS 8.5.6 - CSS transformation (`postcss.config.js`)
- Autoprefixer 10.4.23 - CSS vendor prefixes

## Key Dependencies

**Critical:**
- @anthropic-ai/sdk 0.71.2 - Claude API client for AI doc generation (`src/lib/server/claude.ts`)
- @supabase/supabase-js 2.90.1 - Database and auth SDK (`src/lib/server/supabase.ts`)
- stripe 20.1.2 - Payment processing (`src/lib/server/stripe.ts`)
- marked 17.0.1 - Markdown parsing and rendering (`src/lib/components/DocEditor.svelte`)

**Infrastructure:**
- @sveltejs/adapter-auto 7.0.0 - Vercel deployment adapter (`svelte.config.js`)
- svelte-check 4.2.1 - Svelte type checking

## Configuration

**Environment:**
- `.env` files (gitignored) - All secrets and API keys
- Required variables: `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `PUBLIC_STRIPE_PUBLISHABLE_KEY`, `PUBLIC_APP_URL`, `SESSION_SECRET`

**Build:**
- `tsconfig.json` - TypeScript compiler options (strict mode enabled)
- `vite.config.ts` - Vite and Vitest configuration
- `svelte.config.js` - SvelteKit configuration with adapter-auto
- `tailwind.config.js` - Tailwind CSS customization
- `eslint.config.js` - ESLint flat config with TypeScript and Svelte support

## Platform Requirements

**Development:**
- macOS/Linux/Windows (any platform with Node.js)
- No Docker required for local development

**Production:**
- Vercel - Serverless deployment
- Supabase - PostgreSQL database hosting
- Auto-deployed on main branch push

---

*Stack analysis: 2026-01-12*
*Update after major dependency changes*
