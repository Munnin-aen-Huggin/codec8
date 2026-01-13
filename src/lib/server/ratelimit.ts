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

	// Check if IP is blocked
	const { data: ipBlocked } = await supabaseAdmin
		.from('blocked_clients')
		.select('id')
		.eq('ip_hash', ipHash)
		.or(`expires_at.is.null,expires_at.gt.${now}`)
		.limit(1);

	if (ipBlocked && ipBlocked.length > 0) {
		return true;
	}

	// Check if fingerprint is blocked (if provided)
	if (fingerprint) {
		const { data: fpBlocked } = await supabaseAdmin
			.from('blocked_clients')
			.select('id')
			.eq('fingerprint', fingerprint)
			.or(`expires_at.is.null,expires_at.gt.${now}`)
			.limit(1);

		if (fpBlocked && fpBlocked.length > 0) {
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

	const { data, error } = await supabaseAdmin
		.from('demo_usage')
		.select('usage_count')
		.eq('ip_hash', ipHash)
		.eq('date', today)
		.single();

	if (error && error.code !== 'PGRST116') {
		// PGRST116 = no rows found, which is fine
		console.error('Error checking demo limit:', error);
		// On error, allow but log
		return { allowed: true, remaining: 1 };
	}

	const used = data?.usage_count || 0;
	const limit = 1;

	return {
		allowed: used < limit,
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

	// Try to upsert: insert or update if exists
	const { error } = await supabaseAdmin
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
		);

	if (error) {
		// If upsert failed, try to increment existing row
		const { error: updateError } = await supabaseAdmin
			.from('demo_usage')
			.update({
				usage_count: supabaseAdmin.rpc ? 1 : 1, // Increment handled by trigger or manual
				last_repo_url: metadata.repoUrl,
				user_agent: metadata.userAgent,
				fingerprint: metadata.fingerprint || null,
				is_suspicious: metadata.isSuspicious || false,
				last_used_at: now
			})
			.eq('ip_hash', ipHash)
			.eq('date', today);

		if (updateError) {
			console.error('Error incrementing demo usage:', updateError);
		}
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
	const expiresAt = durationHours
		? new Date(now.getTime() + durationHours * 60 * 60 * 1000).toISOString()
		: null;

	const { error } = await supabaseAdmin
		.from('blocked_clients')
		.insert({
			ip_hash: ipHash,
			reason,
			blocked_at: now.toISOString(),
			expires_at: expiresAt
		});

	if (error) {
		console.error('Error blocking client:', error);
		throw new Error('Failed to block client');
	}
}
