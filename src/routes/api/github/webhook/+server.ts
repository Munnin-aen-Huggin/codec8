import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabaseAdmin } from '$lib/server/supabase';
import { triggerAutoRegeneration } from '$lib/server/autosync';
import crypto from 'crypto';

/**
 * GitHub Webhook Receiver
 * POST: Receives push events from GitHub and triggers doc regeneration
 *
 * Security: Verifies HMAC-SHA256 signature before processing
 */

// Verify GitHub webhook signature
function verifySignature(payload: string, signature: string, secret: string): boolean {
	const expectedSignature = `sha256=${crypto.createHmac('sha256', secret).update(payload).digest('hex')}`;

	// Use constant-time comparison to prevent timing attacks
	try {
		return crypto.timingSafeEqual(
			Buffer.from(signature),
			Buffer.from(expectedSignature)
		);
	} catch {
		return false;
	}
}

export const POST: RequestHandler = async ({ request }) => {
	// Extract GitHub headers
	const event = request.headers.get('X-GitHub-Event');
	const signature = request.headers.get('X-Hub-Signature-256');
	const deliveryId = request.headers.get('X-GitHub-Delivery');

	console.log(`[Webhook] Received GitHub event: ${event}, delivery: ${deliveryId}`);

	// Must have signature header
	if (!signature) {
		console.warn('[Webhook] Missing signature header');
		throw error(401, 'Missing signature');
	}

	// Get raw body for signature verification
	const payload = await request.text();

	// Parse the payload
	let body: { repository?: { full_name?: string }; ref?: string };
	try {
		body = JSON.parse(payload);
	} catch {
		console.error('[Webhook] Failed to parse payload');
		throw error(400, 'Invalid JSON payload');
	}

	// Handle ping event (GitHub sends this when webhook is created)
	if (event === 'ping') {
		console.log('[Webhook] Ping event received, responding OK');
		return json({ message: 'pong' });
	}

	// Only process push events
	if (event !== 'push') {
		console.log(`[Webhook] Ignoring event type: ${event}`);
		return json({ message: 'Event ignored' });
	}

	// Extract repository full_name from payload
	const fullName = body.repository?.full_name;
	if (!fullName) {
		console.error('[Webhook] Missing repository.full_name in payload');
		throw error(400, 'Missing repository information');
	}

	console.log(`[Webhook] Push event for repository: ${fullName}`);

	// Look up repository by full_name to get webhook_secret
	const { data: repo, error: repoError } = await supabaseAdmin
		.from('repositories')
		.select('id, webhook_secret, auto_sync_enabled, last_synced_at')
		.eq('full_name', fullName)
		.single();

	if (repoError || !repo) {
		console.warn(`[Webhook] Repository not found: ${fullName}`);
		// Return 200 to avoid GitHub retrying
		return json({ message: 'Repository not registered' });
	}

	// Must have webhook secret
	if (!repo.webhook_secret) {
		console.warn(`[Webhook] No webhook secret for repo: ${fullName}`);
		return json({ message: 'Webhook not configured' });
	}

	// Verify HMAC signature
	if (!verifySignature(payload, signature, repo.webhook_secret)) {
		console.error(`[Webhook] Invalid signature for repo: ${fullName}`);
		throw error(401, 'Invalid signature');
	}

	console.log(`[Webhook] Signature verified for: ${fullName}`);

	// Check if auto-sync is enabled
	if (!repo.auto_sync_enabled) {
		console.log(`[Webhook] Auto-sync disabled for: ${fullName}`);
		return json({ message: 'Auto-sync disabled' });
	}

	// Trigger regeneration asynchronously (don't block response)
	// Use setImmediate to process after response is sent
	setImmediate(async () => {
		try {
			await triggerAutoRegeneration(repo.id);
			console.log(`[Webhook] Regeneration triggered for: ${fullName}`);
		} catch (err) {
			console.error(`[Webhook] Regeneration failed for ${fullName}:`, err);
		}
	});

	return json({ message: 'Webhook received', regenerating: true });
};
