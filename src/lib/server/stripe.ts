import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '$env/static/private';
import { env } from '$env/dynamic/private';

// Get addon price IDs from dynamic env (optional)
const STRIPE_PRICE_SINGLE = env.STRIPE_PRICE_SINGLE || '';
const STRIPE_PRICE_PRO = env.STRIPE_PRICE_PRO || '';
const STRIPE_PRICE_TEAM = env.STRIPE_PRICE_TEAM || '';
const STRIPE_PRICE_ADDON_UNLIMITED_REGEN = env.STRIPE_PRICE_ADDON_UNLIMITED_REGEN || '';
const STRIPE_PRICE_ADDON_EXTRA_REPOS = env.STRIPE_PRICE_ADDON_EXTRA_REPOS || '';
const STRIPE_PRICE_ADDON_EXTRA_SEATS = env.STRIPE_PRICE_ADDON_EXTRA_SEATS || '';
const STRIPE_PRICE_ADDON_AUDIT_LOGS = env.STRIPE_PRICE_ADDON_AUDIT_LOGS || '';

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-12-15.clover'
});

// Product types
export type ProductType = 'single' | 'pro' | 'team';
export type AddonType = 'unlimited_regen' | 'extra_repos' | 'extra_seats' | 'audit_logs';
type PurchaseMode = 'payment' | 'subscription';

interface ProductConfig {
  priceId: string;
  mode: PurchaseMode;
}

const PRODUCTS: Record<ProductType, ProductConfig> = {
  single: {
    priceId: STRIPE_PRICE_SINGLE || 'price_single_placeholder',
    mode: 'payment'
  },
  pro: {
    priceId: STRIPE_PRICE_PRO || 'price_pro_placeholder',
    mode: 'subscription'
  },
  team: {
    priceId: STRIPE_PRICE_TEAM || 'price_team_placeholder',
    mode: 'subscription'
  }
};

// Add-on products configuration
interface AddonConfig {
  priceId: string;
  name: string;
  price: number;
  description: string;
  perUnit: string;
  forTeam: boolean; // Whether this addon applies to team subscriptions
}

export const ADDON_PRODUCTS: Record<AddonType, AddonConfig> = {
  unlimited_regen: {
    priceId: STRIPE_PRICE_ADDON_UNLIMITED_REGEN || 'price_unlimited_regen_placeholder',
    name: 'Unlimited Regenerations',
    price: 29,
    description: 'Remove the 5-minute cooldown between regenerations',
    perUnit: '/month',
    forTeam: false
  },
  extra_repos: {
    priceId: STRIPE_PRICE_ADDON_EXTRA_REPOS || 'price_extra_repos_placeholder',
    name: 'Extra Repos',
    price: 5,
    description: '10 additional repos per month',
    perUnit: '/10 repos/month',
    forTeam: true
  },
  extra_seats: {
    priceId: STRIPE_PRICE_ADDON_EXTRA_SEATS || 'price_extra_seats_placeholder',
    name: 'Additional Seat',
    price: 49,
    description: 'Add one more team member',
    perUnit: '/seat/month',
    forTeam: true
  },
  audit_logs: {
    priceId: STRIPE_PRICE_ADDON_AUDIT_LOGS || 'price_audit_logs_placeholder',
    name: 'Audit Logs',
    price: 49,
    description: 'Compliance audit logging for your team',
    perUnit: '/month',
    forTeam: true
  }
};

// Plan limits for subscription tiers
export const PLAN_LIMITS = {
  free: { repos: 1, docsPerMonth: 3 },
  single: { repos: 1, docsPerMonth: -1 }, // 1 specific repo, unlimited regenerations with payment
  pro: { reposPerMonth: 30 },
  team: { reposPerMonth: 100, seats: 5 }
} as const;

export async function createCheckoutSession({
  userId,
  userEmail,
  product,
  repoUrl,
  successUrl,
  cancelUrl
}: {
  userId: string;
  userEmail: string;
  product: ProductType;
  repoUrl?: string; // For single repo purchase
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const config = PRODUCTS[product];

  if (!config.priceId || config.priceId.includes('placeholder')) {
    throw new Error(`Price ID not configured for product: ${product}`);
  }

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: config.mode,
    payment_method_types: ['card'],
    customer_email: userEmail,
    line_items: [{ price: config.priceId, quantity: 1 }],
    metadata: {
      userId,
      product,
      repoUrl: repoUrl || ''
    },
    success_url: successUrl,
    cancel_url: cancelUrl
  };

  const session = await stripe.checkout.sessions.create(sessionParams);
  return session.url || '';
}

export async function createRegenerateCheckout({
  userId,
  repoId,
  successUrl,
  cancelUrl
}: {
  userId: string;
  repoId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  // $19 one-time for regenerating a single-repo purchase
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        unit_amount: 1900, // $19 in cents
        product_data: { name: 'Regenerate Documentation' }
      },
      quantity: 1
    }],
    metadata: {
      userId,
      repoId,
      type: 'regenerate'
    },
    success_url: successUrl,
    cancel_url: cancelUrl
  });

  return session.url || '';
}

/**
 * Create a checkout session for add-on purchases
 */
export async function createAddonCheckout({
  userId,
  userEmail,
  addonType,
  quantity = 1,
  teamId,
  successUrl,
  cancelUrl
}: {
  userId: string;
  userEmail: string;
  addonType: AddonType;
  quantity?: number;
  teamId?: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const addon = ADDON_PRODUCTS[addonType];

  if (!addon.priceId || addon.priceId.includes('placeholder')) {
    throw new Error(`Price ID not configured for addon: ${addonType}`);
  }

  // Validate team requirement
  if (addon.forTeam && !teamId) {
    throw new Error(`Addon ${addonType} requires a team ID`);
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: userEmail,
    line_items: [{ price: addon.priceId, quantity }],
    metadata: {
      userId,
      addonType,
      teamId: teamId || '',
      quantity: quantity.toString()
    },
    success_url: successUrl,
    cancel_url: cancelUrl
  });

  return session.url || '';
}

/**
 * Cancel an add-on subscription
 */
export async function cancelAddonSubscription(subscriptionId: string): Promise<void> {
  await stripe.subscriptions.cancel(subscriptionId);
}

// Keep existing utilities
export function constructWebhookEvent(
  payload: string,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

/**
 * Generate a license key for paid users
 */
export function generateLicenseKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = 4;
  const segmentLength = 4;

  const parts: string[] = [];
  for (let i = 0; i < segments; i++) {
    let segment = '';
    for (let j = 0; j < segmentLength; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    parts.push(segment);
  }

  return parts.join('-');
}

// Price display info (updated for value-based pricing)
export const PRICE_DETAILS = {
  single: {
    name: 'Single Repo',
    price: 99,
    type: 'one-time',
    description: 'Full documentation suite for one repository',
    features: [
      'All 4 documentation types',
      'Private repo support',
      'Export & create PRs',
      'Keep forever',
      'Regenerate: $19'
    ]
  },
  pro: {
    name: 'Pro',
    price: 149,
    type: 'monthly',
    description: '30 repos per month with all features',
    features: [
      '30 repos per month',
      'All 4 documentation types',
      'Private repo support',
      'Auto-sync on push',
      'Priority support',
      'Cancel anytime'
    ]
  },
  team: {
    name: 'Team',
    price: 399,
    type: 'monthly',
    description: '100 repos per month with team features',
    features: [
      '100 repos per month',
      '5 team members',
      'Everything in Pro',
      'Custom templates',
      'Slack integration',
      'Cancel anytime'
    ]
  }
} as const;

// Add-on price display info
export const ADDON_PRICE_DETAILS = {
  unlimited_regen: {
    name: 'Unlimited Regenerations',
    price: 29,
    type: 'monthly',
    description: 'Remove cooldown limits',
    features: [
      'No 5-minute cooldown',
      'Regenerate anytime',
      'Instant updates'
    ]
  },
  extra_repos: {
    name: 'Extra Repos',
    price: 5,
    type: 'monthly',
    description: '+10 repos per month',
    features: [
      '10 additional repos',
      'Stackable (buy multiple)',
      'Same features as plan'
    ]
  },
  extra_seats: {
    name: 'Additional Seat',
    price: 49,
    type: 'monthly',
    description: '+1 team member',
    features: [
      'Add one team member',
      'Full access',
      'Stackable'
    ]
  },
  audit_logs: {
    name: 'Audit Logs',
    price: 49,
    type: 'monthly',
    description: 'Compliance logging',
    features: [
      'Complete audit trail',
      'Export reports',
      'Team activity tracking'
    ]
  }
} as const;
