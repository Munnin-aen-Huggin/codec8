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
