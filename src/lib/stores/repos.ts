import { writable, derived } from 'svelte/store';
import type { Repository } from '$lib/types';
import type { GitHubRepo } from '$lib/server/github';

interface ReposState {
  available: GitHubRepo[];
  connected: Repository[];
  loading: boolean;
  error: string | null;
}

function createReposStore() {
  const { subscribe, set, update } = writable<ReposState>({
    available: [],
    connected: [],
    loading: false,
    error: null
  });

  return {
    subscribe,
    setAvailable: (repos: GitHubRepo[]) =>
      update((s) => ({ ...s, available: repos, loading: false, error: null })),
    setConnected: (repos: Repository[]) =>
      update((s) => ({ ...s, connected: repos, loading: false, error: null })),
    addConnected: (repo: Repository) =>
      update((s) => ({ ...s, connected: [...s.connected, repo] })),
    removeConnected: (repoId: string) =>
      update((s) => ({
        ...s,
        connected: s.connected.filter((r) => r.id !== repoId)
      })),
    setLoading: (loading: boolean) => update((s) => ({ ...s, loading })),
    setError: (error: string | null) => update((s) => ({ ...s, error, loading: false })),
    reset: () =>
      set({
        available: [],
        connected: [],
        loading: false,
        error: null
      })
  };
}

export const repos = createReposStore();

export const connectedRepoIds = derived(repos, ($repos) =>
  new Set($repos.connected.map((r) => r.github_repo_id))
);

export const availableNotConnected = derived(
  [repos, connectedRepoIds],
  ([$repos, $connectedIds]) =>
    $repos.available.filter((r) => !$connectedIds.has(r.id))
);

export const connectedCount = derived(repos, ($repos) => $repos.connected.length);
