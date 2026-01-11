import { supabaseAdmin } from '$lib/server/supabase';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
  const session = cookies.get('session');

  if (!session) return { user: null };

  const [userId] = session.split(':');

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, email, github_username, plan')
    .eq('id', userId)
    .single();

  return { user: profile || null };
};
