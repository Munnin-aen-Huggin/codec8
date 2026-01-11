import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '$env/static/private';

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-12-15.clover'
});

// Product/Price IDs - set these in Stripe Dashboard
export const PRICES = {
  ltd: process.env.STRIPE_PRICE_LTD || 'price_ltd_placeholder',
  pro: process.env.STRIPE_PRICE_PRO || 'price_pro_placeholder',
  dfy: process.env.STRIPE_PRICE_DFY || 'price_dfy_placeholder'
} as const;

export type PriceTier = keyof typeof PRICES;

// Plan limits
export const PLAN_LIMITS = {
  free: { repos: 1, docs_per_month: 3 },
  ltd: { repos: -1, docs_per_month: -1 }, // -1 = unlimited
  pro: { repos: -1, docs_per_month: -1 },
  dfy: { repos: -1, docs_per_month: -1 }
} as const;

/**
 * Create a Stripe Checkout session for a one-time payment
 */
export async function createCheckoutSession({
  userId,
  userEmail,
  tier,
  successUrl,
  cancelUrl
}: {
  userId: string;
  userEmail: string;
  tier: PriceTier;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  const priceId = PRICES[tier];

  if (!priceId || priceId.includes('placeholder')) {
    throw new Error(`Price ID not configured for tier: ${tier}`);
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: userEmail,
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    metadata: {
      userId,
      tier
    },
    success_url: successUrl,
    cancel_url: cancelUrl
  });

  return session;
}

/**
 * Verify a Stripe webhook signature
 */
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

/**
 * Get price details for display
 */
export const PRICE_DETAILS = {
  ltd: {
    name: 'Lifetime Deal',
    price: 299,
    originalPrice: 499,
    description: 'Pay once, use forever. All future updates included.',
    features: [
      'Unlimited repositories',
      'All documentation types',
      'Architecture diagrams',
      'Export to Markdown & PR',
      'Auto-sync on push',
      'Private repo support',
      'Priority email support',
      'All future features'
    ]
  },
  pro: {
    name: 'Pro Setup',
    price: 497,
    originalPrice: 697,
    description: 'Lifetime Deal + 30-min onboarding call',
    features: [
      'Everything in Lifetime Deal',
      '30-minute onboarding call',
      'Personalized setup assistance',
      'Best practices walkthrough',
      'Priority support'
    ]
  },
  dfy: {
    name: 'Done-For-You',
    price: 2500,
    originalPrice: null,
    description: 'We document everything for you',
    features: [
      'Everything in Pro Setup',
      'Full documentation service',
      'Custom documentation style',
      'Multiple revision rounds',
      'Dedicated support'
    ]
  }
} as const;
