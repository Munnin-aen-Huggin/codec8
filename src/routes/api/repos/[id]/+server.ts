import { json, error } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies, params }) => {
  const session = cookies.get('session');
  if (!session) {
    throw error(401, 'Unauthorized');
  }

  let userId: string;
  try {
    const parsed = JSON.parse(session);
    userId = parsed.userId;
  } catch {
    throw error(401, 'Invalid session');
  }

  if (!userId) {
    throw error(401, 'Invalid session');
  }

  const { id } = params;

  const { data: repo, error: dbError } = await supabaseAdmin
    .from('repositories')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (dbError || !repo) {
    throw error(404, 'Repository not found');
  }

  return json(repo);
};

export const DELETE: RequestHandler = async ({ cookies, params }) => {
  const session = cookies.get('session');
  if (!session) {
    throw error(401, 'Unauthorized');
  }

  let userId: string;
  try {
    const parsed = JSON.parse(session);
    userId = parsed.userId;
  } catch {
    throw error(401, 'Invalid session');
  }

  if (!userId) {
    throw error(401, 'Invalid session');
  }

  const { id } = params;

  const { data: repo } = await supabaseAdmin
    .from('repositories')
    .select('id')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (!repo) {
    throw error(404, 'Repository not found');
  }

  await supabaseAdmin.from('documentation').delete().eq('repo_id', id);

  const { error: deleteError } = await supabaseAdmin
    .from('repositories')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (deleteError) {
    console.error('Failed to disconnect repository:', deleteError);
    throw error(500, 'Failed to disconnect repository');
  }

  return json({ success: true });
};
