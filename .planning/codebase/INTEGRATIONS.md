# External Integrations

**Analysis Date:** 2026-01-12

## APIs & External Services

**AI Documentation Generation:**
- Anthropic Claude API - AI-powered documentation generation
  - SDK/Client: `@anthropic-ai/sdk` 0.71.2
  - Auth: API key in `ANTHROPIC_API_KEY` env var
  - Model: `claude-sonnet-4-20250514`
  - Max tokens: 4096 per request
  - Implementation: `src/lib/server/claude.ts`
  - Usage: `src/routes/api/docs/generate/+server.ts`

**Payment Processing:**
- Stripe - One-time payments for lifetime deals
  - SDK/Client: `stripe` 20.1.2
  - Auth: API key in `STRIPE_SECRET_KEY` env var
  - API Version: 2025-12-15.clover
  - Endpoints used: checkout sessions, webhooks
  - Implementation: `src/lib/server/stripe.ts`
  - Tiers: Lifetime Deal ($299), Pro Setup ($497), Done-For-You ($2500+)

**Email/SMS:**
- Not implemented (planned for transactional emails)

## Data Storage

**Databases:**
- PostgreSQL on Supabase - Primary data store
  - Connection: via `PUBLIC_SUPABASE_URL` env var
  - Client: `@supabase/supabase-js` 2.90.1
  - Implementation: `src/lib/server/supabase.ts`
  - Two clients: `supabase` (anon) and `supabaseAdmin` (service role)
  - Tables: `profiles`, `repositories`, `documentation`, `licenses`
  - Row Level Security (RLS) enabled on all tables

**File Storage:**
- Not implemented (documentation stored in database as text)

**Caching:**
- Not implemented

## Authentication & Identity

**Auth Provider:**
- GitHub OAuth 2.0 - Primary authentication method
  - Implementation: Custom OAuth flow via SvelteKit
  - Token storage: httpOnly cookies (7-day expiry)
  - Session management: JSON in cookie with userId
  - Login: `src/routes/auth/login/+server.ts`
  - Callback: `src/routes/auth/callback/+server.ts`
  - Logout: `src/routes/auth/logout/+server.ts`

**OAuth Integrations:**
- GitHub OAuth - Sign-in and repository access
  - Credentials: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
  - Scopes: `read:user`, `user:email`, `repo` (for repository access)
  - Token encrypted and stored in `profiles.github_token`

## Monitoring & Observability

**Error Tracking:**
- Not implemented (console.log/error only)

**Analytics:**
- Not implemented

**Logs:**
- Console logging only
- 39 `console.*()` calls throughout codebase
- Vercel logs for production

## CI/CD & Deployment

**Hosting:**
- Vercel - SvelteKit app hosting
  - Adapter: `@sveltejs/adapter-auto` (auto-detects Vercel)
  - Deployment: Automatic on main branch push
  - Environment vars: Configured in Vercel dashboard

**CI Pipeline:**
- Not fully configured
  - Build: `vite build`
  - Preview: `vite preview`
  - No GitHub Actions workflow found

## Environment Configuration

**Development:**
- Required env vars: See STACK.md for full list
- Secrets location: `.env` (gitignored)
- Mock/stub services: Stripe test mode available

**Staging:**
- Not configured (single environment)

**Production:**
- Secrets management: Vercel environment variables
- Database: Supabase production project

## Webhooks & Callbacks

**Incoming:**
- Stripe - `/api/stripe/webhook`
  - Verification: Signature validation via `stripe.webhooks.constructEvent`
  - Events handled:
    - `checkout.session.completed` - Creates license, updates plan
    - `payment_intent.succeeded` - Logs success
    - `payment_intent.payment_failed` - Logs failure
  - Implementation: `src/routes/api/stripe/webhook/+server.ts`

**Outgoing:**
- None

## GitHub API Integration

**Repository Access:**
- Implementation: `src/lib/server/github.ts`
- Functions:
  - `fetchUserRepos()` - Paginated user repository listing
  - `fetchRepoContents()` - Get folder/file listing
  - `fetchFileContent()` - Get individual file content (base64 decoded)
  - `fetchRepoTree()` - Get recursive file tree
  - `githubRepoToRepository()` - Data transformation for storage
- Rate limits: 5000 requests/hour (authenticated)
- Base URL: `https://api.github.com`

---

*Integration audit: 2026-01-12*
*Update when adding/removing external services*
