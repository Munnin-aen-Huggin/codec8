import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { constructWebhookEvent, generateLicenseKey, stripe, ADDON_PRODUCTS } from '$lib/server/stripe';
import { supabaseAdmin } from '$lib/server/supabase';
import { trackCheckoutCompleted } from '$lib/utils/analytics';
import { trackEvent, EVENTS } from '$lib/server/analytics';
import { STRIPE_WEBHOOK_SECRET } from '$env/static/private';
import type Stripe from 'stripe';
import type { AddonType } from '$lib/server/stripe';

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

  // Handle subscription purchases (pro/team/enterprise)
  if (product === 'pro' || product === 'team' || product === 'enterprise') {
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
      const amount = product === 'pro' ? 149 : product === 'team' ? 399 : 999;
      trackCheckoutCompleted(userId, product, amount);

      // For enterprise tier, enable enterprise features on team
      if (product === 'enterprise') {
        await enableEnterpriseFeaturesForUser(userId);
      }

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

  // Handle add-on purchases
  const { addonType, teamId, quantity } = session.metadata || {};
  if (addonType && (addonType as AddonType) in ADDON_PRODUCTS) {
    await handleAddonPurchase(
      userId,
      addonType as AddonType,
      teamId || null,
      parseInt(quantity || '1'),
      session.subscription as string
    );
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

/**
 * Handle add-on subscription purchase
 */
async function handleAddonPurchase(
  userId: string,
  addonType: AddonType,
  teamId: string | null,
  quantity: number,
  subscriptionId: string
) {
  console.log(`Processing addon purchase: ${addonType} x${quantity} for user ${userId}, team: ${teamId}`);

  try {
    // Record addon purchase
    const { error: purchaseError } = await supabaseAdmin
      .from('addon_purchases')
      .insert({
        user_id: userId,
        team_id: teamId,
        addon_type: addonType,
        quantity,
        stripe_subscription_id: subscriptionId,
        stripe_price_id: ADDON_PRODUCTS[addonType].priceId,
        status: 'active'
      });

    if (purchaseError) {
      console.error('Failed to record addon purchase:', purchaseError);
    }

    // Update the relevant table based on addon type
    switch (addonType) {
      case 'unlimited_regen': {
        // Update user profile
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            addon_unlimited_regen: true,
            addon_unlimited_regen_expires: null // Active subscription
          })
          .eq('id', userId);

        if (updateError) {
          console.error('Failed to update unlimited_regen addon:', updateError);
        } else {
          console.log(`Enabled unlimited regenerations for user ${userId}`);
        }
        break;
      }

      case 'extra_repos': {
        if (teamId) {
          // Update team
          const { data: team } = await supabaseAdmin
            .from('teams')
            .select('addon_extra_repos')
            .eq('id', teamId)
            .single();

          const currentRepos = team?.addon_extra_repos || 0;

          const { error: updateError } = await supabaseAdmin
            .from('teams')
            .update({
              addon_extra_repos: currentRepos + quantity,
              addon_extra_repos_expires: null
            })
            .eq('id', teamId);

          if (updateError) {
            console.error('Failed to update team extra_repos:', updateError);
          } else {
            console.log(`Added ${quantity * 10} extra repos to team ${teamId}`);
          }
        } else {
          // Update user profile
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('addon_extra_repos')
            .eq('id', userId)
            .single();

          const currentRepos = profile?.addon_extra_repos || 0;

          const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({
              addon_extra_repos: currentRepos + quantity,
              addon_extra_repos_expires: null
            })
            .eq('id', userId);

          if (updateError) {
            console.error('Failed to update extra_repos addon:', updateError);
          } else {
            console.log(`Added ${quantity * 10} extra repos to user ${userId}`);
          }
        }
        break;
      }

      case 'extra_seats': {
        if (!teamId) {
          console.error('extra_seats addon requires a team');
          return;
        }

        const { data: team } = await supabaseAdmin
          .from('teams')
          .select('addon_extra_seats')
          .eq('id', teamId)
          .single();

        const currentSeats = team?.addon_extra_seats || 0;

        const { error: updateError } = await supabaseAdmin
          .from('teams')
          .update({
            addon_extra_seats: currentSeats + quantity,
            addon_extra_seats_expires: null
          })
          .eq('id', teamId);

        if (updateError) {
          console.error('Failed to update extra_seats addon:', updateError);
        } else {
          console.log(`Added ${quantity} extra seats to team ${teamId}`);
        }
        break;
      }

      case 'audit_logs': {
        if (!teamId) {
          console.error('audit_logs addon requires a team');
          return;
        }

        const { error: updateError } = await supabaseAdmin
          .from('teams')
          .update({
            addon_audit_logs: true,
            addon_audit_logs_expires: null
          })
          .eq('id', teamId);

        if (updateError) {
          console.error('Failed to enable audit_logs addon:', updateError);
        } else {
          console.log(`Enabled audit logs for team ${teamId}`);
        }
        break;
      }

      case 'sso': {
        if (!teamId) {
          console.error('sso addon requires a team');
          return;
        }

        // Enable SSO for the team (enterprise_tier allows SSO config)
        const { error: updateError } = await supabaseAdmin
          .from('teams')
          .update({
            enterprise_tier: true
          })
          .eq('id', teamId);

        if (updateError) {
          console.error('Failed to enable SSO addon:', updateError);
        } else {
          console.log(`Enabled SSO for team ${teamId}`);
        }
        break;
      }
    }

    // Track analytics
    const addonPrice = ADDON_PRODUCTS[addonType].price * quantity;
    await trackEvent(EVENTS.ADDON_PURCHASED || 'addon_purchased', {
      addon_type: addonType,
      quantity,
      amount: addonPrice,
      team_id: teamId
    }, userId);

  } catch (err) {
    console.error('Error processing addon purchase:', err);
  }
}

/**
 * Enable enterprise features for a user's default team
 * Called when enterprise subscription is activated
 */
async function enableEnterpriseFeaturesForUser(userId: string) {
  console.log(`Enabling enterprise features for user ${userId}`);

  // Get user's default team or create one
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('default_team_id')
    .eq('id', userId)
    .single();

  let teamId = profile?.default_team_id;

  if (!teamId) {
    // Check if user owns any team
    const { data: teams } = await supabaseAdmin
      .from('team_members')
      .select('team_id, role')
      .eq('user_id', userId)
      .eq('role', 'owner');

    if (teams && teams.length > 0) {
      teamId = teams[0].team_id;
    }
  }

  if (!teamId) {
    console.log(`No team found for user ${userId}, enterprise features will apply when team is created`);
    return;
  }

  // Enable enterprise features on the team
  const { error: updateError } = await supabaseAdmin
    .from('teams')
    .update({
      enterprise_tier: true,
      addon_audit_logs: true,
      max_seats: 9999 // Effectively unlimited
    })
    .eq('id', teamId);

  if (updateError) {
    console.error('Failed to enable enterprise features:', updateError);
  } else {
    console.log(`Enterprise features enabled for team ${teamId}`);
  }

  // Update user's default team if not set
  if (!profile?.default_team_id) {
    await supabaseAdmin
      .from('profiles')
      .update({ default_team_id: teamId })
      .eq('id', userId);
  }
}
