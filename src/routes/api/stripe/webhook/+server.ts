import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { constructWebhookEvent, generateLicenseKey } from '$lib/server/stripe';
import { supabaseAdmin } from '$lib/server/supabase';
import { trackCheckoutCompleted } from '$lib/utils/analytics';
import { STRIPE_WEBHOOK_SECRET } from '$env/static/private';
import type Stripe from 'stripe';

export const POST: RequestHandler = async ({ request }) => {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    throw error(400, 'Missing Stripe signature');
  }

  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(payload, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    throw error(400, 'Invalid signature');
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutComplete(session);
      break;
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('Payment succeeded:', paymentIntent.id);
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('Payment failed:', paymentIntent.id, paymentIntent.last_payment_error?.message);
      break;
    }

    default:
      console.log('Unhandled event type:', event.type);
  }

  return json({ received: true });
};

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const { userId, tier } = session.metadata || {};

  if (!userId || !tier) {
    console.error('Missing metadata in checkout session:', session.id);
    return;
  }

  console.log(`Processing payment for user ${userId}, tier: ${tier}`);

  // Generate license key
  const licenseKey = generateLicenseKey();

  try {
    // Start a transaction-like operation
    // 1. Update user's plan
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        plan: tier
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Failed to update user plan:', updateError);
      throw updateError;
    }

    // 2. Create license record
    const { error: licenseError } = await supabaseAdmin
      .from('licenses')
      .insert({
        user_id: userId,
        license_key: licenseKey,
        tier: tier,
        stripe_payment_id: session.payment_intent as string,
        activated_at: new Date().toISOString()
      });

    if (licenseError) {
      console.error('Failed to create license:', licenseError);
      // Don't throw - user plan is already updated
    }

    console.log(`Successfully upgraded user ${userId} to ${tier} with license ${licenseKey}`);

    // Track analytics event
    const amount = session.amount_total ? session.amount_total / 100 : undefined;
    trackCheckoutCompleted(userId, tier, amount);

    // Optional: Send confirmation email
    // await sendUpgradeEmail(userId, tier, licenseKey);

  } catch (err) {
    console.error('Error processing checkout:', err);
    throw err;
  }
}

