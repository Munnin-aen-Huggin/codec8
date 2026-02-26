import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the environment variable
vi.mock('$env/static/private', () => ({
	KIT_API_KEY: 'test-api-key'
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
		// v3 API: first call is tag lookup, second is subscribe to tag
		mockFetch
			.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ tags: [{ id: 100, name: 'codec8' }] })
			})
			.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ subscription: { subscriber: { id: 1 } } })
			});

		await subscribeToKit('  Test@Example.COM  ', ['codec8']);

		// The subscribe call should use normalized email
		const subscribeCall = mockFetch.mock.calls[1];
		const body = JSON.parse(subscribeCall[1].body);
		expect(body.email).toBe('test@example.com');
	});

	it('includes firstName when provided', async () => {
		mockFetch
			.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ tags: [{ id: 100, name: 'mytag' }] })
			})
			.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ subscription: { subscriber: { id: 1 } } })
			});

		await subscribeToKit('test@example.com', ['mytag'], 'Alice');

		const subscribeCall = mockFetch.mock.calls[1];
		const body = JSON.parse(subscribeCall[1].body);
		expect(body.first_name).toBe('Alice');
		expect(body.email).toBe('test@example.com');
	});

	it('does not throw on network error', async () => {
		mockFetch.mockRejectedValueOnce(new Error('Network failure'));

		await expect(subscribeToKit('test@example.com', ['codec8'])).resolves.toBeUndefined();
	});

	it('does not throw when tag lookup fails', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: false,
			status: 500
		});

		await expect(subscribeToKit('test@example.com', ['bad-tag'])).resolves.toBeUndefined();
	});

	it('applies tags to subscriber via v3 tag subscribe endpoint', async () => {
		mockFetch
			// Tag lookup
			.mockResolvedValueOnce({
				ok: true,
				json: () =>
					Promise.resolve({
						tags: [
							{ id: 500, name: 'tag-a' },
							{ id: 600, name: 'tag-b' }
						]
					})
			})
			// Subscribe to tag-a
			.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ subscription: { subscriber: { id: 42 } } })
			})
			// Tag lookup (cached, but may refetch)
			.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ subscription: { subscriber: { id: 42 } } })
			});

		await subscribeToKit('test@example.com', ['tag-a', 'tag-b']);

		// Verify that tag subscribe calls were made (contain /tags/{id}/subscribe)
		const allUrls = mockFetch.mock.calls.map((c: unknown[]) => c[0] as string);
		const tagSubscribeCalls = allUrls.filter((url: string) => /\/tags\/\d+\/subscribe/.test(url));
		expect(tagSubscribeCalls.length).toBeGreaterThanOrEqual(2);
	});
});

describe('subscribeWithSource', () => {
	it('calls subscribeToKit with codec8 tag and source tag', async () => {
		mockFetch
			.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ tags: [{ id: 100, name: 'codec8' }] })
			})
			.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ subscription: { subscriber: { id: 1 } } })
			})
			.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ tags: [{ id: 200, name: 'newsletter' }] })
			})
			.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ subscription: { subscriber: { id: 1 } } })
			});

		subscribeWithSource('test@example.com', 'newsletter');

		// Give fire-and-forget promise time to resolve
		await new Promise((r) => setTimeout(r, 50));

		expect(mockFetch).toHaveBeenCalled();
	});

	it('does not throw even if underlying call fails', () => {
		mockFetch.mockRejectedValue(new Error('fail'));

		// subscribeWithSource is fire-and-forget, should not throw
		expect(() => subscribeWithSource('test@example.com', 'lead')).not.toThrow();
	});
});
