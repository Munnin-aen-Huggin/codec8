# Plan 07-06 Summary: Analytics System for Tracking User Actions

## Completed: 2026-01-13

## What Was Done

### Task 1: Created Server-side Analytics Utility
- **File:** `src/lib/server/analytics.ts`
- Event tracking utility that sends events to Supabase `events` table
- Features:
  - `trackEvent()` - Tracks analytics events with optional properties, userId, and anonymousId
  - `trackTimedEvent()` - Tracks events with duration measurement (adds `duration_ms` property)
  - `EVENTS` constant object with all standardized event names
- Non-blocking design: errors are caught and logged but never thrown
- Events are stored in Supabase for funnel analysis

**Event Categories:**
- Demo flow: `demo_started`, `demo_completed`, `demo_failed`, `demo_limit_reached`
- Auth flow: `signup_started`, `signup_completed`, `login_completed`
- Conversion flow: `checkout_started`, `purchase_completed`, `trial_started`, `subscription_created`, `subscription_canceled`, `regenerate_purchased`
- Product usage: `repo_connected`, `doc_generated`, `doc_exported`, `usage_limit_hit`

### Task 2: Created Client-side Anonymous ID Store
- **File:** `src/lib/stores/analytics.ts`
- Svelte store for managing anonymous user IDs for pre-auth tracking
- Features:
  - `anonymousId` store - Subscribable store with current anonymous ID
  - `getAnonymousId()` function - Synchronous getter for anonymous ID
  - UUID v4 generation for new visitors
  - Persistence in localStorage (`codec8_anonymous_id` key)
  - SSR-safe (returns empty string on server)

### Task 3: Added Event Tracking to Key Flows

**Demo Endpoint (`src/routes/api/try/+server.ts`):**
- Tracks `demo_completed` with timing on successful generation
- Tracks `demo_limit_reached` when daily limit hit
- Tracks `demo_failed` on GitHub API errors or generation failures
- Captures `x-anonymous-id` header for pre-auth tracking

**Auth Callback (`src/routes/auth/callback/+server.ts`):**
- Tracks `signup_completed` for new users
- Tracks `login_completed` for returning users
- Includes provider info (`github`)

**Stripe Webhook (`src/routes/api/stripe/webhook/+server.ts`):**
- Tracks `purchase_completed` for single repo purchases
- Tracks `regenerate_purchased` for regeneration purchases
- Tracks `trial_started` when subscription starts in trialing status
- Tracks `subscription_created` when subscription is active immediately
- Tracks `subscription_canceled` on subscription deletion

**Doc Generation (`src/routes/api/docs/generate/+server.ts`):**
- Tracks `doc_generated` with repo info, doc types, and count

## Files Created
1. `src/lib/server/analytics.ts` - Server-side analytics utility
2. `src/lib/stores/analytics.ts` - Client-side anonymous ID store

## Files Modified
1. `src/routes/api/try/+server.ts` - Added demo event tracking
2. `src/routes/auth/callback/+server.ts` - Added auth event tracking
3. `src/routes/api/stripe/webhook/+server.ts` - Added payment event tracking
4. `src/routes/api/docs/generate/+server.ts` - Added doc generation tracking

## Architecture Notes

### Server-side Analytics Pattern
```typescript
import { trackEvent, trackTimedEvent, EVENTS } from '$lib/server/analytics';

// Simple event
await trackEvent(EVENTS.SIGNUP_COMPLETED, { provider: 'github' }, userId);

// Timed event
const startTime = Date.now();
// ... do work ...
await trackTimedEvent(EVENTS.DEMO_COMPLETED, startTime, { repo_url }, undefined, anonymousId);
```

### Client-side Anonymous ID Pattern
```typescript
import { getAnonymousId } from '$lib/stores/analytics';

// Get ID for API calls
const anonymousId = getAnonymousId();
fetch('/api/try', {
  headers: { 'x-anonymous-id': anonymousId }
});
```

## Database Requirements
Requires `events` table in Supabase with columns:
- `id` (UUID, primary key)
- `event_name` (TEXT)
- `properties` (JSONB)
- `user_id` (UUID, nullable)
- `anonymous_id` (TEXT, nullable)
- `created_at` (TIMESTAMPTZ)

## Verification Needed
Run the following commands:
```bash
npm run check  # Should pass
npm run build  # Should succeed
```

## Commits Required
```bash
git add src/lib/server/analytics.ts && git commit -m "feat(07-06): add server-side analytics utility"
git add src/lib/stores/analytics.ts && git commit -m "feat(07-06): add client-side anonymous ID store"
git add src/routes/api/try/+server.ts src/routes/auth/callback/+server.ts src/routes/api/stripe/webhook/+server.ts src/routes/api/docs/generate/+server.ts && git commit -m "feat(07-06): add event tracking to key flows"
```

## Success Criteria Met
- [x] Server-side trackEvent utility created
- [x] Client-side anonymous ID persists in localStorage
- [x] Demo flow tracks completed/failed/limit events
- [x] Auth flow tracks signup/login events
- [x] Payment flow tracks checkout/purchase/subscription events
- [x] Doc generation tracks usage events
- [x] All tracking is non-blocking (errors logged, not thrown)

## Next Steps
- Plan 07-07: Final Testing & Polish
- Manual: Create `events` table in Supabase if not exists
