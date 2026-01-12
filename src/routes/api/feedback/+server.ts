import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabaseAdmin } from '$lib/server/supabase';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const session = cookies.get('session');

	// User ID is optional - allow anonymous feedback
	let userId: string | null = null;
	if (session) {
		try {
			const parsed = JSON.parse(session);
			userId = parsed.userId || null;
		} catch {
			// Invalid session, continue without user
		}
	}

	try {
		const { type, message, page, metadata } = await request.json();

		// Validate required fields
		if (!type || !message) {
			throw error(400, 'Type and message are required');
		}

		// Validate type
		const validTypes = ['bug', 'feature', 'other'];
		if (!validTypes.includes(type)) {
			throw error(400, 'Invalid feedback type');
		}

		// Validate message length
		if (message.length > 5000) {
			throw error(400, 'Message is too long (max 5000 characters)');
		}

		// Insert feedback
		const { data, error: insertError } = await supabaseAdmin
			.from('feedback')
			.insert({
				user_id: userId,
				type,
				message,
				page: page || null,
				metadata: metadata || null,
				created_at: new Date().toISOString()
			})
			.select()
			.single();

		if (insertError) {
			console.error('Feedback insert error:', insertError);
			throw error(500, 'Failed to save feedback');
		}

		return json({
			success: true,
			message: 'Thank you for your feedback!'
		});
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		console.error('Feedback error:', err);
		throw error(500, 'An unexpected error occurred');
	}
};
