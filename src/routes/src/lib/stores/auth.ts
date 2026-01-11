import { writable, derived } from 'svelte/store';
import type { User } from '$lib/types';

interface AuthState {
  user: User | null;
  loading: boolean;
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    user: null,
    loading: true
  });

  return {
    subscribe,
    setUser: (user: User | null) => update(s => ({ ...s, user, loading: false })),
    setLoading: (loading: boolean) => update(s => ({ ...s, loading })),
    logout: () => set({ user: null, loading: false })
  };
}

export const auth = createAuthStore();
export const isAuthenticated = derived(auth, $auth => !!$auth.user);
export const isPaid = derived(auth, $auth => 
  $auth.user?.plan ? $auth.user.plan !== 'free' : false
);
