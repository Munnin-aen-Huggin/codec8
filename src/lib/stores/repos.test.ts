import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { repos, connectedRepoIds, availableNotConnected, connectedCount } from './repos';
import type { Repository } from '$lib/types';
import type { GitHubRepo } from '$lib/server/github';

// Mock GitHubRepo for testing
const createMockGitHubRepo = (overrides: Partial<GitHubRepo> = {}): GitHubRepo => ({
	id: 12345,
	name: 'test-repo',
	full_name: 'user/test-repo',
	private: false,
	description: 'A test repository',
	language: 'TypeScript',
	default_branch: 'main',
	html_url: 'https://github.com/user/test-repo',
	updated_at: '2024-01-01T00:00:00Z',
	stargazers_count: 10,
	...overrides
});

// Mock Repository for testing
const createMockRepository = (overrides: Partial<Repository> = {}): Repository => ({
	id: 'repo-uuid-123',
	user_id: 'user-uuid-456',
	github_repo_id: 12345,
	name: 'test-repo',
	full_name: 'user/test-repo',
	private: false,
	default_branch: 'main',
	...overrides
});

describe('Repos Store', () => {
	beforeEach(() => {
		repos.reset();
	});

	describe('initial state', () => {
		it('should start with empty available array', () => {
			const state = get(repos);
			expect(state.available).toEqual([]);
		});

		it('should start with empty connected array', () => {
			const state = get(repos);
			expect(state.connected).toEqual([]);
		});

		it('should have loading false initially', () => {
			const state = get(repos);
			expect(state.loading).toBe(false);
		});

		it('should have error null initially', () => {
			const state = get(repos);
			expect(state.error).toBe(null);
		});
	});

	describe('setAvailable', () => {
		it('should set available repos array correctly', () => {
			const mockRepos = [
				createMockGitHubRepo({ id: 1, name: 'repo-1' }),
				createMockGitHubRepo({ id: 2, name: 'repo-2' })
			];
			repos.setAvailable(mockRepos);

			const state = get(repos);
			expect(state.available).toHaveLength(2);
			expect(state.available[0].name).toBe('repo-1');
			expect(state.available[1].name).toBe('repo-2');
		});

		it('should replace existing available repos', () => {
			repos.setAvailable([createMockGitHubRepo({ id: 1 })]);
			repos.setAvailable([createMockGitHubRepo({ id: 2 })]);

			const state = get(repos);
			expect(state.available).toHaveLength(1);
			expect(state.available[0].id).toBe(2);
		});

		it('should set loading to false', () => {
			repos.setLoading(true);
			repos.setAvailable([]);

			const state = get(repos);
			expect(state.loading).toBe(false);
		});

		it('should clear error', () => {
			repos.setError('Previous error');
			repos.setAvailable([]);

			const state = get(repos);
			expect(state.error).toBe(null);
		});
	});

	describe('setConnected', () => {
		it('should set connected repos array correctly', () => {
			const mockRepos = [
				createMockRepository({ id: 'a', name: 'repo-a' }),
				createMockRepository({ id: 'b', name: 'repo-b' })
			];
			repos.setConnected(mockRepos);

			const state = get(repos);
			expect(state.connected).toHaveLength(2);
		});

		it('should replace existing connected repos', () => {
			repos.setConnected([createMockRepository({ id: 'old' })]);
			repos.setConnected([createMockRepository({ id: 'new' })]);

			const state = get(repos);
			expect(state.connected).toHaveLength(1);
			expect(state.connected[0].id).toBe('new');
		});
	});

	describe('addConnected', () => {
		it('should add repo to existing connected list', () => {
			repos.setConnected([createMockRepository({ id: 'existing' })]);
			repos.addConnected(createMockRepository({ id: 'new' }));

			const state = get(repos);
			expect(state.connected).toHaveLength(2);
		});

		it('should handle first repo added', () => {
			repos.addConnected(createMockRepository({ id: 'first' }));

			const state = get(repos);
			expect(state.connected).toHaveLength(1);
			expect(state.connected[0].id).toBe('first');
		});

		it('should add to end of list', () => {
			repos.setConnected([
				createMockRepository({ id: 'a' }),
				createMockRepository({ id: 'b' })
			]);
			repos.addConnected(createMockRepository({ id: 'c' }));

			const state = get(repos);
			expect(state.connected[2].id).toBe('c');
		});
	});

	describe('removeConnected', () => {
		it('should remove repo by ID', () => {
			repos.setConnected([
				createMockRepository({ id: 'keep' }),
				createMockRepository({ id: 'remove' })
			]);
			repos.removeConnected('remove');

			const state = get(repos);
			expect(state.connected).toHaveLength(1);
			expect(state.connected[0].id).toBe('keep');
		});

		it('should handle non-existent ID gracefully', () => {
			repos.setConnected([createMockRepository({ id: 'exists' })]);
			repos.removeConnected('non-existent');

			const state = get(repos);
			expect(state.connected).toHaveLength(1);
		});

		it('should maintain other repos', () => {
			repos.setConnected([
				createMockRepository({ id: 'a' }),
				createMockRepository({ id: 'b' }),
				createMockRepository({ id: 'c' })
			]);
			repos.removeConnected('b');

			const state = get(repos);
			expect(state.connected).toHaveLength(2);
			expect(state.connected[0].id).toBe('a');
			expect(state.connected[1].id).toBe('c');
		});

		it('should handle removing from empty list', () => {
			repos.removeConnected('any-id');

			const state = get(repos);
			expect(state.connected).toEqual([]);
		});
	});

	describe('setLoading', () => {
		it('should set loading to true', () => {
			repos.setLoading(true);

			const state = get(repos);
			expect(state.loading).toBe(true);
		});

		it('should set loading to false', () => {
			repos.setLoading(true);
			repos.setLoading(false);

			const state = get(repos);
			expect(state.loading).toBe(false);
		});

		it('should not affect repos arrays', () => {
			repos.setConnected([createMockRepository()]);
			repos.setLoading(true);

			const state = get(repos);
			expect(state.connected).toHaveLength(1);
		});
	});

	describe('setError', () => {
		it('should set error message', () => {
			repos.setError('Something went wrong');

			const state = get(repos);
			expect(state.error).toBe('Something went wrong');
		});

		it('should clear error with null', () => {
			repos.setError('Error');
			repos.setError(null);

			const state = get(repos);
			expect(state.error).toBe(null);
		});

		it('should set loading to false', () => {
			repos.setLoading(true);
			repos.setError('Error');

			const state = get(repos);
			expect(state.loading).toBe(false);
		});
	});

	describe('reset', () => {
		it('should reset all state to initial values', () => {
			repos.setAvailable([createMockGitHubRepo()]);
			repos.setConnected([createMockRepository()]);
			repos.setLoading(true);
			repos.setError('Error');

			repos.reset();

			const state = get(repos);
			expect(state.available).toEqual([]);
			expect(state.connected).toEqual([]);
			expect(state.loading).toBe(false);
			expect(state.error).toBe(null);
		});
	});
});

describe('connectedRepoIds derived store', () => {
	beforeEach(() => {
		repos.reset();
	});

	it('should return empty Set when no connected repos', () => {
		const ids = get(connectedRepoIds);
		expect(ids.size).toBe(0);
	});

	it('should contain github_repo_id of connected repos', () => {
		repos.setConnected([
			createMockRepository({ github_repo_id: 100 }),
			createMockRepository({ github_repo_id: 200 })
		]);

		const ids = get(connectedRepoIds);
		expect(ids.has(100)).toBe(true);
		expect(ids.has(200)).toBe(true);
	});

	it('should update when connected repos change', () => {
		repos.setConnected([createMockRepository({ github_repo_id: 100 })]);
		repos.addConnected(createMockRepository({ github_repo_id: 200 }));

		const ids = get(connectedRepoIds);
		expect(ids.size).toBe(2);
	});
});

describe('availableNotConnected derived store', () => {
	beforeEach(() => {
		repos.reset();
	});

	it('should return all available when none connected', () => {
		repos.setAvailable([
			createMockGitHubRepo({ id: 1 }),
			createMockGitHubRepo({ id: 2 })
		]);

		const available = get(availableNotConnected);
		expect(available).toHaveLength(2);
	});

	it('should filter out connected repos', () => {
		repos.setAvailable([
			createMockGitHubRepo({ id: 1 }),
			createMockGitHubRepo({ id: 2 }),
			createMockGitHubRepo({ id: 3 })
		]);
		repos.setConnected([
			createMockRepository({ github_repo_id: 2 })
		]);

		const available = get(availableNotConnected);
		expect(available).toHaveLength(2);
		expect(available.find((r) => r.id === 2)).toBeUndefined();
	});

	it('should return empty when all available are connected', () => {
		repos.setAvailable([createMockGitHubRepo({ id: 1 })]);
		repos.setConnected([createMockRepository({ github_repo_id: 1 })]);

		const available = get(availableNotConnected);
		expect(available).toHaveLength(0);
	});
});

describe('connectedCount derived store', () => {
	beforeEach(() => {
		repos.reset();
	});

	it('should return 0 when no connected repos', () => {
		expect(get(connectedCount)).toBe(0);
	});

	it('should return correct count', () => {
		repos.setConnected([
			createMockRepository({ id: 'a' }),
			createMockRepository({ id: 'b' }),
			createMockRepository({ id: 'c' })
		]);

		expect(get(connectedCount)).toBe(3);
	});

	it('should update when repos added', () => {
		repos.setConnected([createMockRepository()]);
		repos.addConnected(createMockRepository({ id: 'new' }));

		expect(get(connectedCount)).toBe(2);
	});

	it('should update when repos removed', () => {
		repos.setConnected([
			createMockRepository({ id: 'a' }),
			createMockRepository({ id: 'b' })
		]);
		repos.removeConnected('a');

		expect(get(connectedCount)).toBe(1);
	});
});
