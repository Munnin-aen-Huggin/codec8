# Coding Conventions

**Analysis Date:** 2026-01-12

## Naming Patterns

**Files:**
- PascalCase.svelte: All Svelte components (`RepoCard.svelte`, `DocEditor.svelte`)
- camelCase.ts: TypeScript modules (`parser.ts`, `claude.ts`, `auth.ts`)
- +page.svelte, +server.ts: SvelteKit route conventions
- *.test.ts: Unit tests (`toast.test.ts`, `license.test.ts`)
- *.spec.ts: Component/E2E tests (`page.svelte.spec.ts`)

**Functions:**
- camelCase for all functions
- Verb-first naming: `fetch*`, `generate*`, `create*`, `build*`
- Async functions: No special prefix
- Examples from codebase:
  - `fetchUserRepos()` - `src/lib/server/github.ts`
  - `generateDocumentation()` - `src/lib/server/claude.ts`
  - `buildReadmePrompt()` - `src/lib/utils/prompts.ts`
  - `canConnectMoreRepos()` - `src/lib/utils/license.ts`

**Variables:**
- camelCase for variables: `editContent`, `renderedContent`, `isEditing`
- Boolean prefix: `is*`, `has*`, `can*` (`isAuthenticated`, `isPaid`, `hasToasts`)
- Constants: UPPER_SNAKE_CASE (`MAX_TOKENS`, `MODEL`)

**Types:**
- PascalCase interfaces: `User`, `Repository`, `Documentation`, `License`
- No I prefix for interfaces (use `User` not `IUser`)
- Type aliases: PascalCase (`DocType`, `PriceTier`)

## Code Style

**Formatting:**
- Prettier with `.prettierrc` configuration
- **Tabs for indentation** (useTabs: true)
- **Single quotes** for strings (singleQuote: true)
- **No trailing commas** (trailingComma: none)
- Print width: 100 characters
- Plugin: `prettier-plugin-svelte` for Svelte files

**Linting:**
- ESLint 9.x with flat config (`eslint.config.js`)
- Extends: JavaScript recommended, TypeScript recommended, Svelte recommended, Prettier
- Disables `no-undef` rule for TypeScript projects
- Global variables for browser and Node environments
- Run: `npm run lint`

## Import Organization

**Order:**
1. SvelteKit imports (`@sveltejs/kit`, `$app/navigation`)
2. Environment imports (`$env/static/private`, `$env/static/public`)
3. External packages (`stripe`, `marked`, `@anthropic-ai/sdk`)
4. Internal modules (`$lib/server/*`, `$lib/utils/*`, `$lib/stores/*`)
5. Type imports (`type { RequestHandler }`)

**Grouping:**
- Blank lines between logical groups
- Type imports often at end of import block

**Path Aliases:**
- `$lib/` maps to `src/lib/`
- `$app/` for SvelteKit app modules
- `$env/` for environment variables

## Error Handling

**Patterns:**
- API handlers: try/catch wrapping entire handler
- Services: Throw Error with descriptive message
- SvelteKit: Use `error()` helper for HTTP errors
- User-facing: Toast notifications via store

**Error Types:**
- Throw on: Invalid session, missing data, API failures
- Return error object: For partial failures in batch operations
- Log: `console.error()` with context before throwing

**Example Pattern:**
```typescript
try {
  const result = await serviceCall();
  return json(result);
} catch (err) {
  console.error('Operation failed:', err);
  throw error(500, err instanceof Error ? err.message : 'Unknown error');
}
```

## Logging

**Framework:**
- Console.log/error (no structured logging)
- 39 console calls throughout codebase

**Patterns:**
- `console.log()` for debug/info messages
- `console.error()` for error logging with context
- Pattern: `console.error('Context:', error)`

**Where:**
- API endpoints: Log errors before throwing
- Service calls: Log at entry/exit for debugging
- No production-specific log levels

## Comments

**When to Comment:**
- Complex business logic requiring explanation
- Non-obvious code decisions
- JSDoc for public utility functions

**JSDoc/TSDoc:**
- Used for utility functions in `src/lib/utils/`
- Format: `/** Description */` above function
- Examples:
  ```typescript
  /** Generate a license key in format XXXX-XXXX-XXXX-XXXX */
  export function generateLicenseKey(): string { ... }
  ```

**TODO Comments:**
- Format: `// TODO: description`
- No assigned owner or issue tracking

## Function Design

**Size:**
- Utility functions: Keep focused (typically <50 lines)
- Large components exist: `DocEditor.svelte` (428 lines), `Header.svelte` (298 lines)

**Parameters:**
- Typed parameters with interfaces
- Destructure objects where appropriate
- Example: `async function fetchRepoContext(token: string, fullName: string, ...)`

**Return Values:**
- Explicit return types on exported functions
- Promise<T> for async functions
- Use interfaces for complex return types

## Module Design

**Exports:**
- Named exports preferred for functions and types
- Default exports: Only for Svelte components (SvelteKit convention)
- Barrel exports: `src/lib/index.ts` for public API

**Barrel Files:**
- `src/lib/index.ts` exists (mostly empty)
- Components imported directly from file paths

**Pattern: Store Factory**
```typescript
function createStoreName() {
  const { subscribe, set, update } = writable<StateType>(initialState);
  return {
    subscribe,
    methodName: (param) => update(s => ({ ...s, changes })),
  };
}
export const storeName = createStoreName();
```

**Pattern: Server Endpoint**
```typescript
export const GET: RequestHandler = async ({ params, cookies }) => {
  // 1. Extract session
  // 2. Validate permissions
  // 3. Fetch data
  // 4. Return json() or throw error()
};
```

**Pattern: Svelte Component**
```svelte
<script lang="ts">
  import { ... } from '...';

  export let propName: Type;

  let localState = initialValue;

  $: derivedValue = compute(propName);

  function handleEvent() { ... }
</script>

<div class="tailwind-classes">
  {#if condition}
    <Component on:event={handleEvent} />
  {/if}
</div>
```

---

*Convention analysis: 2026-01-12*
*Update when patterns change*
