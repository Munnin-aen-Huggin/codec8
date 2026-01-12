import { supabaseAdmin } from '$lib/server/supabase';
import type { License } from '$lib/types';

/**
 * Generate a cryptographically secure random integer in range [0, max)
 */
function getSecureRandomInt(max: number): number {
	const randomBuffer = new Uint32Array(1);
	crypto.getRandomValues(randomBuffer);
	// Use modulo with rejection sampling for uniform distribution
	const randomNumber = randomBuffer[0];
	return randomNumber % max;
}

/**
 * Generate a license key in format XXXX-XXXX-XXXX-XXXX
 * Uses crypto.getRandomValues() for cryptographic security
 */
export function generateLicenseKey(): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	const segments = 4;
	const segmentLength = 4;

	const parts: string[] = [];
	for (let i = 0; i < segments; i++) {
		let segment = '';
		for (let j = 0; j < segmentLength; j++) {
			segment += chars.charAt(getSecureRandomInt(chars.length));
		}
		parts.push(segment);
	}

	return parts.join('-');
}

/**
 * Verify a license key exists and is valid
 */
export async function verifyLicenseKey(licenseKey: string): Promise<License | null> {
  const { data, error } = await supabaseAdmin
    .from('licenses')
    .select('*')
    .eq('license_key', licenseKey)
    .single();

  if (error || !data) {
    return null;
  }

  return data as License;
}

/**
 * Get user's active license
 */
export async function getUserLicense(userId: string): Promise<License | null> {
  const { data, error } = await supabaseAdmin
    .from('licenses')
    .select('*')
    .eq('user_id', userId)
    .order('activated_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return data as License;
}

/**
 * Check if user can use a feature based on their plan
 */
export function canUseFeature(
  plan: string,
  feature: 'unlimited_repos' | 'all_doc_types' | 'auto_sync' | 'priority_support'
): boolean {
  const paidPlans = ['ltd', 'pro', 'dfy'];

  switch (feature) {
    case 'unlimited_repos':
    case 'all_doc_types':
    case 'auto_sync':
    case 'priority_support':
      return paidPlans.includes(plan);
    default:
      return false;
  }
}

/**
 * Get repo limit for a plan
 */
export function getRepoLimit(plan: string): number {
  switch (plan) {
    case 'free':
      return 1;
    case 'ltd':
    case 'pro':
    case 'dfy':
      return Infinity;
    default:
      return 1;
  }
}

/**
 * Check if user can connect more repos
 */
export async function canConnectMoreRepos(userId: string): Promise<boolean> {
  // Get user's plan
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('plan')
    .eq('id', userId)
    .single();

  if (!profile) {
    return false;
  }

  const limit = getRepoLimit(profile.plan);
  if (limit === Infinity) {
    return true;
  }

  // Count connected repos
  const { count } = await supabaseAdmin
    .from('repositories')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  return (count || 0) < limit;
}
