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
		return json({ success: false, message: 'Please log in to continue' }, { status: 401 });
	}

	let userId: string;
	try {
		const session = JSON.parse(sessionCookie);
		userId = session.userId;
		if (!userId) {
			return json({ success: false, message: 'Invalid session' }, { status: 401 });
		}
	} catch {
		return json({ success: false, message: 'Invalid session format' }, { status: 401 });
	}

	// Get request body
	let body;
	try {
		body = await request.json();
	} catch {
		return json({ success: false, message: 'Invalid request body' }, { status: 400 });
	}

	const { addonType, teamId, quantity = 1 } = body;

	// Validate addon type
	if (!addonType || !(addonType in ADDON_PRODUCTS)) {
		return json({ success: false, message: `Invalid addon type: ${addonType}` }, { status: 400 });
	}

	// Validate quantity
	const qty = parseInt(String(quantity), 10);
	if (isNaN(qty) || qty < 1 || qty > 100) {
		return json({ success: false, message: 'Quantity must be between 1 and 100' }, { status: 400 });
	}

	const addon = ADDON_PRODUCTS[addonType as AddonType];

	// Check if addon requires team
	if (addon.forTeam && !teamId) {
		return json({ success: false, message: 'This addon requires a team. Please ensure you have a team set up.' }, { status: 400 });
	}

	// Get user profile
	const { data: profile, error: profileError } = await supabaseAdmin
		.from('profiles')
		.select('email, subscription_status, subscription_tier, default_team_id')
		.eq('id', userId)
		.single();

	if (profileError || !profile) {
		console.error('[Addon Checkout] Profile error:', profileError);
		return json({ success: false, message: 'User not found' }, { status: 404 });
	}

	// Verify user has an active subscription
	if (profile.subscription_status !== 'active' && profile.subscription_status !== 'trialing') {
		return json({ success: false, message: 'Active subscription required for add-ons' }, { status: 400 });
	}

	// Verify subscription tier supports add-ons
	if (!['pro', 'team', 'enterprise'].includes(profile.subscription_tier || '')) {
		return json({ success: false, message: 'Pro, Team, or Enterprise subscription required for add-ons' }, { status: 400 });
	}

	// Enterprise tier has add-ons included
	if (profile.subscription_tier === 'enterprise') {
		return json({ success: false, message: 'Enterprise plan includes all add-ons. No purchase needed.' }, { status: 400 });
	}

	// For team addons, use provided teamId or fall back to user's default team
	const effectiveTeamId = addon.forTeam ? (teamId || profile.default_team_id) : undefined;
	if (addon.forTeam && !effectiveTeamId) {
		return json({ success: false, message: 'No team found. Please set up a team first.' }, { status: 400 });
	}

	// Check if price ID is configured
	if (!addon.priceId || addon.priceId.includes('placeholder')) {
		console.error(`[Addon Checkout] Price ID not configured for addon: ${addonType}`);
		return json({ success: false, message: 'This add-on is not yet available for purchase' }, { status: 503 });
	}

	try {
		console.log(`[Addon Checkout] Creating checkout for user ${userId}, addon: ${addonType}, qty: ${qty}, team: ${effectiveTeamId}`);

		const checkoutUrl = await createAddonCheckout({
			userId,
			userEmail: profile.email,
			addonType: addonType as AddonType,
			quantity: qty,
			teamId: effectiveTeamId,
			successUrl: `${PUBLIC_APP_URL}/dashboard?addon_success=${addonType}`,
			cancelUrl: `${PUBLIC_APP_URL}/dashboard`
		});

		if (!checkoutUrl) {
			console.error('[Addon Checkout] No checkout URL returned');
			return json({ success: false, message: 'Failed to create checkout session' }, { status: 500 });
		}

		console.log(`[Addon Checkout] Checkout URL created successfully`);
		return json({ success: true, url: checkoutUrl });
	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : 'Unknown error';
		console.error('[Addon Checkout] Error:', errorMessage, err);
		return json({ success: false, message: `Checkout failed: ${errorMessage}` }, { status: 500 });
	}
};
