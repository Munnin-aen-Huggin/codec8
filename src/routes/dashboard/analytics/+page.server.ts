import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/server/supabase';

export const load: PageServerLoad = async ({ cookies }) => {
	const session = cookies.get('session');
	if (!session) {
		throw redirect(303, '/auth/login');
	}

	let userId: string;
	try {
		const parsed = JSON.parse(session);
		userId = parsed.userId;
	} catch {
		throw redirect(303, '/auth/login');
	}

	if (!userId) {
		throw redirect(303, '/auth/login');
	}

	// Get user profile with subscription info
	const { data: profile, error: profileError } = await supabaseAdmin
		.from('profiles')
		.select('subscription_tier, subscription_status, plan, default_team_id')
		.eq('id', userId)
		.single();

	if (profileError) {
		console.error('[Analytics] Profile fetch error:', profileError);
	}

	const tier = profile?.subscription_tier || profile?.plan || 'free';
	const status = profile?.subscription_status;

	// Check if user has access to analytics
	// Access granted for: Pro, Team, Enterprise, LTD, or DFY tiers with active/trialing status
	const validTiers = ['pro', 'team', 'enterprise', 'ltd', 'dfy'];
	const hasValidTier = validTiers.includes(tier);
	const hasActiveStatus = status === 'active' || status === 'trialing' || tier === 'ltd' || tier === 'dfy';
	const hasAccess = hasValidTier && hasActiveStatus;

	return {
		profile: {
			subscription_tier: tier,
			subscription_status: status,
			default_team_id: profile?.default_team_id
		},
		hasAccess
	};
};
