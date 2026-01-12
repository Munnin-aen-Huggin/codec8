/**
 * Analytics Utility
 *
 * Lightweight analytics tracking for key business events.
 * Events are logged server-side and can be sent to Vercel Analytics or other providers.
 */

export type AnalyticsEvent =
  | 'repo_connected'
  | 'docs_generated'
  | 'checkout_started'
  | 'checkout_completed'
  | 'beta_signup'
  | 'feedback_submitted';

export interface EventProperties {
  userId?: string;
  repoId?: string;
  repoName?: string;
  docTypes?: string[];
  tier?: string;
  amount?: number;
  feedbackType?: string;
  [key: string]: string | number | string[] | undefined;
}

/**
 * Track an analytics event server-side
 *
 * @param event - The event name
 * @param properties - Optional event properties
 */
export function trackEvent(event: AnalyticsEvent, properties?: EventProperties): void {
  const timestamp = new Date().toISOString();

  // Log to console in a structured format for log aggregation
  console.log(JSON.stringify({
    type: 'analytics_event',
    event,
    properties: properties || {},
    timestamp
  }));

  // In production, you could send to:
  // - Vercel Analytics (via @vercel/analytics)
  // - PostHog
  // - Mixpanel
  // - Custom endpoint
}

/**
 * Track repo connection event
 */
export function trackRepoConnected(userId: string, repoName: string, repoId?: string): void {
  trackEvent('repo_connected', { userId, repoName, repoId });
}

/**
 * Track documentation generation event
 */
export function trackDocsGenerated(userId: string, repoId: string, docTypes: string[]): void {
  trackEvent('docs_generated', { userId, repoId, docTypes });
}

/**
 * Track checkout started event
 */
export function trackCheckoutStarted(userId: string, tier: string): void {
  trackEvent('checkout_started', { userId, tier });
}

/**
 * Track checkout completed event
 */
export function trackCheckoutCompleted(userId: string, tier: string, amount?: number): void {
  trackEvent('checkout_completed', { userId, tier, amount });
}

/**
 * Track beta signup event
 */
export function trackBetaSignup(email: string): void {
  trackEvent('beta_signup', { email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3') });
}

/**
 * Track feedback submitted event
 */
export function trackFeedbackSubmitted(userId: string, feedbackType: string): void {
  trackEvent('feedback_submitted', { userId, feedbackType });
}
