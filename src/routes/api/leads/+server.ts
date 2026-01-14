import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabaseAdmin } from '$lib/server/supabase';

// Simple rate limiting using in-memory store (per instance)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // max submissions per hour per IP
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour in ms

function isRateLimited(ip: string): boolean {
	const now = Date.now();
	const entry = rateLimitMap.get(ip);

	if (!entry || now > entry.resetTime) {
		rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
		return false;
	}

	if (entry.count >= RATE_LIMIT) {
		return true;
	}

	entry.count++;
	return false;
}

function validateEmail(email: string): boolean {
	const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailPattern.test(email) && email.length <= 255;
}

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	try {
		const clientIp = getClientAddress();

		// Rate limiting
		if (isRateLimited(clientIp)) {
			return json(
				{ error: 'Too many requests. Please try again later.' },
				{ status: 429 }
			);
		}

		const body = await request.json().catch(() => ({}));
		const { email, source } = body;

		// Validate email
		if (!email || typeof email !== 'string') {
			return json({ error: 'Email is required' }, { status: 400 });
		}

		const trimmedEmail = email.trim().toLowerCase();

		if (!validateEmail(trimmedEmail)) {
			return json({ error: 'Invalid email format' }, { status: 400 });
		}

		// Validate source
		const validSources = ['exit_intent', 'newsletter', 'enterprise', 'other'];
		const leadSource = validSources.includes(source) ? source : 'other';

		// Store lead in database (upsert to handle duplicates)
		const { error: dbError } = await supabaseAdmin
			.from('leads')
			.upsert(
				{
					email: trimmedEmail,
					source: leadSource,
					ip_address: clientIp,
					created_at: new Date().toISOString()
				},
				{
					onConflict: 'email',
					ignoreDuplicates: true
				}
			);

		if (dbError) {
			console.error('[Leads API] Database error:', dbError);
			// If the table doesn't exist, we can still return success
			// The lead capture intention is noted even if storage failed
			if (dbError.code === '42P01') {
				// Table doesn't exist - log it but don't fail the user
				console.warn('[Leads API] Leads table not found. Lead not stored:', trimmedEmail);
				return json({ success: true, message: 'Thank you for subscribing!' });
			}
			return json({ error: 'Failed to save email. Please try again.' }, { status: 500 });
		}

		// Track analytics event (fire and forget)
		try {
			await supabaseAdmin
				.from('analytics_events')
				.insert({
					event_name: 'lead_captured',
					event_data: { source: leadSource },
					ip_address: clientIp,
					created_at: new Date().toISOString()
				});
		} catch (analyticsError) {
			console.warn('[Leads API] Analytics tracking failed:', analyticsError);
		}

		return json({ success: true, message: 'Thank you for subscribing!' });
	} catch (error) {
		console.error('[Leads API] Unexpected error:', error);
		return json({ error: 'An unexpected error occurred' }, { status: 500 });
	}
};
