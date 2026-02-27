#!/usr/bin/env node

/**
 * Codec8 Directory Blitz — Submit to 30+ dev tool directories
 *
 * Same pattern as launch-auto.js: copies content to clipboard, opens
 * the submit URL in your default browser. You paste and click submit.
 *
 * Usage:
 *   node scripts/directory-submit.js all           Walk through all directories
 *   node scripts/directory-submit.js devhunt       Submit to one directory
 *   node scripts/directory-submit.js status        Show progress
 *   node scripts/directory-submit.js --help        Show usage
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const STATE_FILE = join(__dirname, '.directory-state.json');

// ─── macOS Helpers ────────────────────────────────────────────────────────────

function copyToClipboard(text) {
  execSync('pbcopy', { input: text });
}

function openUrl(url) {
  execSync(`open "${url}"`);
}

function ask(message) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(message, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// ─── Submission Copy ──────────────────────────────────────────────────────────

const COPY = {
  name: 'Codec8',
  tagline: 'AI-powered documentation for GitHub repos — README, API docs, architecture diagrams, setup guides in 60 seconds',
  url: 'https://codec8.com',
  description: `Connect your GitHub repo and get professional documentation auto-generated in 30 seconds. README, API reference, architecture diagrams (Mermaid), and setup guides — all from your actual code, not generic templates. Free demo, $99 lifetime deal.`,
  longDescription: `Codec8 auto-generates professional documentation for your GitHub repositories.

What it does:
- Connect any GitHub repo (read-only OAuth)
- AI analyzes your codebase structure, dependencies, and key files
- Generates 4 types of docs: README, API reference, architecture diagrams (Mermaid), and setup guides
- Edit inline, export markdown, or create a PR directly

Not generic templates — it reads your actual code (package.json, routes, configs, folder structure) and produces context-aware documentation specific to YOUR project.

Pricing: Free for 1 repo. $99 lifetime deal for unlimited repos, forever. No subscriptions.

Try it free: https://codec8.com`,
  category: 'Developer Tools / Documentation / AI',
  alternatives: 'Mintlify, Docusaurus, ReadMe, GitBook, Swagger',
  launchArticle: `# How I Built an AI Tool That Generates Documentation From GitHub Repos in 30 Seconds

Every developer knows this pain: documentation is essential, but it always ends up at the bottom of the to-do list. Your README is outdated. Your API docs are missing. Contributors can't figure out how to set up the project.

I built Codec8 to solve this. It connects to your GitHub repo, reads your actual codebase, and auto-generates professional documentation in about 30 seconds.

## What It Generates

1. **README** — Project overview, features, quick start with install commands
2. **API Reference** — Endpoints, parameters, response examples
3. **Architecture Overview** — System diagrams using Mermaid, data flow, design decisions
4. **Setup Guide** — Installation, environment setup, deployment instructions

## How It Works

1. Sign in with GitHub (read-only access)
2. Connect a repository
3. Select which doc types you need
4. Click generate — results in ~30 seconds
5. Edit, export as markdown, or create a PR

## Why It's Different

Most documentation generators work from comments or annotations you've already written. Codec8 reads your actual code — package.json, folder structure, route files, config files — and produces docs specific to your project's frameworks, dependencies, and architecture.

The 80/20 rule applies: a generated README that's 80% right and needs 5 minutes of editing beats spending an hour writing one from scratch.

## Tech Stack

Built with SvelteKit + TypeScript, Supabase for auth and database, Claude AI for generation, Stripe for payments, deployed on Vercel.

## Pricing

- Free: 1 repository
- Lifetime Deal: $99 — unlimited repos, forever. No subscriptions.

Try it free at [codec8.com](https://codec8.com)

What project would you document first?`,
};

// ─── Directory Definitions ────────────────────────────────────────────────────

const DIRECTORIES = [
  // Developer-focused (highest value)
  {
    id: 'devhunt',
    name: 'DevHunt',
    url: 'https://devhunt.org/',
    category: 'Developer',
    type: 'product',
    instructions: 'Sign in with GitHub, click "Launch", fill in product details.',
  },
  {
    id: 'alternativeto',
    name: 'AlternativeTo',
    url: 'https://alternativeto.net/',
    category: 'Developer',
    type: 'product',
    instructions: 'Click "Add Application", fill in name, URL, description. Add alternatives: Mintlify, Docusaurus, ReadMe, GitBook.',
  },
  {
    id: 'stackshare',
    name: 'StackShare',
    url: 'https://stackshare.io/',
    category: 'Developer',
    type: 'product',
    instructions: 'Sign in, click "Add a Tool", fill in details and tech stack.',
  },
  {
    id: 'sourceforge',
    name: 'SourceForge',
    url: 'https://sourceforge.net/',
    category: 'Developer',
    type: 'product',
    instructions: 'Click "Create a Project", fill in project details.',
  },
  {
    id: 'saashub',
    name: 'SaaSHub',
    url: 'https://www.saashub.com/',
    category: 'Developer',
    type: 'product',
    instructions: 'Click "Submit" in the footer, fill in product details and alternatives.',
  },
  {
    id: 'uneed',
    name: 'Uneed',
    url: 'https://uneed.best/',
    category: 'Developer',
    type: 'product',
    instructions: 'Click "Submit a tool", fill in name, URL, description, category.',
  },
  {
    id: 'peerlist',
    name: 'Peerlist',
    url: 'https://peerlist.io/',
    category: 'Developer',
    type: 'product',
    instructions: 'Sign in, go to Projects, click "Add Project", fill in details.',
  },

  // Startup/Product directories
  {
    id: 'betalist',
    name: 'BetaList',
    url: 'https://betalist.com/submit',
    category: 'Startup',
    type: 'product',
    instructions: 'Fill in the submission form with product name, URL, tagline, description.',
  },
  {
    id: 'microlaunch',
    name: 'MicroLaunch',
    url: 'https://microlaunch.net/',
    category: 'Startup',
    type: 'product',
    instructions: 'Click "Submit", fill in product details.',
  },
  {
    id: 'launchingnext',
    name: 'Launching Next',
    url: 'https://www.launchingnext.com/submit/',
    category: 'Startup',
    type: 'product',
    instructions: 'Fill in the submission form: name, URL, description, category.',
  },
  {
    id: 'startupbase',
    name: 'StartupBase',
    url: 'https://startupbase.io/',
    category: 'Startup',
    type: 'product',
    instructions: 'Click "Submit Startup", fill in details.',
  },
  {
    id: 'betapage',
    name: 'BetaPage',
    url: 'https://betapage.co/',
    category: 'Startup',
    type: 'product',
    instructions: 'Click "Submit Your Startup", fill in the form.',
  },
  {
    id: 'sideprojectors',
    name: 'SideProjectors',
    url: 'https://www.sideprojectors.com/',
    category: 'Startup',
    type: 'product',
    instructions: 'Click "List a Project", fill in name, URL, description.',
  },
  {
    id: 'startupstash',
    name: 'Startup Stash',
    url: 'https://startupstash.com/',
    category: 'Startup',
    type: 'product',
    instructions: 'Click "Submit", fill in product details and category.',
  },
  {
    id: 'launched',
    name: 'Launched',
    url: 'https://launched.io/',
    category: 'Startup',
    type: 'product',
    instructions: 'Click "Submit", fill in product details.',
  },

  // AI tool directories
  {
    id: 'theresanaiforthat',
    name: "There's An AI For That",
    url: 'https://theresanaiforthat.com/submit/',
    category: 'AI',
    type: 'product',
    instructions: 'Fill in the submission form: name, URL, description, category (Developer Tools).',
  },
  {
    id: 'aitoolsdirectory',
    name: 'AI Tool Directory',
    url: 'https://aitoolsdirectory.com/',
    category: 'AI',
    type: 'product',
    instructions: 'Click "Submit a Tool", fill in details.',
  },
  {
    id: 'futuretools',
    name: 'FutureTools',
    url: 'https://www.futuretools.io/submit-a-tool',
    category: 'AI',
    type: 'product',
    instructions: 'Fill in the submission form with tool details.',
  },
  {
    id: 'topaitools',
    name: 'TopAI.tools',
    url: 'https://topai.tools/submit',
    category: 'AI',
    type: 'product',
    instructions: 'Fill in name, URL, description, category.',
  },
  {
    id: 'aitoolsguide',
    name: 'AItoolsguide',
    url: 'https://aitoolsguide.com/',
    category: 'AI',
    type: 'product',
    instructions: 'Click "Submit Tool", fill in details.',
  },

  // Review/comparison sites
  {
    id: 'g2',
    name: 'G2',
    url: 'https://www.g2.com/products/new',
    category: 'Review',
    type: 'product',
    instructions: 'Create vendor account, add product listing with description and screenshots.',
  },
  {
    id: 'capterra',
    name: 'Capterra',
    url: 'https://www.capterra.com/vendors/sign-up',
    category: 'Review',
    type: 'product',
    instructions: 'Create vendor account, add product with description, pricing, features.',
  },
  {
    id: 'trustradius',
    name: 'TrustRadius',
    url: 'https://www.trustradius.com/vendor',
    category: 'Review',
    type: 'product',
    instructions: 'Sign up as vendor, create product profile.',
  },
  {
    id: 'crozdesk',
    name: 'Crozdesk',
    url: 'https://crozdesk.com/',
    category: 'Review',
    type: 'product',
    instructions: 'Click "List Your Software", fill in product details.',
  },
  {
    id: 'getapp',
    name: 'GetApp',
    url: 'https://www.getapp.com/',
    category: 'Review',
    type: 'product',
    instructions: 'Sign up as vendor (owned by Gartner, same as Capterra), add listing.',
  },

  // Content/community platforms
  {
    id: 'indiehackers',
    name: 'Indie Hackers',
    url: 'https://www.indiehackers.com/products',
    category: 'Community',
    type: 'product',
    instructions: 'Go to Products, click "Add a Product", fill in details with revenue info.',
  },
  {
    id: 'devto',
    name: 'Dev.to',
    url: 'https://dev.to/',
    category: 'Community',
    type: 'article',
    instructions: 'Click "Create Post", paste the launch article. Add tags: documentation, ai, github, webdev.',
  },
  {
    id: 'hashnode',
    name: 'Hashnode',
    url: 'https://hashnode.com/',
    category: 'Community',
    type: 'article',
    instructions: 'Click "Write", paste the launch article. Add tags: documentation, ai, developer-tools.',
  },
  {
    id: 'hackernoon',
    name: 'HackerNoon',
    url: 'https://hackernoon.com/',
    category: 'Community',
    type: 'article',
    instructions: 'Click "Write", paste the launch article. Note: HackerNoon has an editorial review process.',
  },
  {
    id: 'dailydev',
    name: 'daily.dev',
    url: 'https://daily.dev/',
    category: 'Community',
    type: 'article',
    instructions: 'Submit your Dev.to or Hashnode article URL — daily.dev aggregates from those platforms.',
  },
];

// ─── State Management ─────────────────────────────────────────────────────────

function loadState() {
  if (existsSync(STATE_FILE)) {
    return JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
  }

  const state = { startDate: new Date().toISOString().split('T')[0] };
  for (const dir of DIRECTORIES) {
    state[dir.id] = { done: false, date: null };
  }
  saveState(state);
  return state;
}

function saveState(state) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function markDone(state, key) {
  state[key] = { done: true, date: new Date().toISOString() };
  saveState(state);
}

// ─── Submission Flow ──────────────────────────────────────────────────────────

async function submitToDirectory(state, dir) {
  if (state[dir.id]?.done) {
    console.log(`  ${dir.name}: already submitted. Skipping.\n`);
    return;
  }

  const boxWidth = 55;
  const label = `${dir.name} (${dir.category})`;
  const padding = Math.max(0, boxWidth - label.length - 4);

  console.log(`  \u250C\u2500 ${label} ${'─'.repeat(padding)}\u2510`);
  console.log(`  \u2502 URL: ${dir.url.padEnd(boxWidth - 7)}\u2502`);
  console.log(`  \u2502 ${dir.instructions.slice(0, boxWidth - 3).padEnd(boxWidth - 3)}\u2502`);
  if (dir.instructions.length > boxWidth - 3) {
    console.log(`  \u2502 ${dir.instructions.slice(boxWidth - 3).padEnd(boxWidth - 3)}\u2502`);
  }
  console.log(`  \u2514${'─'.repeat(boxWidth)}\u2518\n`);

  // Decide what to copy based on directory type
  if (dir.type === 'article') {
    // For content platforms, copy the launch article
    copyToClipboard(COPY.launchArticle);
    console.log('  Launch article copied to clipboard.');
  } else {
    // For product directories, copy a formatted submission block
    const submission = [
      `Name: ${COPY.name}`,
      `Tagline: ${COPY.tagline}`,
      `URL: ${COPY.url}`,
      `Category: ${COPY.category}`,
      `Alternatives to: ${COPY.alternatives}`,
      '',
      `Description:`,
      COPY.description,
    ].join('\n');
    copyToClipboard(submission);
    console.log('  Submission details copied to clipboard.');
  }

  console.log('  Opening URL in browser...\n');
  openUrl(dir.url);

  const answer = await ask('  Press Enter when done (or type "skip" to skip): ');

  if (answer.toLowerCase() === 'skip') {
    console.log(`  ${dir.name}: SKIPPED\n`);
    return;
  }

  // For product directories, offer to copy the long description too
  if (dir.type === 'product') {
    const needMore = await ask('  Need the full description? (y/N): ');
    if (needMore.toLowerCase() === 'y') {
      copyToClipboard(COPY.longDescription);
      console.log('  Full description copied to clipboard. Paste where needed.\n');
      await ask('  Press Enter when done...');
    }
  }

  markDone(state, dir.id);
  console.log(`  ${dir.name}: DONE\n`);
}

// ─── Status ───────────────────────────────────────────────────────────────────

function showStatus() {
  const state = loadState();

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   DIRECTORY SUBMISSION STATUS                              ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const categories = ['Developer', 'Startup', 'AI', 'Review', 'Community'];
  let totalDone = 0;
  let totalCount = 0;

  for (const cat of categories) {
    const dirs = DIRECTORIES.filter((d) => d.category === cat);
    const done = dirs.filter((d) => state[d.id]?.done).length;
    totalDone += done;
    totalCount += dirs.length;

    console.log(`  ═══ ${cat} (${done}/${dirs.length}) ═══\n`);
    console.log('  ' + 'Directory'.padEnd(28) + 'Status'.padEnd(10) + 'Date');
    console.log('  ' + '─'.repeat(58));

    for (const dir of dirs) {
      const s = state[dir.id];
      const status = s?.done ? 'DONE' : 'PENDING';
      const date = s?.date ? s.date.slice(0, 10) : '—';
      const icon = s?.done ? '\u2713' : ' ';
      console.log(`  [${icon}] ${dir.name.padEnd(24)}${status.padEnd(10)}${date}`);
    }
    console.log('');
  }

  console.log('  ─────────────────────────────────────');
  console.log(`  Total Progress: ${totalDone}/${totalCount} directories`);

  const pct = Math.round((totalDone / totalCount) * 100);
  const filled = Math.round(pct / 5);
  const bar = '█'.repeat(filled) + '░'.repeat(20 - filled);
  console.log(`  [${bar}] ${pct}%\n`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const command = process.argv[2];

  if (!command || command === '--help') {
    console.log(`
Codec8 Directory Blitz

Usage:
  node scripts/directory-submit.js all            Walk through all 30 directories
  node scripts/directory-submit.js <directory>    Submit to one directory
  node scripts/directory-submit.js status         Show progress
  node scripts/directory-submit.js list           List all directory IDs

Directories:
  devhunt, alternativeto, stackshare, sourceforge, saashub, uneed, peerlist,
  betalist, microlaunch, launchingnext, startupbase, betapage, sideprojectors,
  startupstash, launched, theresanaiforthat, aitoolsdirectory, futuretools,
  topaitools, aitoolsguide, g2, capterra, trustradius, crozdesk, getapp,
  indiehackers, devto, hashnode, hackernoon, dailydev

How it works:
  1. Copies submission content to your clipboard (pbcopy)
  2. Opens the directory's submit URL in your browser
  3. You paste (Cmd+V) and fill in any extra fields
  4. Press Enter → moves to next directory

No API keys. No browser automation. Just clipboard + your browser.
`);
    return;
  }

  if (command === 'status') {
    showStatus();
    return;
  }

  if (command === 'list') {
    console.log('\nAvailable directories:\n');
    for (const dir of DIRECTORIES) {
      console.log(`  ${dir.id.padEnd(20)} ${dir.name.padEnd(24)} (${dir.category})`);
    }
    console.log('');
    return;
  }

  const state = loadState();

  if (command === 'all') {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║   CODEC8 DIRECTORY BLITZ                                   ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const pending = DIRECTORIES.filter((d) => !state[d.id]?.done);
    if (pending.length === 0) {
      console.log('  All directories submitted! Run "status" to see results.\n');
      return;
    }

    console.log(`  ${pending.length} directories remaining. Let's go.\n`);
    console.log('  For each: content → clipboard → browser opens → paste → submit.');
    console.log('  Type "skip" at any prompt to skip a directory.\n');

    let count = 0;
    for (const dir of DIRECTORIES) {
      if (state[dir.id]?.done) continue;
      count++;
      const remaining = pending.length - count + 1;
      console.log(`\n  ═══ ${count}/${pending.length} (${remaining} remaining): ${dir.name} ═══\n`);
      await submitToDirectory(state, dir);
    }

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║   BLITZ COMPLETE                                           ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    showStatus();
    return;
  }

  // Single directory submission
  const dir = DIRECTORIES.find((d) => d.id === command);
  if (!dir) {
    console.error(`  Unknown directory: "${command}". Run --help or list for options.`);
    process.exit(1);
  }

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   CODEC8 DIRECTORY SUBMISSION                              ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  await submitToDirectory(state, dir);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
