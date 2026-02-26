import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabaseAdmin } from '$lib/server/supabase';
import { trackBetaSignup } from '$lib/utils/analytics';
import { subscribeWithSource } from '$lib/server/kit';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { name, email, githubUsername, useCase } = await request.json();

		// Validate required fields
		if (!name || !email || !githubUsername) {
			throw error(400, 'Name, email, and GitHub username are required');
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			throw error(400, 'Invalid email format');
		}

		// Check if already signed up
		const { data: existing } = await supabaseAdmin
			.from('beta_signups')
			.select('id')
			.or(`email.eq.${email},github_username.eq.${githubUsername}`)
			.single();

		if (existing) {
			throw error(400, 'You have already signed up for the beta program');
		}

		// Insert beta signup
		const { data, error: insertError } = await supabaseAdmin
			.from('beta_signups')
			.insert({
				name,
				email: email.toLowerCase(),
				github_username: githubUsername.toLowerCase(),
				use_case: useCase || null,
				signed_up_at: new Date().toISOString()
			})
			.select()
			.single();

		if (insertError) {
			console.error('Beta signup error:', insertError);
			throw error(500, 'Failed to save signup. Please try again.');
		}

		// Sync to Kit (fire and forget)
		subscribeWithSource(email, 'beta', name);

		// Track analytics event
		trackBetaSignup(email);

		return json({
			success: true,
			message: 'Successfully signed up for beta program'
		});
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		console.error('Beta signup error:', err);
		throw error(500, 'An unexpected error occurred');
	}
};

export const GET: RequestHandler = async ({ cookies }) => {
	// Admin-only endpoint to list beta signups
	const session = cookies.get('session');
	if (!session) {
		throw error(401, 'Unauthorized');
	}

	try {
		const { userId } = JSON.parse(session);

		// Check if user is admin (you may want to add an is_admin field to profiles)
		const { data: profile } = await supabaseAdmin
			.from('profiles')
			.select('plan')
			.eq('id', userId)
			.single();

		// Only DFY tier users can view beta signups (as admins)
		if (!profile || profile.plan !== 'dfy') {
			throw error(403, 'Forbidden');
		}

		const { data: signups, error: fetchError } = await supabaseAdmin
			.from('beta_signups')
			.select('*')
			.order('signed_up_at', { ascending: false });

		if (fetchError) {
			throw error(500, 'Failed to fetch signups');
		}

		return json({ signups });
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		console.error('Error fetching beta signups:', err);
		throw error(500, 'An unexpected error occurred');
	}
};
