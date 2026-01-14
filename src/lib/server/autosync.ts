/**
 * Auto-sync Service
 *
 * Handles automatic documentation regeneration triggered by GitHub webhooks.
 * Checks plan limits, rate limiting, and orchestrates doc generation.
 */

import { supabaseAdmin } from './supabase';
import { fetchRepoContext } from '$lib/utils/parser';
import { generateMultipleDocs } from './claude';
import type { DocType } from '$lib/utils/prompts';

// Minimum time between auto-regenerations (5 minutes)
const COOLDOWN_MS = 5 * 60 * 1000;

// Subscription tiers that support auto-sync
const AUTO_SYNC_TIERS = ['pro', 'team'];

// Legacy plans that support auto-sync
const AUTO_SYNC_LEGACY_PLANS = ['ltd', 'pro', 'dfy'];

// All doc types to regenerate
const ALL_DOC_TYPES: DocType[] = ['readme', 'api', 'architecture', 'setup'];

interface RepoWithProfile {
	id: string;
	full_name: string;
	description: string | null;
	language: string | null;
	default_branch: string;
	user_id: string;
	auto_sync_enabled: boolean;
	last_synced_at: string | null;
	profiles: {
		github_token: string;
		plan: string;
		subscription_status: string | null;
		subscription_tier: string | null;
		repos_used_this_month: number;
	};
}

/**
 * Trigger automatic documentation regeneration for a repository
 *
 * This function is called when a GitHub webhook push event is received.
 * It handles all the validation, rate limiting, and error handling.
 *
 * @param repoId - The repository ID to regenerate docs for
 */
export async function triggerAutoRegeneration(repoId: string): Promise<void> {
	console.log(`[AutoSync] Starting regeneration for repo: ${repoId}`);

	try {
		// Fetch repository with profile
		const { data: repo, error: repoError } = await supabaseAdmin
			.from('repositories')
			.select(`
				id,
				full_name,
				description,
				language,
				default_branch,
				user_id,
				auto_sync_enabled,
				last_synced_at,
				profiles!inner (
					github_token,
					plan,
					subscription_status,
					subscription_tier,
					repos_used_this_month
				)
			`)
			.eq('id', repoId)
			.single();

		if (repoError || !repo) {
			console.error(`[AutoSync] Repository not found: ${repoId}`, repoError);
			return;
		}

		const repoData = repo as unknown as RepoWithProfile;

		// 1. Check if auto-sync is enabled
		if (!repoData.auto_sync_enabled) {
			console.log(`[AutoSync] Auto-sync disabled for: ${repoData.full_name}`);
			return;
		}

		// 2. Check cooldown (rate limiting)
		if (repoData.last_synced_at) {
			const lastSync = new Date(repoData.last_synced_at).getTime();
			const now = Date.now();
			if (now - lastSync < COOLDOWN_MS) {
				const remainingSeconds = Math.ceil((COOLDOWN_MS - (now - lastSync)) / 1000);
				console.log(
					`[AutoSync] Cooldown active for ${repoData.full_name}, ${remainingSeconds}s remaining`
				);
				return;
			}
		}

		// 3. Check if user's plan allows auto-sync
		const profile = repoData.profiles;
		const hasLegacyAccess = AUTO_SYNC_LEGACY_PLANS.includes(profile.plan);
		const hasSubscriptionAccess =
			profile.subscription_status === 'active' &&
			profile.subscription_tier &&
			AUTO_SYNC_TIERS.includes(profile.subscription_tier);

		if (!hasLegacyAccess && !hasSubscriptionAccess) {
			console.log(
				`[AutoSync] Plan does not support auto-sync: ${profile.plan}/${profile.subscription_tier}`
			);
			return;
		}

		// 4. Check subscription limits for subscription users
		if (hasSubscriptionAccess && !hasLegacyAccess) {
			const limit = profile.subscription_tier === 'team' ? 100 : 30;
			if (profile.repos_used_this_month >= limit) {
				console.log(
					`[AutoSync] Monthly limit reached for ${repoData.full_name}: ${profile.repos_used_this_month}/${limit}`
				);
				return;
			}
		}

		// 5. Fetch GitHub token
		if (!profile.github_token) {
			console.error(`[AutoSync] No GitHub token for user: ${repoData.user_id}`);
			return;
		}

		// 6. Fetch repository context from GitHub
		console.log(`[AutoSync] Fetching context for ${repoData.full_name}...`);
		const context = await fetchRepoContext(
			profile.github_token,
			repoData.full_name,
			repoData.description,
			repoData.language,
			repoData.default_branch
		);

		// 7. Generate all doc types
		console.log(`[AutoSync] Generating docs for ${repoData.full_name}...`);
		const results = await generateMultipleDocs(context, ALL_DOC_TYPES);

		// 8. Save results to database
		let successCount = 0;
		for (const result of results) {
			if (result.success) {
				// Check if doc already exists
				const { data: existingDoc } = await supabaseAdmin
					.from('documentation')
					.select('id, version')
					.eq('repo_id', repoId)
					.eq('type', result.type)
					.single();

				if (existingDoc) {
					// Update existing doc
					const { error: updateError } = await supabaseAdmin
						.from('documentation')
						.update({
							content: result.content,
							version: existingDoc.version + 1,
							generated_at: new Date().toISOString()
						})
						.eq('id', existingDoc.id);

					if (!updateError) {
						successCount++;
					} else {
						console.error(`[AutoSync] Failed to update ${result.type}:`, updateError);
					}
				} else {
					// Create new doc
					const { error: insertError } = await supabaseAdmin.from('documentation').insert({
						repo_id: repoId,
						type: result.type,
						content: result.content,
						version: 1,
						generated_at: new Date().toISOString()
					});

					if (!insertError) {
						successCount++;
					} else {
						console.error(`[AutoSync] Failed to insert ${result.type}:`, insertError);
					}
				}
			} else {
				console.error(`[AutoSync] Generation failed for ${result.type}:`, result.error);
			}
		}

		// 9. Update last_synced_at timestamp
		const { error: updateError } = await supabaseAdmin
			.from('repositories')
			.update({
				last_synced_at: new Date().toISOString(),
				last_synced: new Date().toISOString()
			})
			.eq('id', repoId);

		if (updateError) {
			console.error(`[AutoSync] Failed to update last_synced_at:`, updateError);
		}

		console.log(
			`[AutoSync] Completed for ${repoData.full_name}: ${successCount}/${ALL_DOC_TYPES.length} docs regenerated`
		);
	} catch (err) {
		// Log error but don't throw - auto-sync should fail silently
		console.error(`[AutoSync] Error regenerating docs for ${repoId}:`, err);
	}
}
