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
		.select('subscription_tier, default_team_id')
		.eq('id', userId)
		.single();

	// Team tier required for templates
	if (profile?.subscription_tier !== 'team') {
		throw redirect(303, '/dashboard?upgrade=templates');
	}

	if (!profile?.default_team_id) {
		throw redirect(303, '/dashboard?error=no_team');
	}

	return {
		profile: {
			subscription_tier: profile.subscription_tier,
			default_team_id: profile.default_team_id
		}
	};
};
