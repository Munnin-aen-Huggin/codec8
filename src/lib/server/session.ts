/**
 * Server-side Session Management
 *
 * CRITICAL SECURITY: All session validation must go through this module.
 * Sessions are stored server-side in the database and validated on every request.
 */

import { supabaseAdmin } from './supabase';
import { createHash, timingSafeEqual } from 'crypto';
import type { Cookies } from '@sveltejs/kit';

export interface Session {
	id: string;
	userId: string;
	expiresAt: Date;
	lastActiveAt: Date;
}

export interface SessionValidationResult {
	valid: boolean;
	userId?: string;
	session?: Session;
	error?: string;
}

// Session configuration
const SESSION_DURATION_DAYS = 7;
const SESSION_COOKIE_NAME = 'session';

/**
 * Hash a session token for secure storage
 * We store hashed tokens so that even if the database is compromised,
 * attackers cannot use the tokens directly
 */
export function hashSessionToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}

/**
 * Compare session tokens in constant time to prevent timing attacks
 */
function compareTokens(a: string, b: string): boolean {
	try {
		const bufA = Buffer.from(a, 'hex');
		const bufB = Buffer.from(b, 'hex');
		if (bufA.length !== bufB.length) return false;
		return timingSafeEqual(bufA, bufB);
	} catch {
		return false;
	}
}

/**
 * Create a new session for a user
 */
export async function createSession(
	userId: string,
	options?: {
		ipAddress?: string;
		userAgent?: string;
	}
): Promise<{ token: string; expiresAt: Date } | null> {
	const token = crypto.randomUUID();
	const tokenHash = hashSessionToken(token);
	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

	// Use RPC function with SECURITY DEFINER to bypass RLS
	const { data: sessionId, error: rpcError } = await supabaseAdmin.rpc('create_user_session', {
		p_user_id: userId,
		p_token_hash: tokenHash,
		p_expires_at: expiresAt.toISOString(),
		p_ip_address: options?.ipAddress || null,
		p_user_agent: options?.userAgent?.substring(0, 500) || null
	});

	if (rpcError) {
		console.error('[Session] RPC create_user_session failed:', rpcError);

		// Fallback to direct insert
		const { error } = await supabaseAdmin.from('sessions').insert({
			user_id: userId,
			token_hash: tokenHash,
			expires_at: expiresAt.toISOString(),
			ip_address: options?.ipAddress || null,
			user_agent: options?.userAgent?.substring(0, 500) || null
		});

		if (error) {
			console.error('[Session] Direct insert also failed:', error);
			return null;
		}
	}

	return { token, expiresAt };
}

/**
 * Validate a session token and return the user ID if valid
 * This is the CRITICAL function that must be called on every authenticated request
 */
export async function validateSession(token: string): Promise<SessionValidationResult> {
	if (!token || typeof token !== 'string') {
		return { valid: false, error: 'Invalid token format' };
	}

	const tokenHash = hashSessionToken(token);

	// Direct query - RLS policies now allow this
	const { data: session, error } = await supabaseAdmin
		.from('sessions')
		.select('id, user_id, token_hash, expires_at, last_active_at')
		.eq('token_hash', tokenHash)
		.single();

	if (error || !session) {
		console.log('[Session] Session not found for token hash');
		return { valid: false, error: 'Session not found' };
	}

	// Verify token hash matches (constant-time comparison)
	if (!compareTokens(tokenHash, session.token_hash)) {
		return { valid: false, error: 'Invalid token' };
	}

	// Check expiration
	const expiresAt = new Date(session.expires_at);
	if (expiresAt < new Date()) {
		// Clean up expired session
		supabaseAdmin.from('sessions').delete().eq('id', session.id).then(() => {}).catch(() => {});
		return { valid: false, error: 'Session expired' };
	}

	// Update last active timestamp (don't wait for this)
	supabaseAdmin
		.from('sessions')
		.update({ last_active_at: new Date().toISOString() })
		.eq('id', session.id)
		.then(() => {})
		.catch(() => {});

	return {
		valid: true,
		userId: session.user_id,
		session: {
			id: session.id,
			userId: session.user_id,
			expiresAt,
			lastActiveAt: new Date(session.last_active_at)
		}
	};
}

/**
 * Parse session from cookie and validate it
 */
export async function validateSessionFromCookie(
	cookies: Cookies
): Promise<SessionValidationResult> {
	const sessionCookie = cookies.get(SESSION_COOKIE_NAME);

	if (!sessionCookie) {
		return { valid: false, error: 'No session cookie' };
	}

	try {
		const parsed = JSON.parse(sessionCookie);
		if (!parsed.token || typeof parsed.token !== 'string') {
			return { valid: false, error: 'Invalid session cookie format' };
		}

		return await validateSession(parsed.token);
	} catch {
		return { valid: false, error: 'Failed to parse session cookie' };
	}
}

/**
 * Invalidate a specific session
 */
export async function invalidateSession(token: string): Promise<boolean> {
	const tokenHash = hashSessionToken(token);

	// Use RPC function with SECURITY DEFINER to bypass RLS
	const { error: rpcError } = await supabaseAdmin.rpc('delete_session', {
		p_token_hash: tokenHash
	});

	if (rpcError) {
		console.error('[Session] RPC delete_session failed:', rpcError);
		// Fallback to direct delete
		const { error } = await supabaseAdmin.from('sessions').delete().eq('token_hash', tokenHash);
		if (error) {
			console.error('[Session] Direct delete also failed:', error);
			return false;
		}
	}

	return true;
}

/**
 * Invalidate all sessions for a user (e.g., on password change or security concern)
 */
export async function invalidateAllUserSessions(userId: string): Promise<number> {
	const { data, error } = await supabaseAdmin
		.from('sessions')
		.delete()
		.eq('user_id', userId)
		.select('id');

	if (error) {
		console.error('[Session] Failed to invalidate user sessions:', error);
		return 0;
	}

	return data?.length || 0;
}

/**
 * Get all active sessions for a user (for session management UI)
 */
export async function getUserSessions(userId: string): Promise<Session[]> {
	const { data, error } = await supabaseAdmin
		.from('sessions')
		.select('id, user_id, expires_at, last_active_at')
		.eq('user_id', userId)
		.gt('expires_at', new Date().toISOString())
		.order('last_active_at', { ascending: false });

	if (error) {
		console.error('[Session] Failed to get user sessions:', error);
		return [];
	}

	return (data || []).map((s) => ({
		id: s.id,
		userId: s.user_id,
		expiresAt: new Date(s.expires_at),
		lastActiveAt: new Date(s.last_active_at)
	}));
}

/**
 * Set session cookie with proper security attributes
 */
export function setSessionCookie(
	cookies: Cookies,
	userId: string,
	token: string,
	expiresAt: Date,
	isDev: boolean = false
): void {
	cookies.set(
		SESSION_COOKIE_NAME,
		JSON.stringify({ userId, token }),
		{
			path: '/',
			httpOnly: true,
			secure: !isDev, // Always secure in production
			sameSite: 'lax',
			expires: expiresAt
		}
	);
}

/**
 * Clear session cookie
 */
export function clearSessionCookie(cookies: Cookies): void {
	cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
}

/**
 * Cleanup expired sessions (should be called by a cron job)
 */
export async function cleanupExpiredSessions(): Promise<number> {
	const { data, error } = await supabaseAdmin
		.from('sessions')
		.delete()
		.lt('expires_at', new Date().toISOString())
		.select('id');

	if (error) {
		console.error('[Session] Failed to cleanup expired sessions:', error);
		return 0;
	}

	return data?.length || 0;
}

/**
 * Get validated user ID from cookies - throws SvelteKit error if invalid
 * This is a drop-in replacement for the insecure getUserIdFromSession pattern
 */
export async function getValidatedUserId(cookies: Cookies): Promise<string> {
	const result = await validateSessionFromCookie(cookies);

	if (!result.valid || !result.userId) {
		// Import error dynamically to avoid circular dependencies
		const { error } = await import('@sveltejs/kit');
		throw error(401, 'Unauthorized');
	}

	return result.userId;
}

/**
 * Get validated user ID or null (for optional auth endpoints)
 */
export async function getValidatedUserIdOrNull(cookies: Cookies): Promise<string | null> {
	const result = await validateSessionFromCookie(cookies);

	if (!result.valid || !result.userId) {
		return null;
	}

	return result.userId;
}
