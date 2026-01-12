# Codebase Concerns

**Analysis Date:** 2026-01-12

## Tech Debt

**Large Component Files:**
- Issue: Several components exceed 300 lines
- Files: `src/lib/components/DocEditor.svelte` (428 lines), `src/routes/dashboard/[repoId]/+page.svelte` (378 lines), `src/lib/components/Header.svelte` (298 lines)
- Why: Rapid feature development without refactoring
- Impact: Hard to test, maintain, and understand
- Fix approach: Extract sub-components, separate concerns

**Repeated Session Validation Pattern:**
- Issue: Same session extraction code copy-pasted across 10+ endpoints
- Files: `src/routes/api/repos/+server.ts`, `src/routes/api/docs/generate/+server.ts`, `src/routes/api/stripe/checkout/+server.ts`, etc.
- Why: No middleware or shared utility created
- Impact: DRY violation, inconsistent error handling
- Fix approach: Create `$lib/server/session.ts` utility

**Environment Variables Inconsistency:**
- Issue: `process.env.STRIPE_PRICE_*` used instead of SvelteKit conventions
- File: `src/lib/server/stripe.ts` (lines 10-12)
- Why: Different author or later addition
- Impact: Inconsistency, won't work in edge runtime
- Fix approach: Use `$env/dynamic/private` or `$env/static/private`

## Known Bugs

**Placeholder Stripe Price IDs:**
- Symptoms: Checkout will fail with "price not found" error
- Trigger: Any checkout attempt without real Stripe price IDs configured
- File: `src/lib/server/stripe.ts` (lines 9-13)
- Workaround: Configure real Stripe price IDs in environment
- Root cause: Fallback to placeholder values like `'price_ltd_placeholder'`
- Fix: Add startup validation that throws clear error if configuration incomplete

## Security Considerations

**Weak License Key Generation:**
- Risk: License keys can be predicted or brute-forced
- Files: `src/lib/utils/license.ts`, `src/lib/server/stripe.ts` (generateLicenseKey)
- Current mitigation: Database validation of key existence
- Recommendations: Use `crypto.getRandomValues()` instead of `Math.random()`

**Session Management Using Plain JSON:**
- Risk: Session tampering if cookie isn't properly signed
- File: `src/routes/auth/callback/+server.ts` (line 149)
- Current mitigation: httpOnly cookie, server-side session validation
- Recommendations: Use signed cookies or proper session library (Lucia, Auth.js)

**Markdown Rendering Without Sanitization:**
- Risk: XSS if untrusted HTML in documentation
- Files: `src/lib/components/DocEditor.svelte`, `src/routes/dashboard/[repoId]/+page.svelte`
- Current mitigation: None (marked() used without sanitization)
- Recommendations: Enable marked sanitization or use DOMPurify

**Missing .env.example:**
- Risk: New developers may expose secrets or misconfigure
- Current: `.gitignore` shows `.env` should be ignored, but no example file
- Recommendations: Create `.env.example` with all required variables (placeholder values)

## Performance Bottlenecks

**Potential N+1 Query Pattern:**
- Problem: Doc generation checks existence with separate query per doc type
- File: `src/routes/api/docs/generate/+server.ts` (lines 101-154)
- Measurement: 4 extra queries per generation request
- Cause: Loop with individual SELECT queries
- Improvement path: Fetch all existing docs once, check in memory

**Context Size Risk:**
- Problem: Repository context can become very large
- File: `src/lib/utils/parser.ts`
- Measurement: Up to 275KB (5 key files @ 50KB + 10 route files @ 15KB)
- Cause: No adaptive limit based on token budget
- Improvement path: Track token count, reduce content if approaching limit

## Fragile Areas

**OAuth Callback Handler:**
- File: `src/routes/auth/callback/+server.ts` (177 lines)
- Why fragile: Complex flow with multiple external API calls, error paths
- Common failures: State mismatch, GitHub API errors, profile creation failures
- Safe modification: Add comprehensive tests before changing
- Test coverage: None

**Stripe Webhook Handler:**
- File: `src/routes/api/stripe/webhook/+server.ts`
- Why fragile: Handles critical payment events, partial failures possible
- Common failures: Signature validation, race conditions between plan update and license creation
- Safe modification: Add transaction handling, better error recovery
- Test coverage: None

**Repository Context Parser:**
- File: `src/lib/utils/parser.ts` (290+ lines)
- Why fragile: Complex regex patterns, multiple GitHub API calls
- Common failures: Rate limiting, malformed responses, large files
- Safe modification: Add unit tests for edge cases
- Test coverage: Minimal

## Scaling Limits

**Supabase Free Tier:**
- Current capacity: 500MB database, 1GB storage
- Limit: Estimated ~5000 users before hitting limits
- Symptoms at limit: 429 rate limits, write failures
- Scaling path: Upgrade to Supabase Pro ($25/mo)

**GitHub API Rate Limits:**
- Current capacity: 5000 requests/hour (authenticated)
- Limit: Heavy users generating many docs could hit limit
- Symptoms at limit: 403 rate limit errors from GitHub
- Scaling path: Implement caching, request batching

**Claude API Token Limits:**
- Current capacity: 4096 max_tokens per response
- Limit: Very large repos may exceed context window
- Symptoms at limit: Truncated or failed generation
- Scaling path: Adaptive context sizing, chunked generation

## Dependencies at Risk

**marked.js Security:**
- Risk: No HTML sanitization by default
- Impact: Potential XSS if rendering untrusted content
- Migration plan: Enable sanitization options or add DOMPurify

## Missing Critical Features

**Input Validation Helper:**
- Problem: Manual validation repeated in every endpoint
- Files: `src/routes/api/docs/generate/+server.ts`, `src/routes/api/repos/+server.ts`
- Current workaround: Copy-pasted validation code
- Blocks: Clean, consistent API error responses
- Implementation complexity: Low (add Zod schemas)

**Structured Logging:**
- Problem: 39 console.log/error calls with no structure
- Current workaround: Vercel logs capture stdout
- Blocks: Production debugging, log aggregation
- Implementation complexity: Low (add pino or similar)

**Error Boundary Component:**
- Problem: No client-side error boundaries
- Current workaround: Toast notifications for errors
- Blocks: Graceful degradation on component failures
- Implementation complexity: Low

## Test Coverage Gaps

**API Endpoints:**
- What's not tested: All endpoints in `src/routes/api/**/*`
- Risk: Regressions in critical business logic
- Priority: High
- Difficulty: Medium (need to mock Supabase, external APIs)

**Authentication Flow:**
- What's not tested: OAuth login, callback, session management
- Risk: Security vulnerabilities, broken auth
- Priority: High
- Difficulty: High (complex external dependencies)

**Payment Processing:**
- What's not tested: Stripe checkout, webhooks, license creation
- Risk: Payment failures, lost revenue
- Priority: Critical
- Difficulty: Medium (Stripe provides test fixtures)

**Documentation Generation:**
- What's not tested: Claude API calls, prompt building, context parsing
- Risk: Core feature could break silently
- Priority: High
- Difficulty: Medium (mock Claude API responses)

---

## Summary by Severity

**Critical (Fix Before Launch):**
1. Add .env.example with required variables
2. Fix Stripe price ID placeholders
3. Add payment flow tests

**High (Fix Soon):**
1. Replace Math.random() with crypto in license generation
2. Add input validation helper (Zod)
3. Add error boundaries and structured logging
4. Test OAuth and webhook handlers

**Medium (Improve Over Time):**
1. Refactor large components
2. Extract session validation utility
3. Add markdown sanitization
4. Implement adaptive context sizing

**Low (Nice to Have):**
1. Consistent environment variable usage
2. Full test coverage for API endpoints
3. Request caching for GitHub API

---

*Concerns audit: 2026-01-12*
*Update as issues are fixed or new ones discovered*
