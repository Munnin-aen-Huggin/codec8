import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { constructWebhookEvent, generateLicenseKey, stripe } from '$lib/server/stripe';
import { supabaseAdmin } from '$lib/server/supabase';
import { trackCheckoutCompleted } from '$lib/utils/analytics';
import { trackEvent, EVENTS } from '$lib/server/analytics';
import { STRIPE_WEBHOOK_SECRET } from '$env/static/private';
import type Stripe from 'stripe';

/**
 * Extract owner/repo from GitHub URL
 */
function extractRepoName(url: string): string {
  const match = url.match(/github\.com\/([^\/]+\/[^\/]+)/);
  return match ? match[1] : url;
}

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

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdated(subscription);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeleted(subscription);
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
  const { userId, product, repoUrl, repoId, type } = session.metadata || {};

  if (!userId) {
    console.error('Missing userId in checkout session:', session.id);
    return;
  }

  console.log(`Processing checkout for user ${userId}, product: ${product}, type: ${type}`);

  // Handle regeneration purchase
  if (type === 'regenerate' && repoId) {
    console.log(`Processing regeneration for repo ${repoId}`);
    const { error: updateError } = await supabaseAdmin
      .from('purchased_repos')
      .update({
        last_generated_at: new Date().toISOString()
      })
      .eq('id', repoId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Failed to update purchased repo:', updateError);
    } else {
      console.log(`Regeneration enabled for repo ${repoId}`);
    }

    // Track analytics
    trackCheckoutCompleted(userId, 'regenerate', 9);
    await trackEvent(EVENTS.REGENERATE_PURCHASED, { repo_id: repoId, amount: 9 }, userId);
    return;
  }

  // Handle single repo one-time purchase
  if (product === 'single') {
    console.log(`Processing single repo purchase for ${repoUrl}`);

    if (!repoUrl) {
      console.error('Missing repoUrl for single repo purchase');
      return;
    }

    const repoName = extractRepoName(repoUrl);
    const licenseKey = generateLicenseKey();

    // Insert into purchased_repos table
    const { error: insertError } = await supabaseAdmin
      .from('purchased_repos')
      .insert({
        user_id: userId,
        repo_url: repoUrl,
        repo_name: repoName,
        stripe_payment_id: session.payment_intent as string,
        license_key: licenseKey
      });

    if (insertError) {
      console.error('Failed to insert purchased repo:', insertError);
    } else {
      console.log(`Successfully purchased repo ${repoName} with license ${licenseKey}`);
    }

    // Also insert into licenses table for consistency with success page queries
    const { error: licenseError } = await supabaseAdmin
      .from('licenses')
      .insert({
        user_id: userId,
        license_key: licenseKey,
        tier: 'single',
        stripe_payment_id: session.payment_intent as string,
        activated_at: new Date().toISOString()
      });

    if (licenseError) {
      console.error('Failed to insert license record:', licenseError);
    } else {
      console.log(`License record created for single repo purchase`);
    }

    // Track analytics
    trackCheckoutCompleted(userId, 'single', 99);
    await trackEvent(EVENTS.PURCHASE_COMPLETED, { product: 'single', amount: 99, repo_url: repoUrl }, userId);
    return;
  }

  // Handle subscription purchases (pro/team)
  if (product === 'pro' || product === 'team') {
    console.log(`Processing ${product} subscription for user ${userId}`);

    try {
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          subscription_status: subscription.status, // 'trialing' or 'active'
          subscription_tier: product,
          trial_ends_at: subscription.trial_end
            ? new Date(subscription.trial_end * 1000).toISOString()
            : null,
          repos_used_this_month: 0,
          repos_reset_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Failed to update user subscription:', updateError);
      } else {
        console.log(`Successfully started ${product} subscription for user ${userId}`);
      }

      // Create license record for subscription
      const licenseKey = generateLicenseKey();
      const { error: licenseError } = await supabaseAdmin
        .from('licenses')
        .insert({
          user_id: userId,
          license_key: licenseKey,
          tier: product,
          stripe_payment_id: session.subscription as string,
          activated_at: new Date().toISOString()
        });

      if (licenseError) {
        console.error('Failed to insert license record:', licenseError);
      } else {
        console.log(`License record created for ${product} subscription`);
      }

      // Track analytics
      const amount = product === 'pro' ? 149 : 399;
      trackCheckoutCompleted(userId, product, amount);

      // Track trial or subscription created based on status
      if (subscription.status === 'trialing') {
        await trackEvent(EVENTS.TRIAL_STARTED, { tier: product, amount }, userId);
      } else {
        await trackEvent(EVENTS.SUBSCRIPTION_CREATED, { tier: product, amount }, userId);
      }
    } catch (err) {
      console.error('Error retrieving subscription:', err);
    }
    return;
  }

  // Legacy fallback for unknown product types
  console.log(`Unknown product type: ${product}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  console.log(`Subscription updated for customer ${customerId}, status: ${subscription.status}`);

  // Find user by customer ID
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!profile) {
    console.error('No profile found for customer:', customerId);
    return;
  }

  // Determine if this is a new billing period (reset usage)
  const periodStart = (subscription as unknown as { current_period_start?: number }).current_period_start;
  const currentPeriodStart = periodStart ? new Date(periodStart * 1000) : null;
  const now = new Date();
  const isNewPeriod = subscription.status === 'active' && currentPeriodStart &&
    currentPeriodStart > new Date(now.getTime() - 24 * 60 * 60 * 1000); // Within last 24 hours

  const updateData: Record<string, unknown> = {
    subscription_status: subscription.status
  };

  // Reset usage on new billing period
  if (isNewPeriod) {
    updateData.repos_used_this_month = 0;
    updateData.repos_reset_at = new Date().toISOString();
    console.log(`Reset monthly usage for user ${profile.id}`);
  }

  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .update(updateData)
    .eq('id', profile.id);

  if (updateError) {
    console.error('Failed to update subscription status:', updateError);
  } else {
    console.log(`Updated subscription status to ${subscription.status} for user ${profile.id}`);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  console.log(`Subscription canceled for customer ${customerId}`);

  // Find user by customer ID
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!profile) {
    console.error('No profile found for customer:', customerId);
    return;
  }

  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: 'canceled',
      subscription_ends_at: new Date().toISOString()
    })
    .eq('id', profile.id);

  if (updateError) {
    console.error('Failed to update canceled subscription:', updateError);
  } else {
    console.log(`Subscription canceled for user ${profile.id}`);
    // Track subscription cancellation
    await trackEvent(EVENTS.SUBSCRIPTION_CANCELED, {}, profile.id);
  }
}
