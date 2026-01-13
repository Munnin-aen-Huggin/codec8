import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '$env/static/private';
import {
  STRIPE_PRICE_SINGLE,
  STRIPE_PRICE_PRO,
  STRIPE_PRICE_TEAM
} from '$env/static/private';

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-12-15.clover'
});

// Product types
export type ProductType = 'single' | 'pro' | 'team';
type PurchaseMode = 'payment' | 'subscription';

interface ProductConfig {
  priceId: string;
  mode: PurchaseMode;
  trialDays?: number;
}

const PRODUCTS: Record<ProductType, ProductConfig> = {
  single: {
    priceId: STRIPE_PRICE_SINGLE || 'price_single_placeholder',
    mode: 'payment'
  },
  pro: {
    priceId: STRIPE_PRICE_PRO || 'price_pro_placeholder',
    mode: 'subscription',
    trialDays: 7
  },
  team: {
    priceId: STRIPE_PRICE_TEAM || 'price_team_placeholder',
    mode: 'subscription',
    trialDays: 7
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

  // Add trial for subscriptions
  if (config.mode === 'subscription' && config.trialDays) {
    sessionParams.subscription_data = {
      trial_period_days: config.trialDays
    };
  }

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
  // $9 one-time for regenerating a single-repo purchase
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        unit_amount: 900, // $9 in cents
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

// Price display info (updated for new model)
export const PRICE_DETAILS = {
  single: {
    name: 'Single Repo',
    price: 39,
    type: 'one-time',
    description: 'Full documentation suite for one repository',
    features: [
      'All 4 documentation types',
      'Private repo support',
      'Export & create PRs',
      'Keep forever',
      'Regenerate: $9'
    ]
  },
  pro: {
    name: 'Pro',
    price: 99,
    type: 'monthly',
    description: '30 repos per month with all features',
    features: [
      '30 repos per month',
      'All 4 documentation types',
      'Private repo support',
      'Auto-sync on push',
      'Priority support',
      '7-day free trial'
    ]
  },
  team: {
    name: 'Team',
    price: 249,
    type: 'monthly',
    description: '100 repos per month with team features',
    features: [
      '100 repos per month',
      '5 team members',
      'Everything in Pro',
      'Custom templates',
      'Slack integration',
      '7-day free trial'
    ]
  }
} as const;
