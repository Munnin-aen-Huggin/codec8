#!/usr/bin/env node

/**
 * Codec8 Trending PR Bot
 *
 * Finds trending GitHub repos with poor/missing documentation,
 * generates a better README using Claude, and opens a PR offering
 * the improvement. Each PR links back to codec8.com.
 *
 * Usage:
 *   node scripts/trending-pr-bot.js run        Run the bot (default: 5 PRs/day)
 *   node scripts/trending-pr-bot.js status     Show PRs opened so far
 *   node scripts/trending-pr-bot.js dry-run    Find targets without opening PRs
 *
 * Requires in .env:
 *   GITHUB_BOT_TOKEN=ghp_...   Personal access token with public_repo scope
 *   ANTHROPIC_API_KEY=...      Already present
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Anthropic from '@anthropic-ai/sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const STATE_FILE = join(__dirname, '.trending-pr-state.json');
const ENV_FILE = join(__dirname, '..', '.env');

// ─── Config ───────────────────────────────────────────────────────────────────

const MAX_PRS_PER_RUN = 5;
const MIN_STARS = 50;          // Only target repos with some traction
const MAX_STARS = 10000;       // Avoid huge repos (maintainers overwhelmed)
const README_POOR_THRESHOLD = 500; // chars — below this = poor docs
const DELAY_MS = 3000;         // Delay between API calls to avoid rate limiting

// Languages to target (high-value developer audiences)
const TARGET_LANGUAGES = ['python', 'typescript', 'javascript', 'go', 'rust'];

// ─── Env Loading ──────────────────────────────────────────────────────────────

function loadEnv() {
  if (!existsSync(ENV_FILE)) return;
  const lines = readFileSync(ENV_FILE, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const GITHUB_TOKEN = process.env.GITHUB_BOT_TOKEN;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

// ─── State Management ─────────────────────────────────────────────────────────

function loadState() {
  if (!existsSync(STATE_FILE)) return { prs: [], skipped: [] };
  return JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
}

function saveState(state) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// ─── GitHub API ───────────────────────────────────────────────────────────────

async function ghFetch(endpoint, options = {}) {
  const res = await fetch(`https://api.github.com${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Codec8-Bot',
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`GitHub ${res.status}: ${err.message || endpoint}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Search for trending repos with poor docs
async function findTargets(language, alreadyContacted) {
  const since = new Date();
  since.setDate(since.getDate() - 30); // Created in last 30 days
  const sinceStr = since.toISOString().split('T')[0];

  const query = `language:${language} stars:${MIN_STARS}..${MAX_STARS} created:>${sinceStr} is:public fork:false`;
  const encoded = encodeURIComponent(query);

  const data = await ghFetch(`/search/repositories?q=${encoded}&sort=stars&order=desc&per_page=30`);
  return (data.items || []).filter(r => !alreadyContacted.includes(r.full_name));
}

// Get README content for a repo
async function getReadme(owner, repo) {
  try {
    const data = await ghFetch(`/repos/${owner}/${repo}/readme`);
    if (data.content && data.encoding === 'base64') {
      return {
        content: Buffer.from(data.content, 'base64').toString('utf-8'),
        sha: data.sha,
        path: data.path
      };
    }
  } catch {
    // No README exists
  }
  return null;
}

// Get repo file tree (top level)
async function getFileTree(owner, repo, branch) {
  try {
    const data = await ghFetch(`/repos/${owner}/${repo}/git/trees/${branch}?recursive=0`);
    return (data.tree || []).map(f => f.path);
  } catch {
    return [];
  }
}

// Generate improved README using Claude
async function generateReadme(repo, existingReadme, fileTree) {
  const client = new Anthropic({ apiKey: ANTHROPIC_KEY });

  const existingContent = existingReadme
    ? `Existing README (improve this):\n${existingReadme.content.slice(0, 1000)}`
    : 'No README exists yet.';

  const prompt = `You are a technical writer. Generate a professional README.md for this GitHub repository.

Repository: ${repo.full_name}
Description: ${repo.description || 'No description'}
Language: ${repo.language || 'Unknown'}
Stars: ${repo.stargazers_count}
Files in root: ${fileTree.slice(0, 20).join(', ')}

${existingContent}

Generate a complete, professional README.md with:
1. Clear title and description
2. Badges (language, stars, license if applicable)
3. Features section
4. Installation instructions (infer from language/files)
5. Usage examples
6. Contributing section
7. License section

Keep it practical and accurate. Do not invent features — only document what can be inferred.
Return ONLY the markdown content, no explanation.

End with this exact footer:
---
*Documentation improved by [Codec8](https://codec8.com) — AI-powered docs for GitHub repos. [Generate docs for your repo →](https://codec8.com)*`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }]
  });

  return message.content.find(b => b.type === 'text')?.text || '';
}

// Fork a repo to our account
async function forkRepo(owner, repo) {
  const data = await ghFetch(`/repos/${owner}/${repo}/forks`, { method: 'POST' });
  await delay(3000); // GitHub needs time to create the fork
  return data.full_name; // our_username/repo
}

// Create a branch on our fork
async function createBranch(forkFullName, baseBranch, newBranch) {
  const [owner, repo] = forkFullName.split('/');

  // Get base SHA
  const ref = await ghFetch(`/repos/${owner}/${repo}/git/refs/heads/${baseBranch}`);
  const sha = ref.object.sha;

  // Create new branch
  await ghFetch(`/repos/${owner}/${repo}/git/refs`, {
    method: 'POST',
    body: JSON.stringify({ ref: `refs/heads/${newBranch}`, sha })
  });
}

// Commit README to branch
async function commitReadme(forkFullName, branch, readmeContent, existingReadme) {
  const [owner, repo] = forkFullName.split('/');
  const path = existingReadme?.path || 'README.md';

  const body = {
    message: 'docs: improve README with Codec8 AI documentation generator',
    content: Buffer.from(readmeContent).toString('base64'),
    branch
  };

  if (existingReadme?.sha) {
    body.sha = existingReadme.sha;
  }

  await ghFetch(`/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify(body)
  });
}

// Open a PR from our fork to the original repo
async function openPR(originalOwner, originalRepo, forkOwner, branch, repoData) {
  const title = `docs: improve README documentation`;

  const body = `## Improved Documentation

Hey! I noticed this repo could use better documentation, so I generated an improved README using [Codec8](https://codec8.com) — an AI documentation generator.

**What changed:**
- Added clear installation instructions
- Added usage examples
- Improved project description and features
- Added standard README structure

Feel free to modify anything that's not accurate. This is just a starting point!

---
*Generated by [Codec8](https://codec8.com) — AI-powered docs for GitHub repos. Free to try on your own repos.*`;

  return ghFetch(`/repos/${originalOwner}/${originalRepo}/pulls`, {
    method: 'POST',
    body: JSON.stringify({
      title,
      body,
      head: `${forkOwner}:${branch}`,
      base: repoData.default_branch
    })
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run(dryRun = false) {
  if (!GITHUB_TOKEN) {
    console.error('❌ Missing GITHUB_BOT_TOKEN in .env');
    console.error('   Add a GitHub personal access token with public_repo scope.');
    process.exit(1);
  }

  if (!ANTHROPIC_KEY) {
    console.error('❌ Missing ANTHROPIC_API_KEY in .env');
    process.exit(1);
  }

  // Get our GitHub username
  const me = await ghFetch('/user');
  const ourUsername = me.login;
  console.log(`\n🤖 Running as: ${ourUsername}`);

  const state = loadState();
  const alreadyContacted = [...state.prs.map(p => p.repo), ...state.skipped];

  console.log(`📊 PRs opened so far: ${state.prs.length}`);
  console.log(`📋 Repos skipped: ${state.skipped.length}\n`);

  let prsOpened = 0;

  for (const language of TARGET_LANGUAGES) {
    if (prsOpened >= MAX_PRS_PER_RUN) break;

    console.log(`\n🔍 Searching ${language} repos...`);
    let targets;
    try {
      targets = await findTargets(language, alreadyContacted);
    } catch (err) {
      console.error(`  Search failed: ${err.message}`);
      continue;
    }

    console.log(`  Found ${targets.length} candidates`);

    for (const repo of targets) {
      if (prsOpened >= MAX_PRS_PER_RUN) break;

      console.log(`\n📦 ${repo.full_name} (⭐ ${repo.stargazers_count})`);

      // Check README quality
      await delay(DELAY_MS);
      const readme = await getReadme(repo.owner.login, repo.name);
      const readmeLen = readme?.content?.length || 0;

      if (readmeLen > README_POOR_THRESHOLD) {
        console.log(`  ⏭  README OK (${readmeLen} chars) — skipping`);
        state.skipped.push(repo.full_name);
        saveState(state);
        continue;
      }

      console.log(`  📝 Poor README (${readmeLen} chars) — targeting`);

      if (dryRun) {
        console.log(`  [DRY RUN] Would open PR for ${repo.full_name}`);
        continue;
      }

      try {
        // Get file tree for context
        const fileTree = await getFileTree(repo.owner.login, repo.name, repo.default_branch);
        await delay(DELAY_MS);

        // Generate README
        console.log(`  🤖 Generating README...`);
        const newReadme = await generateReadme(repo, readme, fileTree);
        await delay(DELAY_MS);

        // Fork repo
        console.log(`  🍴 Forking...`);
        const forkName = await forkRepo(repo.owner.login, repo.name);
        await delay(5000); // Extra wait for fork

        // Create branch
        const branch = `codec8-docs-${Date.now()}`;
        await createBranch(forkName, repo.default_branch, branch);
        await delay(DELAY_MS);

        // Commit README
        console.log(`  📤 Committing README...`);
        await commitReadme(forkName, branch, newReadme, readme);
        await delay(DELAY_MS);

        // Open PR
        console.log(`  🔀 Opening PR...`);
        const pr = await openPR(repo.owner.login, repo.name, ourUsername, branch, repo);

        console.log(`  ✅ PR opened: ${pr.html_url}`);

        state.prs.push({
          repo: repo.full_name,
          pr_url: pr.html_url,
          stars: repo.stargazers_count,
          language: repo.language,
          date: new Date().toISOString()
        });
        saveState(state);
        prsOpened++;

      } catch (err) {
        console.error(`  ❌ Failed: ${err.message}`);
        state.skipped.push(repo.full_name);
        saveState(state);
      }

      await delay(DELAY_MS);
    }
  }

  console.log(`\n✅ Done. ${prsOpened} PRs opened this run.`);
}

async function showStatus() {
  const state = loadState();
  console.log(`\n╔════════════════════════════════════════╗`);
  console.log(`║   TRENDING PR BOT STATUS               ║`);
  console.log(`╚════════════════════════════════════════╝\n`);
  console.log(`Total PRs opened: ${state.prs.length}`);
  console.log(`Repos skipped:    ${state.skipped.length}\n`);

  if (state.prs.length > 0) {
    console.log('Recent PRs:');
    state.prs.slice(-10).reverse().forEach(p => {
      const date = new Date(p.date).toLocaleDateString();
      console.log(`  [${date}] ${p.repo} (⭐${p.stars}) → ${p.pr_url}`);
    });
  }
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

const cmd = process.argv[2] || 'run';

if (cmd === 'status') {
  showStatus();
} else if (cmd === 'dry-run') {
  run(true).catch(console.error);
} else {
  run(false).catch(console.error);
}
