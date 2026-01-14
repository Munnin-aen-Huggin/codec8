/**
 * Client-side Analytics Store
 *
 * Manages anonymous user ID for pre-auth tracking.
 * The ID is stored in localStorage and persists across sessions.
 */

import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const STORAGE_KEY = 'codedoc_anonymous_id';

/**
 * Generate a UUID v4 for anonymous tracking
 */
function generateAnonymousId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Create the anonymous ID store
 * Retrieves existing ID from localStorage or generates a new one
 */
function createAnonymousIdStore() {
  let initialId = '';

  if (browser) {
    // Try to get existing ID from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      initialId = stored;
    } else {
      // Generate and store new ID
      initialId = generateAnonymousId();
      localStorage.setItem(STORAGE_KEY, initialId);
    }
  }

  const { subscribe } = writable<string>(initialId);

  return {
    subscribe,
    /**
     * Get the current anonymous ID synchronously
     * Returns empty string on server-side
     */
    get: (): string => {
      if (browser) {
        return localStorage.getItem(STORAGE_KEY) || '';
      }
      return '';
    }
  };
}

export const anonymousId = createAnonymousIdStore();

/**
 * Get anonymous ID for tracking (safe to call on server)
 * Returns empty string if not in browser
 */
export function getAnonymousId(): string {
  if (browser) {
    return localStorage.getItem(STORAGE_KEY) || '';
  }
  return '';
}

// Track which events have been fired to prevent duplicates
const firedEvents = new Set<string>();

/**
 * Track an analytics event from the client side
 * Fire-and-forget - errors are swallowed
 */
export async function trackClientEvent(
  eventName: string,
  properties?: Record<string, string | number | boolean | null>
): Promise<void> {
  if (!browser) return;

  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: eventName, ...properties })
    });
  } catch {
    // Silently fail - analytics should never break UX
  }
}

/**
 * Track an event only once per session
 * Useful for impression tracking (upsell_viewed, pricing_viewed)
 */
export async function trackEventOnce(
  eventName: string,
  properties?: Record<string, string | number | boolean | null>
): Promise<void> {
  if (firedEvents.has(eventName)) return;
  firedEvents.add(eventName);
  await trackClientEvent(eventName, properties);
}

/**
 * Create an IntersectionObserver that tracks when an element enters the viewport
 * Automatically cleans up after the element is observed once
 */
export function trackOnVisible(
  element: HTMLElement | null,
  eventName: string,
  properties?: Record<string, string | number | boolean | null>,
  threshold = 0.5
): () => void {
  if (!browser || !element) return () => {};

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          trackEventOnce(eventName, properties);
          observer.disconnect();
        }
      });
    },
    { threshold }
  );

  observer.observe(element);

  // Return cleanup function
  return () => observer.disconnect();
}

/**
 * Track page view with UTM parameters
 */
export function trackPageView(): void {
  if (!browser) return;

  const url = new URL(window.location.href);
  const source = url.searchParams.get('utm_source') || 'direct';
  const medium = url.searchParams.get('utm_medium') || 'none';
  const campaign = url.searchParams.get('utm_campaign') || '';

  trackEventOnce('page_view', {
    source,
    medium,
    campaign,
    path: url.pathname
  });
}
