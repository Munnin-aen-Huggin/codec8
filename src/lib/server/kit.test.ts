import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the environment variable
vi.mock('$env/static/private', () => ({
	KIT_API_SECRET: 'test-api-secret'
}));

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Import after mocks are set up
const { subscribeToKit, subscribeWithSource } = await import('./kit');

beforeEach(() => {
	mockFetch.mockReset();
});

describe('subscribeToKit', () => {
	it('normalizes email to lowercase and trimmed', async () => {
		mockFetch
			.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ subscriber: { id: 1 } })
			})
			.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ tags: [{ id: 100, name: 'codec8' }] })
			})
			.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });

		await subscribeToKit('  Test@Example.COM  ', ['codec8']);

		const subscriberCall = mockFetch.mock.calls[0];
		const body = JSON.parse(subscriberCall[1].body);
		expect(body.email_address).toBe('test@example.com');
	});

	it('includes firstName when provided', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ subscriber: { id: 1 } })
		});

		await subscribeToKit('test@example.com', [], 'Alice');

		const subscriberCall = mockFetch.mock.calls[0];
		const body = JSON.parse(subscriberCall[1].body);
		expect(body.first_name).toBe('Alice');
		expect(body.email_address).toBe('test@example.com');
	});

	it('does not throw on subscriber creation failure', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: false,
			status: 500,
			text: () => Promise.resolve('Internal Server Error')
		});

		// Should not throw
		await expect(subscribeToKit('test@example.com', ['codec8'])).resolves.toBeUndefined();
	});

	it('does not throw on network error', async () => {
		mockFetch.mockRejectedValueOnce(new Error('Network failure'));

		await expect(subscribeToKit('test@example.com', ['codec8'])).resolves.toBeUndefined();
	});

	it('does not throw when tag creation fails', async () => {
		mockFetch
			.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ subscriber: { id: 1 } })
			})
			.mockResolvedValueOnce({
				ok: false,
				status: 500
			});

		await expect(subscribeToKit('test@example.com', ['bad-tag'])).resolves.toBeUndefined();
	});

	it('applies tags to subscriber', async () => {
		// Use unique tag names to avoid cache interference from prior tests
		mockFetch
			// Create subscriber
			.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ subscriber: { id: 42 } })
			})
			// Remaining calls: tag lookups and applications (order depends on cache)
			.mockResolvedValue({
				ok: true,
				json: () =>
					Promise.resolve({
						tags: [
							{ id: 500, name: 'tag-a' },
							{ id: 600, name: 'tag-b' }
						]
					})
			});

		await subscribeToKit('test@example.com', ['tag-a', 'tag-b']);

		// Verify that tag application calls were made (contain /tags/{id}/subscribers)
		const allUrls = mockFetch.mock.calls.map((c: unknown[]) => c[0] as string);
		const tagApplicationCalls = allUrls.filter((url: string) => /\/tags\/\d+\/subscribers/.test(url));
		expect(tagApplicationCalls.length).toBeGreaterThanOrEqual(2);
	});
});

describe('subscribeWithSource', () => {
	it('calls subscribeToKit with codec8 tag and source tag', async () => {
		mockFetch
			.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ subscriber: { id: 1 } })
			})
			.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ tags: [{ id: 100, name: 'codec8' }] })
			})
			.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })
			.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ tags: [{ id: 200, name: 'newsletter' }] })
			})
			.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });

		subscribeWithSource('test@example.com', 'newsletter');

		// Give fire-and-forget promise time to resolve
		await new Promise((r) => setTimeout(r, 50));

		expect(mockFetch).toHaveBeenCalled();
		const subscriberCall = mockFetch.mock.calls[0];
		const body = JSON.parse(subscriberCall[1].body);
		expect(body.email_address).toBe('test@example.com');
	});

	it('does not throw even if underlying call fails', () => {
		mockFetch.mockRejectedValue(new Error('fail'));

		// subscribeWithSource is fire-and-forget, should not throw
		expect(() => subscribeWithSource('test@example.com', 'lead')).not.toThrow();
	});
});
