/**
 * Add-on Checkout API
 *
 * POST - Create a Stripe checkout session for add-on purchases
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createAddonCheckout, ADDON_PRODUCTS, type AddonType } from '$lib/server/stripe';
import { supabaseAdmin } from '$lib/server/supabase';
import { PUBLIC_APP_URL } from '$env/static/public';

export const POST: RequestHandler = async ({ request, cookies }) => {
	// Get user from session
	const sessionCookie = cookies.get('session');
	if (!sessionCookie) {
		throw error(401, 'Unauthorized');
	}

	let userId: string;
	try {
		const session = JSON.parse(sessionCookie);
		userId = session.userId;
	} catch {
		throw error(401, 'Invalid session');
	}

	// Get request body
	const { addonType, teamId, quantity = 1 } = await request.json();

	// Validate addon type
	if (!addonType || !(addonType in ADDON_PRODUCTS)) {
		throw error(400, 'Invalid addon type');
	}

	const addon = ADDON_PRODUCTS[addonType as AddonType];

	// Check if addon requires team
	if (addon.forTeam && !teamId) {
		throw error(400, 'This addon requires a team');
	}

	// Get user email
	const { data: profile } = await supabaseAdmin
		.from('profiles')
		.select('email, subscription_status, subscription_tier')
		.eq('id', userId)
		.single();

	if (!profile) {
		throw error(404, 'User not found');
	}

	// Verify user has an active subscription
	if (profile.subscription_status !== 'active') {
		throw error(400, 'Active subscription required for add-ons');
	}

	// Verify subscription tier supports add-ons
	if (!['pro', 'team'].includes(profile.subscription_tier || '')) {
		throw error(400, 'Pro or Team subscription required for add-ons');
	}

	try {
		const checkoutUrl = await createAddonCheckout({
			userId,
			userEmail: profile.email,
			addonType: addonType as AddonType,
			quantity,
			teamId: teamId || undefined,
			successUrl: `${PUBLIC_APP_URL}/dashboard?addon_success=${addonType}`,
			cancelUrl: `${PUBLIC_APP_URL}/dashboard`
		});

		return json({ success: true, url: checkoutUrl });
	} catch (err) {
		console.error('[Addon Checkout] Error:', err);
		throw error(500, 'Failed to create checkout session');
	}
};
