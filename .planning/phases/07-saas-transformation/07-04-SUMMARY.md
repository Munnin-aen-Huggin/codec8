# Plan 07-04 Summary: Restructure Stripe for Hybrid Pricing

**Completed:** 2026-01-13
**Duration:** ~20 minutes

## What Was Built

### 1. Stripe Module (`src/lib/server/stripe.ts`)

Completely restructured the Stripe module to support hybrid pricing with both one-time payments and subscriptions.

**Changes:**
- Replaced LTD/Pro/DFY pricing with new product types: `single`, `pro`, `team`
- New environment variables: `STRIPE_PRICE_SINGLE`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_TEAM`
- `ProductType` export: `'single' | 'pro' | 'team'`
- `PRODUCTS` config with `priceId`, `mode` ('payment' | 'subscription'), and `trialDays`
- Updated `PLAN_LIMITS`:
  - `free`: 1 repo, 3 docs/month
  - `single`: 1 specific repo, unlimited regenerations (with payment)
  - `pro`: 30 repos/month
  - `team`: 100 repos/month, 5 seats
- `createCheckoutSession()`: Handles both one-time and subscription modes, adds 7-day trial for subscriptions
- `createRegenerateCheckout()`: Creates $9 one-time payment for regenerating single-repo docs
- Updated `PRICE_DETAILS` for new pricing display

**New Pricing Model:**
| Product | Price | Type | Trial |
|---------|-------|------|-------|
| Single Repo | $39 | One-time | - |
| Pro | $99/mo | Subscription | 7 days |
| Team | $249/mo | Subscription | 7 days |
| Regenerate | $9 | One-time | - |

### 2. Webhook Handler (`src/routes/api/stripe/webhook/+server.ts`)

Updated to handle all hybrid pricing events.

**Changes:**
- Added `extractRepoName()` helper function
- `checkout.session.completed` now handles:
  - Regeneration purchases (`type: 'regenerate'`)
  - Single repo one-time purchases (`product: 'single'`)
  - Subscription starts (`product: 'pro'` or `'team'`)
- Added `customer.subscription.updated` handler:
  - Updates subscription status
  - Resets monthly usage on new billing period
- Added `customer.subscription.deleted` handler:
  - Sets `subscription_status: 'canceled'`
  - Records `subscription_ends_at` timestamp

### 3. Checkout Endpoint (`src/routes/api/stripe/checkout/+server.ts`)

Updated to accept new product types and handle regeneration.

**Changes:**
- Accepts `{ product, repoUrl, repoId, type }` in request body
- Handles `type: 'regenerate'` with `createRegenerateCheckout()`
- Validates product type is `'single'`, `'pro'`, or `'team'`
- Requires `repoUrl` for `'single'` product
- Uses new `createCheckoutSession()` signature

## Files Changed

| File | Change |
|------|--------|
| `src/lib/server/stripe.ts` | Complete rewrite for hybrid pricing |
| `src/routes/api/stripe/webhook/+server.ts` | Added subscription event handlers |
| `src/routes/api/stripe/checkout/+server.ts` | Updated for new product types |

## Integration Points

- `purchased_repos` table: For single repo purchases (needs to exist in database)
- `profiles` table: New columns needed for subscriptions:
  - `stripe_customer_id`
  - `stripe_subscription_id`
  - `subscription_status`
  - `subscription_tier`
  - `trial_ends_at`
  - `repos_used_this_month`
  - `repos_reset_at`
  - `subscription_ends_at`

## Removed

- Old LTD/Pro/DFY pricing references from Stripe module
- `PRICES` constant with `ltd`, `pro`, `dfy` price IDs
- `PriceTier` type export (replaced with `ProductType`)

## Testing Notes

To test the Stripe integration:

1. Set up Stripe products and prices for the new model
2. Configure environment variables:
   - `STRIPE_PRICE_SINGLE`: Price ID for $39 one-time
   - `STRIPE_PRICE_PRO`: Price ID for $99/mo subscription
   - `STRIPE_PRICE_TEAM`: Price ID for $249/mo subscription
3. Use Stripe CLI to test webhooks:
   ```bash
   stripe listen --forward-to localhost:5173/api/stripe/webhook
   stripe trigger checkout.session.completed
   stripe trigger customer.subscription.updated
   stripe trigger customer.subscription.deleted
   ```
4. Test checkout flows:
   - Single repo: `POST /api/stripe/checkout` with `{ product: 'single', repoUrl: '...' }`
   - Pro subscription: `POST /api/stripe/checkout` with `{ product: 'pro' }`
   - Team subscription: `POST /api/stripe/checkout` with `{ product: 'team' }`
   - Regeneration: `POST /api/stripe/checkout` with `{ type: 'regenerate', repoId: '...' }`

## Next Steps

The user needs to run the following commands:

```bash
npm run check   # TypeScript/Svelte check
npm run build   # Production build
```

Then commit the changes:

```bash
git add src/lib/server/stripe.ts && git commit -m "feat(07-04): restructure Stripe for hybrid pricing"
git add src/routes/api/stripe/webhook/+server.ts && git commit -m "feat(07-04): update webhook for subscriptions"
git add src/routes/api/stripe/checkout/+server.ts && git commit -m "feat(07-04): update checkout endpoint for new products"
```

## Database Migration Required

Before testing, ensure the following database changes are applied (from Plan 07-01):
- `purchased_repos` table exists
- `profiles` table has subscription-related columns

## Note on Legacy Pricing

Other files still reference old LTD/DFY pricing (types.ts, license.ts, landing page, etc.). These will be updated in subsequent plans:
- Plan 07-05: Landing Page Update
- Plan 07-06: Environment Variables Update (manual)
- Plan 07-07: Final Testing & Polish
