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

	let tier = profile?.subscription_tier || profile?.plan || 'free';
	let status = profile?.subscription_status;
	let effectiveTeamId = profile?.default_team_id;

	// If user doesn't have their own subscription, check if they're a team member
	const validTiers = ['pro', 'team', 'enterprise', 'ltd', 'dfy'];
	if (!validTiers.includes(tier)) {
		// Check team membership
		const { data: membership } = await supabaseAdmin
			.from('team_members')
			.select('team_id, role, teams(owner_id)')
			.eq('user_id', userId)
			.eq('status', 'active')
			.single();

		if (membership && membership.teams) {
			effectiveTeamId = membership.team_id;
			// Get team owner's subscription info
			const teamOwner = membership.teams as { owner_id: string };
			const { data: ownerProfile } = await supabaseAdmin
				.from('profiles')
				.select('subscription_tier, subscription_status')
				.eq('id', teamOwner.owner_id)
				.single();

			if (ownerProfile) {
				tier = ownerProfile.subscription_tier || tier;
				status = ownerProfile.subscription_status || status;
				console.log(`[Analytics] User ${userId} inherits tier ${tier} from team owner ${teamOwner.owner_id}`);
			}
		}
	}

	// Check if user has access to analytics
	// Access granted for: Pro, Team, Enterprise, LTD, or DFY tiers with active/trialing status
	const hasValidTier = validTiers.includes(tier);
	const hasActiveStatus = status === 'active' || status === 'trialing' || tier === 'ltd' || tier === 'dfy';
	const hasAccess = hasValidTier && hasActiveStatus;

	return {
		profile: {
			subscription_tier: tier,
			subscription_status: status,
			default_team_id: effectiveTeamId || profile?.default_team_id
		},
		hasAccess
	};
};
