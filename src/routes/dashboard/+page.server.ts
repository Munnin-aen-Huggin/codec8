import { redirect } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabase';
import { fetchUserRepos } from '$lib/server/github';
import type { PageServerLoad } from './$types';

interface SessionData {
  userId: string;
  token: string;
}

export const load: PageServerLoad = async ({ cookies }) => {
  const sessionCookie = cookies.get('session');
  if (!sessionCookie) throw redirect(302, '/');

  let userId: string;
  try {
    const session: SessionData = JSON.parse(sessionCookie);
    userId = session.userId;
  } catch {
    // Invalid session format, clear and redirect
    cookies.delete('session', { path: '/' });
    throw redirect(302, '/');
  }

  if (!userId) {
    cookies.delete('session', { path: '/' });
    throw redirect(302, '/');
  }

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

  // Get documentation status for each connected repo
  const repoIds = (connectedRepos || []).map((r) => r.id);
  let repoDocs: { repo_id: string; has_docs: boolean }[] = [];

  if (repoIds.length > 0) {
    const { data: docs } = await supabaseAdmin
      .from('documentation')
      .select('repo_id')
      .in('repo_id', repoIds);

    // Create a set of repo IDs that have docs
    const reposWithDocs = new Set((docs || []).map((d) => d.repo_id));
    repoDocs = repoIds.map((id) => ({ repo_id: id, has_docs: reposWithDocs.has(id) }));
  }

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
    githubError,
    repoDocs
  };
};
