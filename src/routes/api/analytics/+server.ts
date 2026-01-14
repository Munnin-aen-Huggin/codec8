import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabaseAdmin } from '$lib/server/supabase';

// Simple rate limiting per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // max events per minute per IP
const RATE_WINDOW = 60 * 1000; // 1 minute

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

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	try {
		const clientIp = getClientAddress();

		// Rate limiting
		if (isRateLimited(clientIp)) {
			return json({ error: 'Too many requests' }, { status: 429 });
		}

		const body = await request.json().catch(() => ({}));
		const { event, ...properties } = body;

		// Validate event name
		if (!event || typeof event !== 'string') {
			return json({ error: 'Event name required' }, { status: 400 });
		}

		// Sanitize event name
		const eventName = event.slice(0, 100).replace(/[^a-z0-9_]/gi, '_');

		// Store event in database
		const { error: dbError } = await supabaseAdmin
			.from('analytics_events')
			.insert({
				event_name: eventName,
				event_data: properties || {},
				ip_address: clientIp,
				created_at: new Date().toISOString()
			});

		if (dbError) {
			// Log but don't fail - analytics should be non-blocking
			console.warn('[Analytics API] Database error:', dbError.message);
		}

		return json({ success: true });
	} catch (error) {
		console.error('[Analytics API] Unexpected error:', error);
		return json({ success: true }); // Still return success - don't break client
	}
};
