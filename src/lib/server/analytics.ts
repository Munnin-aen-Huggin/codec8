/**
 * Server-side Analytics Utility
 *
 * Tracks analytics events to Supabase for conversion funnel analysis.
 * All tracking is non-blocking - errors are logged but never thrown.
 */

import { supabaseAdmin } from '$lib/server/supabase';

export interface EventProperties {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Track an analytics event (server-side)
 * Silently fails to not break user flows
 *
 * @param eventName - The event name from EVENTS constants
 * @param properties - Optional event properties
 * @param userId - User ID if authenticated
 * @param anonymousId - Anonymous ID for pre-auth tracking
 */
export async function trackEvent(
  eventName: string,
  properties?: EventProperties,
  userId?: string,
  anonymousId?: string
): Promise<void> {
  try {
    await supabaseAdmin.from('events').insert({
      event_name: eventName,
      properties: properties || {},
      user_id: userId || null,
      anonymous_id: anonymousId || null,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    // Log but don't throw - analytics should never break user flows
    console.error('Failed to track event:', eventName, error);
  }
}

/**
 * Track an event with timing information
 * Useful for measuring API response times and user wait times
 *
 * @param eventName - The event name
 * @param startTime - Start time from Date.now()
 * @param properties - Optional event properties
 * @param userId - User ID if authenticated
 * @param anonymousId - Anonymous ID for pre-auth tracking
 */
export async function trackTimedEvent(
  eventName: string,
  startTime: number,
  properties?: EventProperties,
  userId?: string,
  anonymousId?: string
): Promise<void> {
  const durationMs = Date.now() - startTime;
  await trackEvent(
    eventName,
    { ...properties, duration_ms: durationMs },
    userId,
    anonymousId
  );
}

// Event name constants for consistency
export const EVENTS = {
  // Page engagement
  PAGE_VIEW: 'page_view',
  DEMO_INPUT_FOCUSED: 'demo_input_focused',
  UPSELL_VIEWED: 'upsell_viewed',
  PRICING_VIEWED: 'pricing_viewed',

  // Demo flow
  DEMO_STARTED: 'demo_started',
  DEMO_SUBMITTED: 'demo_submitted',
  DEMO_COMPLETED: 'demo_completed',
  DEMO_FAILED: 'demo_failed',
  DEMO_LIMIT_REACHED: 'demo_limit_reached',

  // Exit intent & lead capture
  EXIT_INTENT_SHOWN: 'exit_intent_shown',
  EMAIL_CAPTURED: 'email_captured',

  // Auth flow
  SIGNUP_STARTED: 'signup_started',
  SIGNUP_COMPLETED: 'signup_completed',
  LOGIN_COMPLETED: 'login_completed',

  // Conversion flow
  CHECKOUT_STARTED: 'checkout_started',
  CHECKOUT_COMPLETED: 'checkout_completed',
  PURCHASE_COMPLETED: 'purchase_completed',
  TRIAL_STARTED: 'trial_started',
  SUBSCRIPTION_CREATED: 'subscription_created',
  SUBSCRIPTION_CANCELED: 'subscription_canceled',
  REGENERATE_PURCHASED: 'regenerate_purchased',

  // Product usage
  REPO_CONNECTED: 'repo_connected',
  DOC_GENERATED: 'doc_generated',
  DOC_EXPORTED: 'doc_exported',
  USAGE_LIMIT_HIT: 'usage_limit_hit'
} as const;
