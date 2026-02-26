import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabase';
import type { RequestHandler } from './$types';
import { subscribeWithSource } from '$lib/server/kit';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { email } = await request.json();

		if (!email || typeof email !== 'string') {
			return json({ success: false, message: 'Email is required' }, { status: 400 });
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return json({ success: false, message: 'Invalid email format' }, { status: 400 });
		}

		// Insert email into Supabase email_signups table
		const { error } = await supabaseAdmin
			.from('email_signups')
			.insert({
				email: email.toLowerCase().trim(),
				source: 'landing_page'
			});

		// Sync to Kit (fire and forget)
		subscribeWithSource(email.toLowerCase().trim(), 'newsletter');

		// Handle duplicate emails gracefully - if it's a duplicate, still return success
		if (error) {
			// Postgres unique constraint violation code is 23505
			if (error.code === '23505') {
				return json({ success: true, message: 'You are already subscribed!' });
			}

			console.error('Supabase insert error:', error);
			return json(
				{ success: false, message: 'Failed to subscribe. Please try again.' },
				{ status: 500 }
			);
		}

		return json({ success: true, message: 'Successfully subscribed!' });
	} catch (error) {
		console.error('Subscribe endpoint error:', error);
		return json(
			{ success: false, message: 'An error occurred. Please try again.' },
			{ status: 500 }
		);
	}
};
