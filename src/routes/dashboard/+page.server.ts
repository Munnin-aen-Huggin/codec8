import { redirect } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabase';
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

  const { data: repos } = await supabaseAdmin.from('repositories').select('*').eq('user_id', userId);

  return {
    user: {
      id: profile.id,
      email: profile.email,
      github_username: profile.github_username,
      plan: profile.plan
    },
    repos: repos || []
  };
};
