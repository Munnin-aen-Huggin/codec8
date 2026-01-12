# Testing Patterns

**Analysis Date:** 2026-01-12

## Test Framework

**Runner:**
- Vitest 4.0.15
- Config: `vite.config.ts` (Vitest configuration embedded)
- Two test projects: client (browser) and server (Node)

**Assertion Library:**
- Vitest built-in expect
- Matchers: toBe, toEqual, toThrow, toMatchObject, toHaveLength

**Run Commands:**
```bash
npm test                              # Run all tests (unit + e2e)
npm run test:unit                     # Run Vitest only
npm run test:e2e                      # Run Playwright tests
npm test -- --watch                   # Watch mode
npm test -- path/to/file.test.ts      # Single file
```

## Test File Organization

**Location:**
- Unit tests: Co-located with source (`src/**/*.test.ts`)
- Component tests: Co-located (`src/**/*.svelte.spec.ts`)
- E2E tests: Separate directory (`e2e/*.test.ts`)

**Naming:**
- Unit tests: `*.test.ts` (`toast.test.ts`, `license.test.ts`)
- Component tests: `*.svelte.spec.ts` or `*.spec.ts` (`page.svelte.spec.ts`)
- E2E tests: `*.test.ts` (`demo.test.ts`)

**Structure:**
```
src/
  lib/
    stores/
      toast.ts
      toast.test.ts           # Co-located unit test
    utils/
      license.ts
      license.test.ts         # Co-located unit test
  routes/
    +page.svelte
    page.svelte.spec.ts       # Co-located component test
    demo.spec.ts              # Additional spec
e2e/
  demo.test.ts                # E2E test
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';

describe('ModuleName', () => {
  beforeEach(() => {
    // Reset state
    vi.useFakeTimers();
  });

  it('should handle expected case', () => {
    // arrange
    const input = createTestInput();

    // act
    const result = functionUnderTest(input);

    // assert
    expect(result).toEqual(expectedOutput);
  });

  it('should handle error case', () => {
    expect(() => functionUnderTest(null)).toThrow('error message');
  });
});
```

**Patterns:**
- `beforeEach` for per-test setup
- `vi.useFakeTimers()` for time-dependent tests
- `get()` from svelte/store to read store values
- Arrange/act/assert structure (implicit)

## Mocking

**Framework:**
- Vitest built-in mocking (`vi`)
- Module mocking via `vi.mock()` at top of test file

**Patterns:**
```typescript
import { vi } from 'vitest';

// Mock timers
vi.useFakeTimers();
vi.advanceTimersByTime(5000);

// Mock functions
const mockFn = vi.fn();
mockFn.mockReturnValue('mocked result');
```

**What to Mock:**
- Timers (setTimeout, setInterval)
- External API calls (if testing in isolation)
- Supabase client calls (not currently mocked)

**What NOT to Mock:**
- Pure utility functions
- Svelte store operations (test actual behavior)

## Fixtures and Factories

**Test Data:**
```typescript
// Inline test data for simple cases
it('should generate unique keys', () => {
  const keys = new Set<string>();
  for (let i = 0; i < 100; i++) {
    keys.add(generateLicenseKey());
  }
  expect(keys.size).toBe(100);
});
```

**Location:**
- Factory functions: Inline in test file (no shared fixtures)
- No dedicated fixtures directory

## Coverage

**Requirements:**
- No enforced coverage target
- Coverage tracked for awareness only

**Configuration:**
- Vitest coverage available but not configured
- Exclusions: Not specified

**View Coverage:**
```bash
npm run test:unit -- --coverage
```

## Test Types

**Unit Tests:**
- Scope: Single function/module in isolation
- Location: `src/**/*.test.ts`
- Mocking: Timers, external dependencies
- Speed: Fast (<100ms per test)
- Examples:
  - `src/lib/stores/toast.test.ts` - Tests toast store operations
  - `src/lib/utils/license.test.ts` - Tests license key generation

**Component Tests:**
- Framework: Vitest with browser mode + Playwright
- Scope: Svelte component rendering
- Location: `src/**/*.svelte.spec.ts`
- Examples:
  - `src/routes/page.svelte.spec.ts` - Tests landing page rendering

**E2E Tests:**
- Framework: Playwright 1.57.0
- Config: `playwright.config.ts`
- Scope: Full user flows in browser
- Location: `e2e/`
- Webserver: Built app via `npm run build && npm run preview`
- Example: `e2e/demo.test.ts`

## Common Patterns

**Async Testing:**
```typescript
it('should handle async operation', async () => {
  const result = await asyncFunction();
  expect(result).toBe('expected');
});
```

**Error Testing:**
```typescript
it('should throw on invalid input', () => {
  expect(() => parse(null)).toThrow('Cannot parse null');
});

// Async error
it('should reject on failure', async () => {
  await expect(asyncCall()).rejects.toThrow('error message');
});
```

**Store Testing:**
```typescript
import { get } from 'svelte/store';

it('should update store state', () => {
  store.someAction(param);
  const state = get(store);
  expect(state.field).toBe('newValue');
});
```

**Timer Testing:**
```typescript
it('should auto-dismiss after delay', () => {
  vi.useFakeTimers();

  toast.add('info', 'message', 5000);
  expect(get(toast)).toHaveLength(1);

  vi.advanceTimersByTime(5000);
  expect(get(toast)).toHaveLength(0);
});
```

**Component Testing (Browser):**
```typescript
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import Component from './Component.svelte';

it('should render heading', async () => {
  render(Component);
  const heading = page.getByRole('heading', { level: 1 });
  await expect.element(heading).toBeInTheDocument();
});
```

**Snapshot Testing:**
- Not used in this codebase
- Prefer explicit assertions

## Vitest Configuration

**Client Project (Browser tests):**
```typescript
{
  name: 'client',
  browser: {
    enabled: true,
    provider: playwright(),
    instances: [{ browser: 'chromium', headless: true }]
  },
  include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
  exclude: ['src/lib/server/**']
}
```

**Server Project (Node environment):**
```typescript
{
  name: 'server',
  environment: 'node',
  include: ['src/**/*.{test,spec}.{js,ts}'],
  exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
}
```

## Test Coverage Gaps

**Not Tested:**
- API endpoints (`src/routes/api/**/*`)
- Authentication flow (`src/routes/auth/**/*`)
- GitHub API integration (`src/lib/server/github.ts`)
- Claude API integration (`src/lib/server/claude.ts`)
- Stripe payment flow (`src/lib/server/stripe.ts`)
- Error scenarios and edge cases

**Priority Gaps:**
- Payment webhook handling (critical business logic)
- OAuth callback (security-critical)
- Documentation generation (core feature)

---

*Testing analysis: 2026-01-12*
*Update when test patterns change*
