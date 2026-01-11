import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const CONVERTKIT_API_KEY = 'JkSB5SpOg91dr0OhuhxvSA';
const CONVERTKIT_FORM_ID = '8ab91a364f';

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

		const response = await fetch(
			`https://api.convertkit.com/v3/forms/${CONVERTKIT_FORM_ID}/subscribe`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					api_key: CONVERTKIT_API_KEY,
					email
				})
			}
		);

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			console.error('ConvertKit API error:', errorData);
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
