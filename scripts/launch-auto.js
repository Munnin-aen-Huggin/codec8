#!/usr/bin/env node

/**
 * Codec8 Launch — Auto Clipboard + Open URL
 *
 * Dead simple: copies content to clipboard, opens the submit URL in your
 * default browser. You paste and click submit. No API keys, no Playwright,
 * no browser automation. Just works.
 *
 * Usage:
 *   node scripts/launch-auto.js all        Step through all 6 platforms
 *   node scripts/launch-auto.js hn         Hacker News only
 *   node scripts/launch-auto.js twitter    Twitter only
 *   node scripts/launch-auto.js reddit     Both Reddit posts
 *   node scripts/launch-auto.js linkedin   LinkedIn only
 *   node scripts/launch-auto.js ph         Product Hunt only
 *   node scripts/launch-auto.js status     Show progress
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const STATE_FILE = join(__dirname, '.launch-state.json');

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

// ─── State ────────────────────────────────────────────────────────────────────

function loadState() {
  if (existsSync(STATE_FILE)) {
    return JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
  }
  return {
    launchDate: new Date().toISOString().split('T')[0],
    producthunt: { done: false, date: null },
    hackernews: { done: false, date: null },
    twitter: { done: false, date: null },
    reddit_sideproject: { done: false, date: null },
    reddit_webdev: { done: false, date: null },
    linkedin: { done: false, date: null },
  };
}

function saveState(state) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function markDone(state, key) {
  state[key] = { done: true, date: new Date().toISOString() };
  saveState(state);
}

// ─── Platform Launchers ───────────────────────────────────────────────────────

async function launchHN(state) {
  if (state.hackernews.done) {
    console.log('  Hacker News: already done. Skipping.\n');
    return;
  }

  const title = 'Auto-generate docs from GitHub repos in 30 seconds';
  const url = 'https://codec8.com';
  const comment = `Hey HN,

I built Codec8 to solve a problem I've had for years: documentation debt. We all know docs are important, but they always end up at the bottom of the to-do list.

What it does:
- Connect any GitHub repository (read-only OAuth)
- AI analyzes your codebase structure, dependencies, and key files
- Generates 4 types of docs: README, API reference, architecture diagrams (Mermaid), and setup guides
- Edit inline, export markdown, or create a PR directly

Tech stack: SvelteKit + TypeScript, Supabase (auth + database), Stripe for payments, deployed on Vercel.

What I learned building this:
- Context is everything. Generic prompts produce generic docs. Most development time went into the parsing logic — extracting relevant code patterns, config files, route structures — to give the AI enough context to produce useful output.
- Mermaid diagram generation is hard. Getting syntactically valid and semantically meaningful diagrams required extensive prompt iteration.
- The 80/20 rule applies: a generated README that's 80% right and needs 5 minutes of editing beats spending an hour writing one from scratch.

Pricing: Free for 1 repo. $99 lifetime deal for unlimited. No subscriptions.

Would love feedback, especially on:
1. What documentation formats would you add?
2. Any repos I can test it on? Happy to share the output.

Try it: https://codec8.com`;

  console.log('  ┌─ HACKER NEWS ─────────────────────────────────┐');
  console.log('  │ Opening HN submit page...                     │');
  console.log('  │ Title + URL pre-filled via URL params.        │');
  console.log('  │ Just click "submit" on the page.              │');
  console.log('  └───────────────────────────────────────────────┘\n');

  const hnUrl = `https://news.ycombinator.com/submitlink?u=${encodeURIComponent(url)}&t=${encodeURIComponent(title)}`;
  openUrl(hnUrl);

  await ask('  Press Enter after submitting the HN post...');

  // Now copy the first comment
  copyToClipboard(comment);
  console.log('\n  First comment copied to clipboard.');
  console.log('  Go to your new post and paste it as a comment (Cmd+V).\n');

  await ask('  Press Enter after posting the comment...');

  markDone(state, 'hackernews');
  console.log('  Hacker News: DONE\n');
}

async function launchTwitter(state) {
  if (state.twitter.done) {
    console.log('  Twitter: already done. Skipping.\n');
    return;
  }

  const tweets = [
    `I just launched Codec8 🚀

It auto-generates professional documentation for your GitHub repos in 30 seconds.

README, API docs, architecture diagrams, setup guides — all from your actual code.

Here's what it does and why I built it 🧵`,

    `Every developer knows this pain:

- Your README is outdated (or missing)
- You keep saying "I'll document it later"
- Contributors can't understand your code
- Your project looks abandoned

Good docs take hours. Who has time for that?`,

    `Codec8 reads your actual codebase:

→ Analyzes package.json, configs, folder structure
→ Understands your frameworks and dependencies
→ Generates docs that match YOUR project

Not generic templates. Real, context-aware documentation.`,

    `Here's how it works:

1. Connect your GitHub repo (read-only)
2. Select doc types (README, API, Architecture, Setup)
3. Click generate
4. Get professional docs in ~30 seconds`,

    `What you get:

📝 README — Project overview, features, quick start
🔌 API Docs — Endpoints, parameters, examples
🏗️ Architecture — System design with Mermaid diagrams
⚙️ Setup Guide — Installation, configuration, deployment

All editable. Export as markdown or create a PR.`,

    `Pricing:

🆓 Free: 1 repository
💰 Lifetime Deal: $99 (unlimited repos, forever)

No subscriptions. No recurring fees. The LTD won't last forever.`,

    `Try it free → https://codec8.com

What project would you document first? Drop a link below and I might generate docs for you live 👇`,
  ];

  console.log('  ┌─ TWITTER/X THREAD ───────────────────────────┐');
  console.log('  │ Posting 7-tweet thread, one at a time.        │');
  console.log('  │ Each tweet copied to clipboard → you paste.   │');
  console.log('  └───────────────────────────────────────────────┘\n');

  // Tweet 1: use intent URL to pre-fill
  const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweets[0])}`;
  console.log('  Tweet 1/7: Opening Twitter with first tweet pre-filled...');
  openUrl(intentUrl);

  await ask('  Post tweet 1, then press Enter...');

  // Tweets 2-7: copy to clipboard, user replies to thread
  for (let i = 1; i < tweets.length; i++) {
    copyToClipboard(tweets[i]);
    console.log(`\n  Tweet ${i + 1}/7: Copied to clipboard.`);
    console.log('  Click "Reply" on your last tweet, then paste (Cmd+V) and post.');
    await ask('  Press Enter after posting...');
  }

  markDone(state, 'twitter');
  console.log('  Twitter thread: DONE\n');
}

async function launchReddit(state, which) {
  const posts = {
    sideproject: {
      stateKey: 'reddit_sideproject',
      subreddit: 'SideProject',
      title: 'I built an AI tool that generates documentation for GitHub repos — Codec8',
      body: `Hey r/SideProject!

After years of putting off documentation, I finally built something to automate it.

**What is it?**
Codec8 connects to your GitHub repos and auto-generates professional documentation in 30 seconds. Not generic templates — it reads your actual code and creates docs specific to your project.

**What it generates:**
- README with project overview, features, quick start
- API documentation for your endpoints
- Architecture diagrams using Mermaid
- Setup/installation guides

**How it works:**
1. Sign in with GitHub (read-only access)
2. Connect a repository
3. Select what docs you need
4. Get results in ~30 seconds
5. Edit, export, or create a PR

**The boring business stuff:**
- Free tier: 1 repo
- Lifetime deal: $99 (no subscriptions!)
- Built with SvelteKit + Supabase

**Why I built it:**
I maintain a few projects and the documentation was always the last thing I updated. Spent a weekend writing docs and thought "there has to be a better way."

Would love to hear what you think! Happy to answer any questions or generate docs for your projects.

https://codec8.com`,
    },
    webdev: {
      stateKey: 'reddit_webdev',
      subreddit: 'webdev',
      title: 'I built a tool that generates README, API docs, and architecture diagrams from your GitHub repo',
      body: `Documentation is one of those things everyone agrees is important but nobody wants to do. I've been building web apps for years and my docs are always the weakest part of every project.

So I built Codec8 — it connects to your GitHub repo (read-only), analyzes the codebase, and generates 4 types of documentation:

1. **README** — Project overview, features, quick start with install commands
2. **API Reference** — Endpoints, parameters, response examples
3. **Architecture Overview** — System diagrams using Mermaid, data flow, design decisions
4. **Setup Guide** — Installation, environment setup, deployment

It actually reads your code — not just file names. So the output is specific to your project's frameworks, dependencies, and structure.

**Stack:** SvelteKit, TypeScript, Supabase, Stripe, Vercel

**Pricing:** Free for 1 repo, $99 lifetime for unlimited (no subscription).

Happy to generate docs for anyone's repo if you want to see the output quality before signing up.

https://codec8.com`,
    },
  };

  const targets = which === 'all' ? ['sideproject', 'webdev'] : [which];

  for (const key of targets) {
    const post = posts[key];
    if (state[post.stateKey].done) {
      console.log(`  Reddit r/${post.subreddit}: already done. Skipping.\n`);
      continue;
    }

    console.log(`  ┌─ REDDIT r/${post.subreddit} ${'─'.repeat(Math.max(0, 35 - post.subreddit.length))}┐`);
    console.log('  │ Step 1: Title copied → paste in title field          │');
    console.log('  │ Step 2: Body copied → paste in text field            │');
    console.log('  └───────────────────────────────────────────────────────┘\n');

    // Copy title and open submit page
    copyToClipboard(post.title);
    console.log('  Title copied to clipboard.');

    const redditUrl = `https://www.reddit.com/r/${post.subreddit}/submit?type=self`;
    openUrl(redditUrl);

    console.log('  Paste the title (Cmd+V), then press Enter for the body.\n');
    await ask('  Press Enter to copy body...');

    // Copy body
    copyToClipboard(post.body);
    console.log('  Body copied to clipboard. Paste it (Cmd+V), then submit.\n');

    await ask('  Press Enter after submitting...');

    markDone(state, post.stateKey);
    console.log(`  Reddit r/${post.subreddit}: DONE\n`);
  }
}

async function launchLinkedIn(state) {
  if (state.linkedin.done) {
    console.log('  LinkedIn: already done. Skipping.\n');
    return;
  }

  const post = `I just launched Codec8 🚀

It auto-generates professional documentation for GitHub repositories in 30 seconds.

The problem it solves:
Documentation is essential, but most of us put it off. A good README can be the difference between users adopting your project or bouncing after 5 seconds.

What it does:
→ Connect your GitHub repo
→ AI analyzes your codebase
→ Get README, API docs, architecture diagrams, setup guides
→ Edit and export or create a PR

Built with SvelteKit and TypeScript.

Try it free: codec8.com

What project would you document first?

#buildinpublic #developer #opensource #ai #documentation`;

  console.log('  ┌─ LINKEDIN ───────────────────────────────────┐');
  console.log('  │ Post copied to clipboard.                     │');
  console.log('  │ Click "Start a post", then paste (Cmd+V).    │');
  console.log('  └───────────────────────────────────────────────┘\n');

  copyToClipboard(post);
  console.log('  Post content copied to clipboard.');
  openUrl('https://www.linkedin.com/feed/');

  await ask('  Press Enter after posting...');

  markDone(state, 'linkedin');
  console.log('  LinkedIn: DONE\n');
}

async function launchPH(state) {
  if (state.producthunt.done) {
    console.log('  Product Hunt: already done. Skipping.\n');
    return;
  }

  const description = `Connect your GitHub repo and get professional README, API docs, architecture diagrams, and setup guides — all auto-generated in 30 seconds. Start free, then grab a Lifetime Deal for $99. No more putting off documentation.`;

  const makerComment = `Hey Product Hunt! 👋

I built Codec8 because I was tired of documentation debt. Every project I worked on had outdated (or missing) docs, and I kept saying "I'll write them later."

So I automated it. Connect your GitHub repo, and Codec8 reads your actual codebase — package.json, folder structure, route files, config — and generates 4 types of docs:

📝 README with project overview and quick start
🔌 API documentation with endpoints and examples
🏗️ Architecture diagrams using Mermaid
⚙️ Setup guide with installation and deployment steps

It's not generic templates. The output is specific to YOUR project.

I'm launching with a $99 lifetime deal — unlimited repos, forever. No subscriptions.

Want to test it? Drop a link to your repo in the comments and I'll generate docs for it live! 🙌`;

  console.log('  ┌─ PRODUCT HUNT ───────────────────────────────┐');
  console.log('  │ Note: PH requires maker access to post.      │');
  console.log('  │ If you have access, fill in the wizard.       │');
  console.log('  │ Details printed below for reference.          │');
  console.log('  └───────────────────────────────────────────────┘\n');
  console.log('  Product Name: Codec8');
  console.log('  Tagline: AI-powered documentation for GitHub repos in minutes, not hours');
  console.log('  URL: https://codec8.com');
  console.log('  Topics: Developer Tools, AI, Documentation, GitHub, Productivity\n');

  copyToClipboard(description);
  console.log('  Description copied to clipboard.');
  openUrl('https://www.producthunt.com/posts/new');

  await ask('  Complete the PH wizard, then press Enter for maker comment...');

  copyToClipboard(makerComment);
  console.log('  Maker comment copied to clipboard. Paste it as your first comment.\n');

  await ask('  Press Enter after posting the maker comment...');

  markDone(state, 'producthunt');
  console.log('  Product Hunt: DONE\n');
}

// ─── Status ───────────────────────────────────────────────────────────────────

function showStatus() {
  const state = loadState();

  console.log('\n=== Launch Status ===\n');

  const platforms = [
    ['Product Hunt', state.producthunt],
    ['Hacker News', state.hackernews],
    ['Twitter/X', state.twitter],
    ['Reddit r/SideProject', state.reddit_sideproject],
    ['Reddit r/webdev', state.reddit_webdev],
    ['LinkedIn', state.linkedin],
  ];

  console.log('Platform'.padEnd(24) + 'Status'.padEnd(10) + 'Date');
  console.log('─'.repeat(56));

  let done = 0;
  for (const [name, data] of platforms) {
    const status = data.done ? 'DONE' : 'PENDING';
    const date = data.date ? data.date.slice(0, 19).replace('T', ' ') : '—';
    if (data.done) done++;
    console.log(`${name.padEnd(24)}${status.padEnd(10)}${date}`);
  }

  console.log(`\nProgress: ${done}/${platforms.length}`);

  // Show Reddit value-first strategy status if state file exists
  const redditStateFile = join(__dirname, '.reddit-state.json');
  if (existsSync(redditStateFile)) {
    try {
      const redditState = JSON.parse(readFileSync(redditStateFile, 'utf-8'));
      const startDate = new Date(redditState.startDate);
      const now = new Date();
      startDate.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      const day = Math.floor((now - startDate) / (1000 * 60 * 60 * 24)) + 1;

      let totalComments = 0;
      let totalResources = 0;
      for (const [sub, data] of Object.entries(redditState.subreddits || {})) {
        totalComments += (data.comments || []).length;
        if (data.resourcePost) totalResources++;
      }

      console.log('\n=== Reddit Value-First Strategy ===\n');
      console.log(`Day: ${day} of 15`);
      console.log(`Total comments: ${totalComments}`);
      console.log(`Resource posts: ${totalResources}/5`);
      console.log(`Subreddits: ${Object.keys(redditState.subreddits || {}).join(', ')}`);
      console.log(`\nRun "node scripts/reddit-bot.js status" for detailed breakdown.`);
    } catch {
      // Silently skip if state is corrupted
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const command = process.argv[2];

  if (!command || command === '--help') {
    console.log(`
Codec8 Launch Tool

Usage:
  node scripts/launch-auto.js all        Full launch (all 6 platforms)
  node scripts/launch-auto.js hn         Hacker News
  node scripts/launch-auto.js twitter    Twitter/X thread
  node scripts/launch-auto.js reddit     Reddit (both subs)
  node scripts/launch-auto.js linkedin   LinkedIn
  node scripts/launch-auto.js ph         Product Hunt
  node scripts/launch-auto.js status     Show progress

How it works:
  1. Copies content to your clipboard (pbcopy)
  2. Opens the submit URL in your browser
  3. You paste (Cmd+V) and click submit
  4. Press Enter → moves to next platform

No API keys. No browser automation. Just clipboard + your browser.
`);
    return;
  }

  if (command === 'status') {
    showStatus();
    return;
  }

  const state = loadState();

  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   CODEC8 LAUNCH                             ║');
  console.log('╚════════════════════════════════════════════╝\n');

  switch (command) {
    case 'all':
      console.log('Launching across all platforms.\n');
      console.log('For each: content → clipboard → browser opens → paste → submit.\n');

      console.log('═══ 1/6: Hacker News ═══\n');
      await launchHN(state);

      console.log('═══ 2/6: Twitter/X ═══\n');
      await launchTwitter(state);

      console.log('═══ 3/6: Reddit r/SideProject ═══\n');
      await launchReddit(state, 'sideproject');

      console.log('═══ 4/6: Reddit r/webdev ═══\n');
      await launchReddit(state, 'webdev');

      console.log('═══ 5/6: LinkedIn ═══\n');
      await launchLinkedIn(state);

      console.log('═══ 6/6: Product Hunt ═══\n');
      await launchPH(state);

      console.log('╔════════════════════════════════════════════╗');
      console.log('║   ALL DONE                                  ║');
      console.log('╚════════════════════════════════════════════╝\n');
      showStatus();
      break;

    case 'hn':
      await launchHN(state);
      break;
    case 'twitter':
      await launchTwitter(state);
      break;
    case 'reddit':
      await launchReddit(state, 'all');
      break;
    case 'linkedin':
      await launchLinkedIn(state);
      break;
    case 'ph':
      await launchPH(state);
      break;
    default:
      console.error(`Unknown: ${command}. Run --help for usage.`);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
