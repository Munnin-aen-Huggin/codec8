import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { auth, isAuthenticated, isPaid } from './auth';
import type { User } from '$lib/types';

// Mock user for testing
const createMockUser = (overrides: Partial<User> = {}): User => ({
	id: 'user-123',
	email: 'test@example.com',
	github_username: 'testuser',
	plan: 'free',
	...overrides
});

describe('Auth Store', () => {
	beforeEach(() => {
		// Reset to initial state
		auth.logout();
	});

	describe('initial state', () => {
		it('should start with null user after logout', () => {
			const state = get(auth);
			expect(state.user).toBe(null);
		});

		it('should have loading false after logout', () => {
			const state = get(auth);
			expect(state.loading).toBe(false);
		});
	});

	describe('setUser', () => {
		it('should set user correctly', () => {
			const mockUser = createMockUser();
			auth.setUser(mockUser);

			const state = get(auth);
			expect(state.user).toEqual(mockUser);
		});

		it('should set loading to false when user is set', () => {
			auth.setLoading(true);
			auth.setUser(createMockUser());

			const state = get(auth);
			expect(state.loading).toBe(false);
		});

		it('should handle user with all required fields', () => {
			const fullUser = createMockUser({
				id: 'full-user-id',
				email: 'full@test.com',
				github_username: 'fulluser',
				plan: 'pro',
				created_at: '2024-01-01T00:00:00Z'
			});
			auth.setUser(fullUser);

			const state = get(auth);
			expect(state.user?.id).toBe('full-user-id');
			expect(state.user?.email).toBe('full@test.com');
			expect(state.user?.github_username).toBe('fulluser');
			expect(state.user?.plan).toBe('pro');
		});

		it('should handle setting null user', () => {
			auth.setUser(createMockUser());
			auth.setUser(null);

			const state = get(auth);
			expect(state.user).toBe(null);
		});
	});

	describe('logout', () => {
		it('should clear user to null', () => {
			auth.setUser(createMockUser());
			auth.logout();

			const state = get(auth);
			expect(state.user).toBe(null);
		});

		it('should set loading to false', () => {
			auth.setLoading(true);
			auth.logout();

			const state = get(auth);
			expect(state.loading).toBe(false);
		});
	});

	describe('setLoading', () => {
		it('should set loading to true', () => {
			auth.setLoading(true);

			const state = get(auth);
			expect(state.loading).toBe(true);
		});

		it('should set loading to false', () => {
			auth.setLoading(true);
			auth.setLoading(false);

			const state = get(auth);
			expect(state.loading).toBe(false);
		});

		it('should not affect user state', () => {
			const mockUser = createMockUser();
			auth.setUser(mockUser);
			auth.setLoading(true);

			const state = get(auth);
			expect(state.user).toEqual(mockUser);
		});
	});

	describe('state transitions', () => {
		it('should allow setting user after logout', () => {
			auth.logout();
			const mockUser = createMockUser();
			auth.setUser(mockUser);

			const state = get(auth);
			expect(state.user).toEqual(mockUser);
		});

		it('should allow logout after setting user', () => {
			auth.setUser(createMockUser());
			auth.logout();

			const state = get(auth);
			expect(state.user).toBe(null);
		});

		it('should allow multiple user changes', () => {
			const user1 = createMockUser({ id: 'user-1' });
			const user2 = createMockUser({ id: 'user-2' });

			auth.setUser(user1);
			expect(get(auth).user?.id).toBe('user-1');

			auth.setUser(user2);
			expect(get(auth).user?.id).toBe('user-2');
		});
	});
});

describe('isAuthenticated derived store', () => {
	beforeEach(() => {
		auth.logout();
	});

	it('should return false when user is null', () => {
		expect(get(isAuthenticated)).toBe(false);
	});

	it('should return true when user is set', () => {
		auth.setUser(createMockUser());
		expect(get(isAuthenticated)).toBe(true);
	});

	it('should return false after logout', () => {
		auth.setUser(createMockUser());
		auth.logout();
		expect(get(isAuthenticated)).toBe(false);
	});
});

describe('isPaid derived store', () => {
	beforeEach(() => {
		auth.logout();
	});

	it('should return false when user is null', () => {
		expect(get(isPaid)).toBe(false);
	});

	it('should return false for free plan', () => {
		auth.setUser(createMockUser({ plan: 'free' }));
		expect(get(isPaid)).toBe(false);
	});

	it('should return true for ltd plan', () => {
		auth.setUser(createMockUser({ plan: 'ltd' }));
		expect(get(isPaid)).toBe(true);
	});

	it('should return true for pro plan', () => {
		auth.setUser(createMockUser({ plan: 'pro' }));
		expect(get(isPaid)).toBe(true);
	});

	it('should return true for dfy plan', () => {
		auth.setUser(createMockUser({ plan: 'dfy' }));
		expect(get(isPaid)).toBe(true);
	});
});
