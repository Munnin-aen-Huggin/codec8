import { createHash } from 'crypto';
import { supabaseAdmin } from './supabase';

/**
 * Hash an IP address for privacy - never store raw IPs
 */
export function hashIP(ip: string): string {
	return createHash('sha256').update(ip).digest('hex');
}

/**
 * Hash a browser fingerprint for privacy
 */
export function hashFingerprint(fp: string): string {
	return createHash('sha256').update(fp).digest('hex');
}

/**
 * Check if an IP or fingerprint is blocked
 */
export async function isBlocked(ipHash: string, fingerprint?: string): Promise<boolean> {
	const now = new Date().toISOString();
	const ipHashShort = ipHash.substring(0, 8);

	// Check if IP is blocked
	const { data: ipBlocked, error: ipError } = await supabaseAdmin
		.from('blocked_clients')
		.select('id')
		.eq('ip_hash', ipHash)
		.or(`expires_at.is.null,expires_at.gt.${now}`)
		.limit(1);

	if (ipError) {
		console.error(`[RateLimit] Error checking blocked status for ${ipHashShort}:`, ipError.message);
	}

	if (ipBlocked && ipBlocked.length > 0) {
		console.log(`[RateLimit] IP ${ipHashShort} is BLOCKED`);
		return true;
	}

	// Check if fingerprint is blocked (if provided)
	if (fingerprint) {
		const fpShort = fingerprint.substring(0, 8);
		const { data: fpBlocked, error: fpError } = await supabaseAdmin
			.from('blocked_clients')
			.select('id')
			.eq('fingerprint', fingerprint)
			.or(`expires_at.is.null,expires_at.gt.${now}`)
			.limit(1);

		if (fpError) {
			console.error(`[RateLimit] Error checking fingerprint block for ${fpShort}:`, fpError.message);
		}

		if (fpBlocked && fpBlocked.length > 0) {
			console.log(`[RateLimit] Fingerprint ${fpShort} is BLOCKED`);
			return true;
		}
	}

	return false;
}

/**
 * Check if a demo usage is allowed for the given IP
 * Limit is 1 per day per IP
 */
export async function checkDemoLimit(ipHash: string): Promise<{ allowed: boolean; remaining: number }> {
	const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
	const ipHashShort = ipHash.substring(0, 8); // For logging

	console.log(`[RateLimit] Checking demo limit for IP hash ${ipHashShort}... on ${today}`);

	const { data, error } = await supabaseAdmin
		.from('demo_usage')
		.select('usage_count')
		.eq('ip_hash', ipHash)
		.eq('date', today)
		.single();

	if (error && error.code !== 'PGRST116') {
		// PGRST116 = no rows found, which is fine
		console.error(`[RateLimit] DB error checking limit for ${ipHashShort}:`, error.code, error.message);
		// On error, allow but log
		return { allowed: true, remaining: 1 };
	}

	if (error?.code === 'PGRST116') {
		console.log(`[RateLimit] No usage record found for ${ipHashShort} today - allowing`);
	}

	const used = data?.usage_count || 0;
	const limit = 1;
	const allowed = used < limit;

	console.log(`[RateLimit] IP ${ipHashShort}: used=${used}, limit=${limit}, allowed=${allowed}`);

	return {
		allowed,
		remaining: Math.max(0, limit - used)
	};
}

/**
 * Increment demo usage for an IP address
 */
export async function incrementDemoUsage(
	ipHash: string,
	metadata: {
		repoUrl: string;
		userAgent: string;
		fingerprint?: string;
		isSuspicious?: boolean;
	}
): Promise<void> {
	const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
	const now = new Date().toISOString();
	const ipHashShort = ipHash.substring(0, 8); // For logging

	console.log(`[RateLimit] Recording demo usage for IP ${ipHashShort} on ${today}`);
	console.log(`[RateLimit] Repo: ${metadata.repoUrl}, Suspicious: ${metadata.isSuspicious || false}`);

	// Try to upsert: insert or update if exists
	const { data, error } = await supabaseAdmin
		.from('demo_usage')
		.upsert(
			{
				ip_hash: ipHash,
				date: today,
				usage_count: 1,
				last_repo_url: metadata.repoUrl,
				user_agent: metadata.userAgent,
				fingerprint: metadata.fingerprint || null,
				is_suspicious: metadata.isSuspicious || false,
				last_used_at: now
			},
			{
				onConflict: 'ip_hash,date',
				ignoreDuplicates: false
			}
		)
		.select();

	if (error) {
		console.error(`[RateLimit] Upsert failed for ${ipHashShort}:`, error.code, error.message);
		console.log(`[RateLimit] Attempting fallback update for ${ipHashShort}...`);

		// If upsert failed, try to increment existing row
		const { data: updateData, error: updateError } = await supabaseAdmin
			.from('demo_usage')
			.update({
				usage_count: 1,
				last_repo_url: metadata.repoUrl,
				user_agent: metadata.userAgent,
				fingerprint: metadata.fingerprint || null,
				is_suspicious: metadata.isSuspicious || false,
				last_used_at: now
			})
			.eq('ip_hash', ipHash)
			.eq('date', today)
			.select();

		if (updateError) {
			console.error(`[RateLimit] Fallback update also failed for ${ipHashShort}:`, updateError.code, updateError.message);
		} else {
			console.log(`[RateLimit] Fallback update succeeded for ${ipHashShort}:`, updateData?.length || 0, 'rows updated');
		}
	} else {
		console.log(`[RateLimit] Upsert succeeded for ${ipHashShort}:`, data?.length || 0, 'rows affected');
	}
}

/**
 * Block a client by IP hash
 */
export async function blockClient(
	ipHash: string,
	reason: string,
	durationHours?: number
): Promise<void> {
	const now = new Date();
	const ipHashShort = ipHash.substring(0, 8);
	const expiresAt = durationHours
		? new Date(now.getTime() + durationHours * 60 * 60 * 1000).toISOString()
		: null;

	console.log(`[RateLimit] Blocking IP ${ipHashShort} for reason: ${reason}, duration: ${durationHours || 'permanent'} hours`);

	const { error } = await supabaseAdmin
		.from('blocked_clients')
		.insert({
			ip_hash: ipHash,
			reason,
			blocked_at: now.toISOString(),
			expires_at: expiresAt
		});

	if (error) {
		console.error(`[RateLimit] Failed to block IP ${ipHashShort}:`, error.code, error.message);
		throw new Error('Failed to block client');
	}

	console.log(`[RateLimit] Successfully blocked IP ${ipHashShort}`);
}
