import { json, error } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies }) => {
  const session = cookies.get('session');
  if (!session) {
    throw error(401, 'Unauthorized');
  }

  let userId: string;
  try {
    const parsed = JSON.parse(session);
    userId = parsed.userId;
  } catch {
    console.error('Failed to parse session cookie:', session);
    throw error(401, 'Invalid session');
  }

  if (!userId) {
    console.error('No userId in session:', session);
    throw error(401, 'Invalid session');
  }

  const { data: repos, error: dbError } = await supabaseAdmin
    .from('repositories')
    .select('*')
    .eq('user_id', userId)
    .order('last_synced', { ascending: false });

  if (dbError) {
    console.error('Failed to fetch repositories:', dbError);
    throw error(500, 'Failed to fetch repositories');
  }

  return json(repos || []);
};

export const POST: RequestHandler = async ({ cookies, request }) => {
  const session = cookies.get('session');
  if (!session) {
    throw error(401, 'Unauthorized');
  }

  let userId: string;
  try {
    const parsed = JSON.parse(session);
    userId = parsed.userId;
  } catch {
    console.error('Failed to parse session cookie:', session);
    throw error(401, 'Invalid session');
  }

  if (!userId) {
    console.error('No userId in session:', session);
    throw error(401, 'Invalid session');
  }

  console.log('Looking for profile with user ID:', userId);

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('plan')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error('Profile query error:', profileError);
  }

  if (!profile) {
    console.error('User not found for ID:', userId);
    throw error(401, 'User not found');
  }

  const { data: existingRepos } = await supabaseAdmin
    .from('repositories')
    .select('id')
    .eq('user_id', userId);

  const repoCount = existingRepos?.length || 0;
  const repoLimit = profile.plan === 'free' ? 1 : Infinity;

  if (repoCount >= repoLimit) {
    throw error(403, 'Repository limit reached. Upgrade to connect more repositories.');
  }

  const body = await request.json();
  const { github_repo_id, name, full_name, private: isPrivate, default_branch, description, language } = body;

  if (!github_repo_id || !name || !full_name) {
    throw error(400, 'Missing required fields');
  }

  const { data: existingRepo } = await supabaseAdmin
    .from('repositories')
    .select('id')
    .eq('user_id', userId)
    .eq('github_repo_id', github_repo_id)
    .single();

  if (existingRepo) {
    throw error(409, 'Repository already connected');
  }

  const { data: newRepo, error: insertError } = await supabaseAdmin
    .from('repositories')
    .insert({
      user_id: userId,
      github_repo_id,
      name,
      full_name,
      private: isPrivate || false,
      default_branch: default_branch || 'main',
      description: description || null,
      language: language || null,
      last_synced: new Date().toISOString()
    })
    .select()
    .single();

  if (insertError) {
    console.error('Failed to connect repository:', insertError);
    throw error(500, 'Failed to connect repository');
  }

  return json(newRepo, { status: 201 });
};
