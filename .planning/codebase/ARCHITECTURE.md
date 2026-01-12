# Architecture

**Analysis Date:** 2026-01-12

## Pattern Overview

**Overall:** Layered Full-Stack Monolith (SvelteKit)

**Key Characteristics:**
- Single SvelteKit application deployed to Vercel serverless
- Clear separation between presentation, API, and business logic
- File-based routing with server-side data loading
- Stateless request handling with cookie-based sessions

## Layers

**Presentation Layer:**
- Purpose: User interface and client-side interactions
- Contains: Svelte components, pages, layouts
- Location: `src/routes/**/*.svelte`, `src/lib/components/*.svelte`
- Depends on: Svelte stores for state, API endpoints for data
- Used by: End users via browser

**API/Route Layer:**
- Purpose: HTTP request/response handling, authentication, routing
- Contains: SvelteKit server endpoints (+server.ts), page loaders (+page.server.ts)
- Location: `src/routes/api/**/*.ts`, `src/routes/auth/**/*.ts`
- Depends on: Business logic layer (server modules)
- Used by: Presentation layer via fetch calls

**Business Logic Layer:**
- Purpose: Core application logic and external service integration
- Contains: Service modules for Claude, GitHub, Stripe, Supabase
- Location: `src/lib/server/*.ts`, `src/lib/utils/*.ts`
- Depends on: External APIs, database
- Used by: API/Route layer

**Data Layer:**
- Purpose: Data persistence and querying
- Contains: Supabase PostgreSQL with RLS policies
- Access via: `supabaseAdmin` client in `src/lib/server/supabase.ts`
- Tables: profiles, repositories, documentation, licenses

**State Management Layer:**
- Purpose: Client-side reactive state
- Contains: Svelte writable and derived stores
- Location: `src/lib/stores/*.ts`
- Used by: Presentation layer components

## Data Flow

**User Authentication (OAuth):**

1. User clicks "Sign In" on landing page
2. GET `/auth/login` generates CSRF state and redirects to GitHub
3. GitHub authenticates and redirects to `/auth/callback?code=...&state=...`
4. Callback verifies state, exchanges code for access token
5. Fetches GitHub user profile and emails
6. Creates/updates profile in Supabase with encrypted token
7. Sets session cookie (JSON with userId, 7-day expiry)
8. Redirects to `/dashboard`

**Documentation Generation:**

1. User selects doc types on repo detail page
2. POST `/api/docs/generate` with repoId and types array
3. Verify session and repository ownership
4. Call `fetchRepoContext()` to gather repository data from GitHub:
   - Fetch repo tree recursively
   - Identify key files (package.json, configs)
   - Fetch content for up to 5 key files + 10 route files
   - Build ASCII file tree
   - Parse package.json for framework detection
5. For each doc type, build appropriate prompt and call Claude API
6. Save generated docs to database (insert or update)
7. Return saved docs to frontend
8. Display in tabs with markdown preview

**Payment Processing:**

1. User clicks upgrade button
2. POST `/api/stripe/checkout` creates Stripe checkout session
3. User redirected to Stripe hosted checkout
4. After payment, Stripe sends webhook to `/api/stripe/webhook`
5. Webhook verifies signature, processes `checkout.session.completed`
6. Creates license record and updates user plan in database
7. User redirected to `/checkout/success`

**State Management:**
- Stateless server: No server-side session store
- Session in cookie: JSON with userId (httpOnly, 7-day expiry)
- Client state: Svelte stores for auth, repos, toasts
- Database per request: Each API call queries Supabase fresh

## Key Abstractions

**Service Modules:**
- Purpose: Encapsulate external API integration
- Examples: `src/lib/server/claude.ts`, `src/lib/server/github.ts`, `src/lib/server/stripe.ts`
- Pattern: Exported async functions with typed parameters and returns

**Svelte Stores:**
- Purpose: Reactive client-side state management
- Examples: `src/lib/stores/auth.ts`, `src/lib/stores/repos.ts`, `src/lib/stores/toast.ts`
- Pattern: Factory function returning writable store with methods

**Request Handlers:**
- Purpose: HTTP endpoint implementation
- Pattern: Typed `RequestHandler` exports (GET, POST, PUT, DELETE)
- Location: `src/routes/api/**/*.ts`
- Common: Session extraction, validation, database query, JSON response

**Page Loaders:**
- Purpose: Server-side data fetching for pages
- Pattern: `PageServerLoad` exports in +page.server.ts
- Returns typed data to page components

**Prompt Builders:**
- Purpose: Construct AI prompts from repository context
- Location: `src/lib/utils/prompts.ts`
- Examples: `buildReadmePrompt()`, `buildApiPrompt()`, `buildArchitecturePrompt()`, `buildSetupPrompt()`

## Entry Points

**CLI/Development Entry:**
- Location: `svelte.config.js`, `vite.config.ts`
- Triggers: `npm run dev` (port 5173)
- Responsibilities: Start dev server, enable HMR

**Application Entry:**
- Location: `src/routes/+layout.server.ts`
- Triggers: Any page request
- Responsibilities: Load auth state from session cookie for all pages

**API Entry Points:**
- Auth: `src/routes/auth/login/+server.ts`, `src/routes/auth/callback/+server.ts`
- Repos: `src/routes/api/repos/+server.ts`
- Docs: `src/routes/api/docs/generate/+server.ts`
- Payments: `src/routes/api/stripe/checkout/+server.ts`, `src/routes/api/stripe/webhook/+server.ts`

## Error Handling

**Strategy:** Throw exceptions at service layer, catch at API boundary

**Patterns:**
- Services throw Error with descriptive messages
- API handlers wrap in try/catch, return error() or json({ error })
- Page loaders use redirect() for auth failures
- Client-side: toast notifications for user-facing errors

## Cross-Cutting Concerns

**Logging:**
- Console.log/error throughout codebase
- 39 console calls identified
- No structured logging framework

**Validation:**
- Manual validation in API handlers
- No schema validation library (Zod considered)
- Session validation repeated in each endpoint

**Authentication:**
- Cookie-based sessions with JSON payload
- CSRF protection via state parameter in OAuth
- No middleware - each endpoint checks session independently

**Security:**
- Row Level Security on all Supabase tables
- httpOnly cookies for session
- GitHub tokens encrypted in database

---

*Architecture analysis: 2026-01-12*
*Update when major patterns change*
