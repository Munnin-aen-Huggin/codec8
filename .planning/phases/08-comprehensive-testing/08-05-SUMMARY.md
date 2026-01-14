---
phase: 08-comprehensive-testing
plan: 05
subsystem: testing
tags: [playwright, e2e-tests, landing-page, demo-page]

# Dependency graph
requires:
  - phase: 07-saas-transformation
    provides: Landing page, demo page UI
  - phase: 08-04
    provides: Complete unit test coverage
provides:
  - E2E test coverage for landing page (22 tests)
  - E2E test coverage for demo page (18 tests)
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Playwright page.locator() for element selection
    - CSS class selectors for component targeting
    - test.describe() for test organization
    - URL parameter testing

key-files:
  created:
    - e2e/landing.test.ts
    - e2e/try.test.ts
  modified: []

key-decisions:
  - "Used CSS class selectors to match component structure"
  - "Organized tests by page section (hero, pricing, FAQ, etc.)"
  - "Avoided testing actual API calls - focused on UI interactions"
  - "Used URL params to test form pre-population"

patterns-established:
  - "Page section test grouping with describe()"
  - "Form validation E2E testing pattern"
  - "Loading state testing without actual API calls"

issues-created: []

# Metrics
duration: 8min
completed: 2026-01-14
status: checkpoint-pending
---

# Phase 8 Plan 05: E2E Tests for Critical Flows Summary

**40 new E2E tests for landing and demo pages**

## Performance

- **Duration:** 8 min
- **Started:** 2026-01-14T03:15:00Z
- **Completed:** 2026-01-14T03:23:00Z (tests written, verification pending)
- **Tasks:** 2 complete, 1 checkpoint pending
- **Files created:** 2

## Accomplishments
- 22 E2E tests for landing page
- 18 E2E tests for demo page
- Total new E2E tests: 40 (exceeds target of 18+)
- Test files committed and ready for execution

## Task Commits

Each task was committed atomically:

1. **Task 1: Landing Page E2E Tests** - `396b5e8` (test)
2. **Task 2: Demo Page E2E Tests** - `e3dffde` (test)

**Task 3: Human Verification** - Checkpoint pending

## Files Created/Modified
- `e2e/landing.test.ts` - 22 tests for landing page
- `e2e/try.test.ts` - 18 tests for demo page

## Test Coverage Details

### landing.test.ts (22 tests)

**Page Load (3 tests)**
- Landing page loads successfully
- Has visible h1 heading with "60 seconds"
- Navigation links are present

**Hero Section (5 tests)**
- Trust badge is visible
- Demo form input is visible
- Generate button is visible and clickable
- Demo details show usage info
- Doc type badges displayed

**Pricing Section (8 tests)**
- Pricing section exists
- All 4 pricing tiers displayed
- Free Demo tier with $0
- Single Repo tier with $39
- Pro tier with $99/mo
- Team tier with $249/mo
- Pro tier has POPULAR badge
- Each tier has CTA button

**FAQ Section (4 tests)**
- FAQ section is present
- FAQ accordion items present (6)
- Clicking expands answer
- Clicking again collapses

**Navigation (4 tests)**
- Header contains logo
- Sign in link visible
- Pricing link has #pricing href
- Try Demo button visible in nav

**Footer (2 tests)**
- Privacy and terms links
- Contact link present

**Form Validation (2 tests)**
- Empty URL shows error
- Invalid URL shows error

### try.test.ts (18 tests)

**Page Load (3 tests)**
- Demo page loads at /try route
- Has main heading
- Has description text

**Form Elements (4 tests)**
- Has form for repo URL input
- Input has correct placeholder
- Submit button is present
- Submit button disabled when empty

**Form Interaction (3 tests)**
- Can type in repo URL input
- Valid URL enables submit button
- URL param pre-populates input

**UI Elements (5 tests)**
- Header with logo visible
- Sign in link in header
- Footer has homepage link
- Empty state placeholder
- Empty state example URL

**Navigation (2 tests)**
- Logo links to homepage
- Can navigate from footer

**Loading State (2 tests)**
- Submit shows loading indicator
- Input disabled during loading

## Checkpoint: Verification Pending

**Build Environment Issue:**
E2E tests could not be executed due to missing environment variables:
- `STRIPE_PRICE_SINGLE` not set
- `STRIPE_PRICE_PRO` not set
- `STRIPE_PRICE_TEAM` not set

The `.env.example` file has outdated variable names from the old pricing model. This is a pre-existing configuration sync issue, not a problem with the tests.

**To run E2E tests:**
1. Ensure `.env` file exists with all required variables
2. Update `.env.example` with new Stripe price variable names
3. Run: `npm run test:e2e`

## Decisions Made
- Used CSS class selectors from actual component code
- Organized tests by page section for maintainability
- Avoided API calls in tests - focused on UI interactions only
- Tested loading states without waiting for actual generation

## Deviations from Plan

- Tests written successfully but verification blocked by build environment
- Environment variables need to be configured to run E2E tests

## Issues Encountered

- Build fails due to missing STRIPE_PRICE_* environment variables
- This is a pre-existing config sync issue from Phase 7 hybrid pricing migration

## Next Steps

1. User needs to configure `.env` with required Stripe price IDs
2. Run `npm run test:e2e` to verify tests pass
3. If tests pass, type "approved" to complete the plan

---
*Phase: 08-comprehensive-testing*
*Status: Checkpoint pending user verification*
