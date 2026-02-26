import { KIT_API_KEY } from '$env/static/private';

const KIT_API_BASE = 'https://api.convertkit.com/v3';

// Cache tag IDs to reduce API calls
const tagIdCache = new Map<string, number>();

interface KitSubscriber {
	id: number;
	email_address: string;
	state: string;
}

interface KitTag {
	id: number;
	name: string;
}

async function kitFetch(
	path: string,
	options: RequestInit = {},
	queryParams: Record<string, string> = {}
): Promise<Response> {
	const url = new URL(`${KIT_API_BASE}${path}`);
	url.searchParams.set('api_key', KIT_API_KEY);
	for (const [k, v] of Object.entries(queryParams)) {
		url.searchParams.set(k, v);
	}

	return fetch(url.toString(), {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...options.headers
		}
	});
}

async function getOrCreateTag(tagName: string): Promise<number | null> {
	// Check cache first
	const cached = tagIdCache.get(tagName);
	if (cached) return cached;

	try {
		// List existing tags
		const res = await kitFetch('/tags');
		if (!res.ok) {
			console.error('[Kit] Failed to list tags:', res.status);
			return null;
		}

		const data = await res.json();
		const tags: KitTag[] = data.tags ?? [];
		const existing = tags.find((t) => t.name === tagName);

		if (existing) {
			tagIdCache.set(tagName, existing.id);
			return existing.id;
		}

		// Create tag if it doesn't exist
		const createRes = await kitFetch('/tags', {
			method: 'POST',
			body: JSON.stringify({ api_key: KIT_API_KEY, tag: { name: tagName } })
		});

		if (!createRes.ok) {
			console.error('[Kit] Failed to create tag:', createRes.status);
			return null;
		}

		const created = await createRes.json();
		const tagId = created.id ?? created.tag?.id;
		if (tagId) {
			tagIdCache.set(tagName, tagId);
		}
		return tagId ?? null;
	} catch (err) {
		console.error('[Kit] Tag lookup/creation error:', err);
		return null;
	}
}

/**
 * Subscribe an email to Kit and apply tags.
 * All errors are logged but never thrown — this is non-blocking.
 */
export async function subscribeToKit(
	email: string,
	tags: string[],
	firstName?: string
): Promise<void> {
	try {
		const normalizedEmail = email.trim().toLowerCase();

		// Apply tags by subscribing to each tag (v3 API pattern)
		for (const tagName of tags) {
			const tagId = await getOrCreateTag(tagName);
			if (!tagId) continue;

			const body: Record<string, unknown> = {
				api_key: KIT_API_KEY,
				email: normalizedEmail
			};
			if (firstName) {
				body.first_name = firstName;
			}

			const tagRes = await kitFetch(`/tags/${tagId}/subscribe`, {
				method: 'POST',
				body: JSON.stringify(body)
			});

			if (!tagRes.ok) {
				console.error(`[Kit] Failed to tag subscriber with "${tagName}":`, tagRes.status);
			}
		}
	} catch (err) {
		console.error('[Kit] subscribeToKit error:', err);
	}
}

/**
 * Convenience wrapper: subscribes with a source tag + the global "codec8" tag.
 * Fire-and-forget — never blocks the caller.
 */
export function subscribeWithSource(email: string, source: string, firstName?: string): void {
	subscribeToKit(email, ['codec8', source], firstName).catch((err) => {
		console.error('[Kit] subscribeWithSource error:', err);
	});
}
