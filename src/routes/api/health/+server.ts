import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const checks: Record<string, { status: string; latency_ms?: number }> = {};
	let healthy = true;

	// Check database connectivity
	const dbStart = Date.now();
	try {
		const { data, error } = await supabaseAdmin.from('profiles').select('id').limit(1);
		// A successful query returns data (even if empty) and no error
		const dbOk = !error;
		checks.database = {
			status: dbOk ? 'ok' : 'degraded',
			latency_ms: Date.now() - dbStart
		};
		if (!dbOk) healthy = false;
	} catch {
		checks.database = { status: 'down', latency_ms: Date.now() - dbStart };
		healthy = false;
	}

	// Check Stripe reachability
	const stripeStart = Date.now();
	try {
		const res = await fetch('https://api.stripe.com/v1/', { method: 'HEAD' });
		checks.stripe = {
			status: res.status < 500 ? 'ok' : 'degraded',
			latency_ms: Date.now() - stripeStart
		};
	} catch {
		checks.stripe = { status: 'unreachable', latency_ms: Date.now() - stripeStart };
	}

	return json(
		{
			status: healthy ? 'healthy' : 'degraded',
			timestamp: new Date().toISOString(),
			version: '2.0.0',
			checks
		},
		{ status: healthy ? 200 : 503 }
	);
};
