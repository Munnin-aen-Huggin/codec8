import { supabaseAdmin } from '$lib/server/supabase';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
  const session = cookies.get('session');

  if (!session) return { user: null };

  let userId: string;
  try {
    const parsed = JSON.parse(session);
    userId = parsed.userId;
  } catch {
    // Invalid session format, treat as logged out
    return { user: null };
  }

  if (!userId) {
    return { user: null };
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, email, github_username, plan')
    .eq('id', userId)
    .single();

  return { user: profile || null };
};
