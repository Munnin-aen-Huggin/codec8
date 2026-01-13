import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the $app/environment module
vi.mock('$app/environment', () => ({
	browser: true
}));

// Create a mock localStorage
const createMockLocalStorage = () => {
	let store: Record<string, string> = {};
	return {
		getItem: vi.fn((key: string) => store[key] || null),
		setItem: vi.fn((key: string, value: string) => {
			store[key] = value;
		}),
		removeItem: vi.fn((key: string) => {
			delete store[key];
		}),
		clear: vi.fn(() => {
			store = {};
		}),
		get length() {
			return Object.keys(store).length;
		},
		key: vi.fn((index: number) => Object.keys(store)[index] || null)
	};
};

describe('Analytics Store', () => {
	let mockLocalStorage: ReturnType<typeof createMockLocalStorage>;

	beforeEach(() => {
		// Setup mock localStorage
		mockLocalStorage = createMockLocalStorage();
		vi.stubGlobal('localStorage', mockLocalStorage);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.resetModules();
	});

	describe('generateAnonymousId format', () => {
		it('should generate ID in UUID v4 format', async () => {
			// Import fresh module
			const { anonymousId } = await import('./analytics');

			// Get the ID
			const id = anonymousId.get();

			// UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
			const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
			expect(id).toMatch(uuidV4Regex);
		});

		it('should have correct length (36 characters)', async () => {
			const { anonymousId } = await import('./analytics');
			const id = anonymousId.get();
			expect(id.length).toBe(36);
		});
	});

	describe('localStorage persistence', () => {
		it('should store ID in localStorage on first access', async () => {
			const { anonymousId } = await import('./analytics');

			// Get the ID to trigger storage
			anonymousId.get();

			// Should have called setItem with the storage key
			expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
				'codedoc_anonymous_id',
				expect.any(String)
			);
		});

		it('should retrieve existing ID from localStorage', async () => {
			// Pre-set an ID in localStorage
			const existingId = 'existing-uuid-1234';
			mockLocalStorage.getItem.mockReturnValue(existingId);

			const { anonymousId } = await import('./analytics');
			const id = anonymousId.get();

			expect(id).toBe(existingId);
		});

		it('should not overwrite existing ID', async () => {
			// Pre-set an ID in localStorage
			const existingId = 'preserved-uuid-5678';
			mockLocalStorage.getItem.mockReturnValue(existingId);

			const { anonymousId } = await import('./analytics');

			// Access multiple times
			anonymousId.get();
			anonymousId.get();
			anonymousId.get();

			// setItem should not be called since ID already exists
			// (Note: It's called once during module init if ID doesn't exist)
			const setItemCalls = mockLocalStorage.setItem.mock.calls.filter(
				(call) => call[0] === 'codedoc_anonymous_id'
			);
			expect(setItemCalls.length).toBe(0);
		});
	});

	describe('getAnonymousId function', () => {
		it('should return stored ID', async () => {
			const storedId = 'function-test-uuid';
			mockLocalStorage.getItem.mockReturnValue(storedId);

			const { getAnonymousId } = await import('./analytics');
			const id = getAnonymousId();

			expect(id).toBe(storedId);
		});

		it('should return empty string when no ID stored', async () => {
			mockLocalStorage.getItem.mockReturnValue(null);

			const { getAnonymousId } = await import('./analytics');
			const id = getAnonymousId();

			expect(id).toBe('');
		});
	});

	describe('anonymousId store', () => {
		it('should be subscribable', async () => {
			const { anonymousId } = await import('./analytics');
			expect(typeof anonymousId.subscribe).toBe('function');
		});

		it('should have a get method', async () => {
			const { anonymousId } = await import('./analytics');
			expect(typeof anonymousId.get).toBe('function');
		});
	});
});

describe('Analytics Store - Server Side', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('should return empty string when not in browser', async () => {
		// Mock browser as false
		vi.doMock('$app/environment', () => ({
			browser: false
		}));

		const { getAnonymousId } = await import('./analytics');
		const id = getAnonymousId();

		expect(id).toBe('');
	});
});
