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

	// Get user profile
	const { data: profile } = await supabaseAdmin
		.from('profiles')
		.select('subscription_tier, plan, default_team_id')
		.eq('id', userId)
		.single();

	const tier = profile?.subscription_tier || profile?.plan || 'free';

	// Check if user has access to analytics (Pro, Team, LTD, or DFY)
	const hasAccess = ['pro', 'team', 'ltd', 'dfy'].includes(tier);

	return {
		profile: {
			subscription_tier: tier,
			default_team_id: profile?.default_team_id
		},
		hasAccess
	};
};
