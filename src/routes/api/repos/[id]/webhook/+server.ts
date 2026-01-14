import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabaseAdmin } from '$lib/server/supabase';
import { createRepoWebhook, deleteRepoWebhook } from '$lib/server/github';
import { PUBLIC_APP_URL } from '$env/static/public';
import crypto from 'crypto';

/**
 * Webhook Setup Endpoint
 * POST: Enable auto-sync for a repository
 * DELETE: Disable auto-sync for a repository
 */

// Generate a secure random webhook secret
function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Extract session from cookie
function getSessionUserId(cookies: { get: (name: string) => string | undefined }): string | null {
  const session = cookies.get('session');
  if (!session) return null;

  try {
    const parsed = JSON.parse(session);
    return parsed.userId || null;
  } catch {
    return null;
  }
}

export const POST: RequestHandler = async ({ params, cookies }) => {
  // Verify authentication
  const userId = getSessionUserId(cookies);
  if (!userId) {
    throw error(401, 'Not authenticated');
  }

  const repoId = params.id;

  try {
    // Fetch repository
    const { data: repo, error: repoError } = await supabaseAdmin
      .from('repositories')
      .select('id, full_name, user_id, webhook_id, auto_sync_enabled')
      .eq('id', repoId)
      .single();

    if (repoError || !repo) {
      console.error('[Webhook Setup] Repo fetch error:', repoError);
      throw error(404, 'Repository not found');
    }

    // Verify ownership
    if (repo.user_id !== userId) {
      throw error(404, 'Repository not found');
    }

    // Check if already enabled
    if (repo.auto_sync_enabled && repo.webhook_id) {
      return json({ success: true, enabled: true, message: 'Auto-sync already enabled' });
    }

    // Fetch GitHub token from profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('github_token')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.github_token) {
      console.error('[Webhook Setup] Profile fetch error:', profileError);
      throw error(500, 'GitHub token not found');
    }

    // Parse owner/repo from full_name
    const [owner, repoName] = repo.full_name.split('/');
    if (!owner || !repoName) {
      throw error(500, 'Invalid repository name');
    }

    // Generate webhook secret
    const webhookSecret = generateWebhookSecret();
    const webhookUrl = `${PUBLIC_APP_URL}/api/github/webhook`;

    // Create webhook on GitHub
    let webhookId: number;
    try {
      const result = await createRepoWebhook(
        profile.github_token,
        owner,
        repoName,
        webhookUrl,
        webhookSecret
      );
      webhookId = result.id;
    } catch (err) {
      console.error('Failed to create GitHub webhook:', err);
      // Check if it's a permission error
      if (err instanceof Error && err.message.includes('404')) {
        throw error(403, 'You need admin access to this repository to enable auto-sync');
      }
      throw error(500, 'Failed to create webhook on GitHub');
    }

    // Store webhook info in database
    const { error: updateError } = await supabaseAdmin
      .from('repositories')
      .update({
        webhook_id: String(webhookId),
        webhook_secret: webhookSecret,
        auto_sync_enabled: true
      })
      .eq('id', repoId);

    if (updateError) {
      console.error('Failed to update repository:', updateError);
      // Try to clean up the webhook we just created
      try {
        await deleteRepoWebhook(profile.github_token, owner, repoName, String(webhookId));
      } catch {
        // Ignore cleanup errors
      }
      throw error(500, 'Failed to save webhook configuration');
    }

    return json({ success: true, enabled: true });
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }
    console.error('Webhook setup error:', err);
    throw error(500, 'Failed to enable auto-sync');
  }
};

export const DELETE: RequestHandler = async ({ params, cookies }) => {
  // Verify authentication
  const userId = getSessionUserId(cookies);
  if (!userId) {
    throw error(401, 'Not authenticated');
  }

  const repoId = params.id;

  try {
    // Fetch repository with user profile
    const { data: repo, error: repoError } = await supabaseAdmin
      .from('repositories')
      .select(`
        id,
        full_name,
        user_id,
        webhook_id,
        auto_sync_enabled,
        profiles!inner (
          github_token
        )
      `)
      .eq('id', repoId)
      .single();

    if (repoError || !repo) {
      throw error(404, 'Repository not found');
    }

    // Verify ownership
    if (repo.user_id !== userId) {
      throw error(404, 'Repository not found');
    }

    // Check if already disabled
    if (!repo.auto_sync_enabled && !repo.webhook_id) {
      return json({ success: true, enabled: false, message: 'Auto-sync already disabled' });
    }

    // Try to delete webhook from GitHub if it exists
    if (repo.webhook_id) {
      const profile = repo.profiles as unknown as { github_token: string };
      if (profile?.github_token) {
        const [owner, repoName] = repo.full_name.split('/');
        try {
          await deleteRepoWebhook(profile.github_token, owner, repoName, repo.webhook_id);
        } catch (err) {
          // Log but don't fail - webhook might already be deleted
          console.warn('Failed to delete GitHub webhook (may already be deleted):', err);
        }
      }
    }

    // Clear webhook info in database
    const { error: updateError } = await supabaseAdmin
      .from('repositories')
      .update({
        webhook_id: null,
        webhook_secret: null,
        auto_sync_enabled: false
      })
      .eq('id', repoId);

    if (updateError) {
      console.error('Failed to update repository:', updateError);
      throw error(500, 'Failed to disable auto-sync');
    }

    return json({ success: true, enabled: false });
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }
    console.error('Webhook disable error:', err);
    throw error(500, 'Failed to disable auto-sync');
  }
};

// GET: Check auto-sync status
export const GET: RequestHandler = async ({ params, cookies }) => {
  const userId = getSessionUserId(cookies);
  if (!userId) {
    throw error(401, 'Not authenticated');
  }

  const repoId = params.id;

  const { data: repo, error: repoError } = await supabaseAdmin
    .from('repositories')
    .select('id, auto_sync_enabled, last_synced_at, user_id')
    .eq('id', repoId)
    .single();

  if (repoError || !repo) {
    throw error(404, 'Repository not found');
  }

  if (repo.user_id !== userId) {
    throw error(404, 'Repository not found');
  }

  return json({
    enabled: repo.auto_sync_enabled || false,
    lastSyncedAt: repo.last_synced_at || null
  });
};
