import { redirect } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabase';
import { fetchUserRepos } from '$lib/server/github';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
  const session = cookies.get('session');
  if (!session) throw redirect(302, '/');

  const [userId] = session.split(':');

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (!profile) {
    cookies.delete('session', { path: '/' });
    throw redirect(302, '/');
  }

  const { data: connectedRepos } = await supabaseAdmin
    .from('repositories')
    .select('*')
    .eq('user_id', userId);

  let availableRepos: Awaited<ReturnType<typeof fetchUserRepos>> = [];
  let githubError: string | null = null;

  if (profile.github_token) {
    try {
      availableRepos = await fetchUserRepos(profile.github_token);
    } catch (err) {
      githubError = err instanceof Error ? err.message : 'Failed to fetch GitHub repos';
    }
  }

  return {
    user: {
      id: profile.id,
      email: profile.email,
      github_username: profile.github_username,
      plan: profile.plan
    },
    connectedRepos: connectedRepos || [],
    availableRepos,
    githubError
  };
};
