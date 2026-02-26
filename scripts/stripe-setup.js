#!/usr/bin/env node

/**
 * Stripe Product & Price Setup Script
 *
 * Creates all Codec8 products and prices in your Stripe account,
 * then prints the STRIPE_PRICE_* env vars to copy into .env.
 *
 * Usage:
 *   node scripts/stripe-setup.js
 *
 * Requires STRIPE_SECRET_KEY in .env (works with both test and live keys).
 */

import Stripe from 'stripe';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse .env manually (no dotenv dependency needed)
const envPath = resolve(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIndex = trimmed.indexOf('=');
  if (eqIndex === -1) continue;
  const key = trimmed.slice(0, eqIndex).trim();
  const value = trimmed.slice(eqIndex + 1).trim();
  if (!process.env[key]) process.env[key] = value;
}

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  console.error('Error: STRIPE_SECRET_KEY not found in .env');
  process.exit(1);
}

const isLive = secretKey.startsWith('sk_live_');
console.log(`\nUsing ${isLive ? 'LIVE' : 'TEST'} mode Stripe key\n`);

const stripe = new Stripe(secretKey);

const PRODUCTS = [
  {
    envVar: 'STRIPE_PRICE_SINGLE',
    name: 'Codec8 Single Repo',
    description: 'Full documentation suite for one repository',
    price: 9900, // $99.00 in cents
    type: 'one_time',
  },
  {
    envVar: 'STRIPE_PRICE_PRO',
    name: 'Codec8 Pro',
    description: '30 repos per month with all features',
    price: 14900, // $149.00/mo
    type: 'recurring',
    interval: 'month',
  },
  {
    envVar: 'STRIPE_PRICE_TEAM',
    name: 'Codec8 Team',
    description: '100 repos per month with team features',
    price: 39900, // $399.00/mo
    type: 'recurring',
    interval: 'month',
  },
  {
    envVar: 'STRIPE_PRICE_ENTERPRISE',
    name: 'Codec8 Enterprise',
    description: 'Unlimited usage with enterprise features',
    price: 99900, // $999.00/mo
    type: 'recurring',
    interval: 'month',
  },
  {
    envVar: 'STRIPE_PRICE_UNLIMITED_REGEN',
    name: 'Unlimited Regenerations',
    description: 'Remove the 5-minute cooldown between regenerations',
    price: 2900, // $29.00/mo
    type: 'recurring',
    interval: 'month',
  },
  {
    envVar: 'STRIPE_PRICE_EXTRA_REPOS',
    name: 'Extra Repos (10 pack)',
    description: '10 additional repos per month',
    price: 500, // $5.00/mo
    type: 'recurring',
    interval: 'month',
  },
  {
    envVar: 'STRIPE_PRICE_EXTRA_SEAT',
    name: 'Additional Seat',
    description: 'Add one more team member',
    price: 4900, // $49.00/mo
    type: 'recurring',
    interval: 'month',
  },
  {
    envVar: 'STRIPE_PRICE_AUDIT_LOGS',
    name: 'Audit Logs',
    description: 'Compliance audit logging for your team',
    price: 4900, // $49.00/mo
    type: 'recurring',
    interval: 'month',
  },
  {
    envVar: 'STRIPE_PRICE_SSO',
    name: 'SSO/SAML',
    description: 'Single sign-on with Okta, Azure AD, Google Workspace',
    price: 9900, // $99.00/mo
    type: 'recurring',
    interval: 'month',
  },
];

async function main() {
  const envLines = [];

  for (const item of PRODUCTS) {
    process.stdout.write(`Creating ${item.name}...`);

    const product = await stripe.products.create({
      name: item.name,
      description: item.description,
    });

    const priceParams = {
      product: product.id,
      currency: 'usd',
      unit_amount: item.price,
    };

    if (item.type === 'recurring') {
      priceParams.recurring = { interval: item.interval };
    }

    const price = await stripe.prices.create(priceParams);

    envLines.push(`${item.envVar}=${price.id}`);
    console.log(` done (${price.id})`);
  }

  console.log('\n========================================');
  console.log('Copy these lines into your .env file:');
  console.log('========================================\n');
  for (const line of envLines) {
    console.log(line);
  }

  if (!isLive) {
    console.log('\n⚠  These are TEST mode prices.');
    console.log('   For real payments, re-run with a live secret key (sk_live_...).');
    console.log('   Get your live key from: Stripe Dashboard → Developers → API Keys');
  }

  console.log('\nDone! Products are visible in your Stripe Dashboard → Product Catalog.\n');
}

main().catch((err) => {
  console.error('\nStripe API error:', err.message);
  process.exit(1);
});
