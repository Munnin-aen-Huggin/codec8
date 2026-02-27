#!/usr/bin/env node

import Snoowrap from 'snoowrap';
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const STATE_FILE = join(__dirname, '.reddit-state.json');

// Load .env manually (no dotenv dependency needed)
function loadEnv() {
  const envPath = join(__dirname, '..', '.env');
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnv();

// ─── Config ───────────────────────────────────────────────────────────────────

const SUBREDDITS = {
  webdev: {
    searchTerms: ['documentation', 'readme', 'project structure', 'onboarding developer', 'technical debt', 'code review', 'developer experience'],
    topic: 'web development documentation and project structure',
  },
  learnprogramming: {
    searchTerms: ['documentation', 'readme', 'portfolio project', 'how to document', 'github profile', 'first project', 'beginner project'],
    topic: 'learning to write documentation and portfolio projects',
  },
  SaaS: {
    searchTerms: ['documentation', 'support tickets', 'onboarding', 'churn', 'user docs', 'developer tools', 'dev tool launch', 'technical documentation'],
    topic: 'SaaS documentation, reducing support load, and user onboarding',
  },
  opensource: {
    searchTerms: ['readme', 'contributors', 'getting started', 'documentation', 'contribution guide', 'maintainer', 'first contribution'],
    topic: 'open source README quality and contributor onboarding',
  },
  ExperiencedDevs: {
    searchTerms: ['onboarding', 'documentation', 'knowledge transfer', 'technical writing', 'code documentation', 'new developer', 'developer productivity'],
    topic: 'developer onboarding, documentation culture, and knowledge sharing',
  },
};

const MAX_COMMENTS_PER_SUB_PER_DAY = 3;
const MAX_COMMENTS_PER_DAY = 15;
const MIN_UPVOTES = 2;
const DELAY_MIN_MS = 30000;
const DELAY_MAX_MS = 60000;
const RESOURCE_POST_MIN_DAY = 8;

// Resource posts from reddit-strategy.md
const RESOURCE_POSTS = {
  webdev: {
    title: 'I made a free documentation checklist for web projects (covers the 4 doc types every repo needs)',
    body: `Hey r/webdev,

I've been documenting projects professionally for a while and kept using the same checklist, so I cleaned it up and made it public.

**The checklist covers 4 documentation types:**

1. **README** — Project overview, features list, quick start (with copy-paste install commands), contributing guidelines
2. **API Documentation** — Every endpoint/function with parameters, return types, and working examples
3. **Architecture Overview** — System diagram, data flow, key design decisions and why you made them
4. **Setup Guide** — Environment requirements, configuration, deployment steps, troubleshooting common errors

**The Google Doc:** {link}

Each section has a checkbox format so you can literally check off items as you write them. I also included examples of what good vs. bad documentation looks like for each type.

I use this for every project now. Has saved me hours of "what am I forgetting" anxiety.

What documentation patterns have worked for you? Always looking to improve the checklist.`,
    envKey: 'GOOGLE_DOC_WEBDEV',
    minDay: 8,
  },
  learnprogramming: {
    title: 'I created a free guide: "How to write documentation that actually helps people use your code"',
    body: `Hey r/learnprogramming,

I see a lot of questions here about documentation — when to write it, how to structure it, what to include. So I put together a free guide based on patterns I've seen in successful open source projects.

**What the guide covers:**

- The 4 types of documentation every project needs (and which one to write first)
- A fill-in-the-blank README template that works for any project
- How to write API docs that developers actually read
- Architecture docs: how to explain your design decisions
- Common mistakes that make documentation useless

**Free Google Doc:** {link}

The README template alone will level up your portfolio projects. Hiring managers notice when a candidate can communicate clearly about their code.

This started as notes I kept for myself and grew into something I thought others might find useful. Hope it helps!

What's the hardest part about documentation for you? I'd love to add more sections based on what people struggle with.`,
    envKey: 'GOOGLE_DOC_LEARNPROGRAMMING',
    minDay: 9,
  },
  SaaS: {
    title: 'Free template pack: The 4 documentation pages every SaaS needs to reduce support tickets',
    body: `Hey r/SaaS,

After running a SaaS and watching the same support questions come in over and over, I realized most of them were documentation failures, not product failures.

So I put together a free template pack for the 4 docs that eliminate the most support load:

**1. Getting Started Guide** — Reduces "how do I set this up?" tickets
- First-time user flow
- Environment/prerequisites checklist
- Step-by-step with screenshots

**2. API Reference** — Reduces "how do I integrate?" tickets
- Authentication
- Endpoints with examples
- Error codes and what they mean

**3. Architecture Overview** — Helps your team onboard faster
- System diagram
- Data flow
- Key technical decisions

**4. FAQ / Troubleshooting** — Catches everything else
- Common errors and fixes
- Configuration gotchas
- Migration guides

**Free template pack (Google Doc):** {link}

Each template is fill-in-the-blank — just replace the [bracketed text] with your product's specifics.

We cut our support tickets by ~35% after filling these out properly. The ROI on documentation is insane if you actually do it.

What documentation has helped your SaaS the most?`,
    envKey: 'GOOGLE_DOC_SAAS',
    minDay: 11,
  },
  opensource: {
    title: 'I made a free README template that helped my project go from 0 to 50 stars in a week',
    body: `Hey r/opensource,

I was frustrated that my projects weren't getting traction despite having solid code. Turns out the problem was my README.

I studied the top-starred repos in my niche and noticed they all follow the same structure. So I made a template:

**The README template structure:**
1. One-line description + badge row
2. "What it does" — 3 bullet points, no jargon
3. Screenshot or GIF (even a terminal recording counts)
4. Quick Start — copy-paste commands to get running in < 2 min
5. Key Features — brief list with code examples
6. API / Usage — the most common operations
7. Contributing — how to set up dev environment + what you need help with
8. License

**Free template (Google Doc):** {link}

The key insight: your README is a landing page, not a manual. The first 10 lines determine if someone installs your package or bounces.

After rewriting my README using this template, I went from 0 stars to 50 in a week. Not viral, but way more engagement than before.

What README patterns have you found work best for getting contributors?`,
    envKey: 'GOOGLE_DOC_OPENSOURCE',
    minDay: 13,
  },
  ExperiencedDevs: {
    title: 'Free developer onboarding docs template — reduced our new hire ramp-up from 3 weeks to 1',
    body: `After watching multiple new hires struggle through the same onboarding confusion, I finally documented our setup properly. Sharing the template in case it helps other teams.

**What the template covers:**

1. **Environment Setup** — Every tool, version, and config needed
2. **Architecture Map** — How services connect, where data flows
3. **Key Decisions** — Why we chose X over Y (prevents "why don't we just..." questions)
4. **Common Tasks** — How to deploy, run tests, create a PR, debug locally
5. **Who Owns What** — Team structure, code ownership, escalation paths

**Free template (Google Doc):** {link}

The biggest win was the "Key Decisions" section. New devs stopped suggesting rewrites of things we'd already evaluated and rejected.

Result: new hire ramp-up went from ~3 weeks of hand-holding to ~1 week of self-directed learning.

What documentation has been most impactful for your team's onboarding?`,
    envKey: 'GOOGLE_DOC_EXPERIENCEDDEVS',
    minDay: 15,
  },
};

// ─── State Management ─────────────────────────────────────────────────────────

function loadState() {
  if (existsSync(STATE_FILE)) {
    return JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
  }
  const initial = {
    startDate: new Date().toISOString().split('T')[0],
    subreddits: {},
  };
  for (const sub of Object.keys(SUBREDDITS)) {
    initial.subreddits[sub] = { comments: [], resourcePost: null };
  }
  saveState(initial);
  return initial;
}

function saveState(state) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function getDayNumber(state) {
  const start = new Date(state.startDate);
  const now = new Date();
  start.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1;
}

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

function getCommentsToday(state, subreddit) {
  const today = getTodayStr();
  return state.subreddits[subreddit].comments.filter((c) => c.date === today);
}

function getTotalCommentsToday(state) {
  const today = getTodayStr();
  let total = 0;
  for (const sub of Object.keys(state.subreddits)) {
    total += state.subreddits[sub].comments.filter((c) => c.date === today).length;
  }
  return total;
}

// ─── Reddit Client ────────────────────────────────────────────────────────────

function createRedditClient() {
  const required = ['REDDIT_CLIENT_ID', 'REDDIT_CLIENT_SECRET', 'REDDIT_USERNAME', 'REDDIT_PASSWORD'];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    console.error(`\nMissing environment variables: ${missing.join(', ')}`);
    console.error('\nAdd these to your .env file:');
    console.error('  REDDIT_CLIENT_ID=xxx');
    console.error('  REDDIT_CLIENT_SECRET=xxx');
    console.error('  REDDIT_USERNAME=xxx');
    console.error('  REDDIT_PASSWORD=xxx');
    console.error('\nGet credentials at: https://www.reddit.com/prefs/apps');
    process.exit(1);
  }

  return new Snoowrap({
    userAgent: `codec8-marketing-bot/1.0 by /u/${process.env.REDDIT_USERNAME}`,
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD,
  });
}

// ─── Claude Client ────────────────────────────────────────────────────────────

function createClaudeClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('\nMissing ANTHROPIC_API_KEY in .env');
    process.exit(1);
  }
  return new Anthropic();
}

async function generateComment(claude, subreddit, title, body) {
  const postContent = body ? `${title}\n\n${body}` : title;
  const truncated = postContent.slice(0, 2000);

  const response = await claude.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: `You are a senior developer who genuinely cares about documentation quality. You have 10+ years of experience and have seen firsthand how good docs transform teams. You are writing a helpful Reddit comment in r/${subreddit}.

Post title: ${title}
Post content: ${truncated}

Here are examples of high-performing Reddit comments for reference (mimic this style):

Example 1: "At my last company we had a 'docs-first' rule — no PR got merged without updating the relevant docs. Felt annoying at first but after 6 months our onboarding time dropped from 3 weeks to about 4 days. The trick was making docs part of the definition of done, not a separate task. What does your team's process look like for keeping docs current?"

Example 2: "I spent a weekend rewriting our README from a wall of text into a 'Quick Start in 60 seconds' section followed by detailed docs. Stars went from ~20 to 200 in a month. People literally told me they picked our library over a competitor because the README made it look easier. Curious — do you find that contributors read the CONTRIBUTING.md or just wing it?"

Example 3: "One thing that changed my perspective on docs was treating them like a product. I started asking 'who is reading this and what do they need right now?' instead of just dumping everything I knew. Made a huge difference in the quality of questions I got from new hires. Are you writing docs mostly for yourself or for a team?"

Write a genuinely helpful reply (3-5 sentences) that:
- Directly addresses the question or topic
- Shares practical, specific advice about documentation
- Includes a brief personal anecdote or experience to increase authenticity
- Ends with a follow-up question to drive replies and boost visibility
- Sounds natural and conversational (like a real developer sharing experience)
- Does NOT mention any product, tool, or link
- Does NOT use emojis or marketing language
- Does NOT start with "Great question!" or similar filler

Just write the comment text, nothing else.`,
      },
    ],
  });

  return response.content[0].text.trim();
}

// ─── Delay Utility ────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay() {
  return DELAY_MIN_MS + Math.random() * (DELAY_MAX_MS - DELAY_MIN_MS);
}

// ─── Comment Mode ─────────────────────────────────────────────────────────────

async function runCommentMode(dryRun) {
  const state = loadState();
  const day = getDayNumber(state);
  const totalToday = getTotalCommentsToday(state);

  console.log(`\n=== Reddit Comment Bot ===`);
  console.log(`Day: ${day} | Comments today: ${totalToday}/${MAX_COMMENTS_PER_DAY}`);
  console.log(`Mode: ${dryRun ? 'DRY RUN (no posts)' : 'LIVE'}\n`);

  if (totalToday >= MAX_COMMENTS_PER_DAY) {
    console.log('Daily comment limit reached. Try again tomorrow.');
    return;
  }

  const reddit = createRedditClient();
  const claude = createClaudeClient();
  let totalPosted = 0;

  for (const [subreddit, config] of Object.entries(SUBREDDITS)) {
    if (getTotalCommentsToday(state) >= MAX_COMMENTS_PER_DAY) break;

    const subCommentsToday = getCommentsToday(state, subreddit).length;
    if (subCommentsToday >= MAX_COMMENTS_PER_SUB_PER_DAY) {
      console.log(`[r/${subreddit}] Already at ${subCommentsToday}/${MAX_COMMENTS_PER_SUB_PER_DAY} comments today — skipping`);
      continue;
    }

    const remaining = Math.min(
      MAX_COMMENTS_PER_SUB_PER_DAY - subCommentsToday,
      MAX_COMMENTS_PER_DAY - getTotalCommentsToday(state)
    );

    console.log(`\n--- r/${subreddit} (${remaining} comments remaining) ---`);

    // Search for relevant posts
    const allCommentedIds = new Set(state.subreddits[subreddit].comments.map((c) => c.postId));
    let candidates = [];

    for (const term of config.searchTerms) {
      try {
        const results = await reddit.getSubreddit(subreddit).search({
          query: term,
          time: 'week',
          sort: 'relevance',
          limit: 10,
        });

        for (const post of results) {
          if (allCommentedIds.has(post.id)) continue;
          if (post.score < MIN_UPVOTES) continue;
          if (post.locked || post.archived) continue;

          // Skip if already in candidates
          if (candidates.some((c) => c.id === post.id)) continue;

          candidates.push({
            id: post.id,
            title: post.title,
            body: post.selftext,
            score: post.score,
            numComments: post.num_comments,
            url: `https://reddit.com${post.permalink}`,
            created: post.created_utc,
          });
        }
      } catch (err) {
        console.error(`  Search error for "${term}" (relevance): ${err.message}`);
      }

      // Brief delay between searches
      await sleep(2000);
    }

    // Also search with 'hot' sort to catch trending posts
    for (const term of config.searchTerms) {
      try {
        const results = await reddit.getSubreddit(subreddit).search({
          query: term,
          time: 'day',
          sort: 'hot',
          limit: 10,
        });

        for (const post of results) {
          if (allCommentedIds.has(post.id)) continue;
          if (post.score < MIN_UPVOTES) continue;
          if (post.locked || post.archived) continue;

          // Skip if already in candidates
          if (candidates.some((c) => c.id === post.id)) continue;

          candidates.push({
            id: post.id,
            title: post.title,
            body: post.selftext,
            score: post.score,
            numComments: post.num_comments,
            url: `https://reddit.com${post.permalink}`,
            created: post.created_utc,
          });
        }
      } catch (err) {
        console.error(`  Search error for "${term}" (hot): ${err.message}`);
      }

      // Brief delay between searches
      await sleep(2000);
    }

    // Sort by weighted score: favor fresh posts with momentum and sweet-spot comment counts
    const now = Date.now() / 1000;
    candidates.sort((a, b) => {
      const hoursOldA = Math.max(1, (now - a.created) / 3600);
      const hoursOldB = Math.max(1, (now - b.created) / 3600);
      const scoreA = a.score * (1 / hoursOldA) * (a.numComments >= 5 && a.numComments <= 20 ? 1.5 : 1);
      const scoreB = b.score * (1 / hoursOldB) * (b.numComments >= 5 && b.numComments <= 20 ? 1.5 : 1);
      return scoreB - scoreA;
    });
    // Filter out posts with >50 comments (too crowded)
    candidates = candidates.filter(c => c.numComments <= 50);
    candidates = candidates.slice(0, remaining);

    if (candidates.length === 0) {
      console.log('  No suitable posts found');
      continue;
    }

    console.log(`  Found ${candidates.length} posts to comment on:`);

    for (const post of candidates) {
      console.log(`\n  Post: "${post.title}" (${post.score} upvotes)`);
      console.log(`  URL: ${post.url}`);

      try {
        // Generate comment with Claude
        const comment = await generateComment(claude, subreddit, post.title, post.body);
        console.log(`  Comment: "${comment.slice(0, 120)}${comment.length > 120 ? '...' : ''}"`);

        if (dryRun) {
          console.log(`  [DRY RUN] Would post this comment`);
          console.log(`  Full comment:\n    ${comment.replace(/\n/g, '\n    ')}`);
        } else {
          // Post the comment
          const submission = reddit.getSubmission(post.id);
          const reply = await submission.reply(comment);

          // Log to state
          state.subreddits[subreddit].comments.push({
            postId: post.id,
            commentId: reply.id || 'unknown',
            date: getTodayStr(),
            day: day,
            postTitle: post.title.slice(0, 100),
          });
          saveState(state);

          totalPosted++;
          console.log(`  POSTED successfully`);

          // Rate limit delay
          const delay = randomDelay();
          console.log(`  Waiting ${Math.round(delay / 1000)}s before next comment...`);
          await sleep(delay);
        }
      } catch (err) {
        console.error(`  Error: ${err.message}`);
        if (err.message.includes('RATELIMIT')) {
          console.log('  Rate limited by Reddit. Stopping for now.');
          saveState(state);
          return;
        }
      }
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Comments ${dryRun ? 'would be ' : ''}posted: ${dryRun ? candidates?.length || 0 : totalPosted}`);
  console.log(`Total comments today: ${getTotalCommentsToday(state)}`);
}

// ─── Post Mode ────────────────────────────────────────────────────────────────

async function runPostMode(subreddit) {
  if (!RESOURCE_POSTS[subreddit]) {
    console.error(`\nUnknown subreddit: ${subreddit}`);
    console.error(`Valid options: ${Object.keys(RESOURCE_POSTS).join(', ')}`);
    process.exit(1);
  }

  const state = loadState();
  const day = getDayNumber(state);
  const postConfig = RESOURCE_POSTS[subreddit];

  console.log(`\n=== Reddit Resource Post ===`);
  console.log(`Subreddit: r/${subreddit}`);
  console.log(`Day: ${day} (minimum: ${postConfig.minDay})\n`);

  // Day gate
  if (day < postConfig.minDay) {
    console.error(`Too early! Resource posts for r/${subreddit} require day ${postConfig.minDay}+.`);
    console.error(`Current day: ${day}. Wait ${postConfig.minDay - day} more day(s).`);
    process.exit(1);
  }

  // Already posted check
  if (state.subreddits[subreddit].resourcePost) {
    console.error(`Resource post already submitted to r/${subreddit}!`);
    console.error(`Posted on: ${state.subreddits[subreddit].resourcePost.date}`);
    console.error(`URL: ${state.subreddits[subreddit].resourcePost.url}`);
    process.exit(1);
  }

  // Google Doc URL
  const docUrl = process.env[postConfig.envKey];
  if (!docUrl) {
    console.error(`Missing ${postConfig.envKey} in .env`);
    console.error(`\nAdd your Google Doc URL: ${postConfig.envKey}=https://docs.google.com/...`);
    process.exit(1);
  }

  const body = postConfig.body.replace('{link}', docUrl);

  console.log(`Title: ${postConfig.title}`);
  console.log(`Google Doc: ${docUrl}`);
  console.log(`\nBody preview:\n${body.slice(0, 300)}...\n`);

  const reddit = createRedditClient();

  try {
    const submission = await reddit.getSubreddit(subreddit).submitSelfpost({
      title: postConfig.title,
      text: body,
    });

    const postUrl = `https://reddit.com${submission.permalink || `/r/${subreddit}/comments/${submission.id}`}`;

    state.subreddits[subreddit].resourcePost = {
      postId: submission.id || 'unknown',
      date: getTodayStr(),
      day: day,
      url: postUrl,
    };
    saveState(state);

    console.log(`POSTED successfully!`);
    console.log(`URL: ${postUrl}`);
  } catch (err) {
    console.error(`Failed to post: ${err.message}`);
    process.exit(1);
  }
}

// ─── Status Mode ──────────────────────────────────────────────────────────────

function runStatus() {
  const state = loadState();
  const day = getDayNumber(state);
  const today = getTodayStr();

  console.log(`\n=== Reddit Marketing Status ===`);
  console.log(`Start date: ${state.startDate}`);
  console.log(`Current day: ${day}`);
  console.log(`Today: ${today}\n`);

  // Table header
  const header = 'Subreddit'.padEnd(20) + 'Total'.padEnd(8) + 'Today'.padEnd(8) + 'Left'.padEnd(8) + 'Resource Post'.padEnd(16) + 'Next Action';
  console.log(header);
  console.log('-'.repeat(header.length));

  for (const [sub, data] of Object.entries(state.subreddits)) {
    const total = data.comments.length;
    const todayCount = data.comments.filter((c) => c.date === today).length;
    const remaining = MAX_COMMENTS_PER_SUB_PER_DAY - todayCount;
    const postConfig = RESOURCE_POSTS[sub];

    let resourceStatus;
    if (data.resourcePost) {
      resourceStatus = `Done (day ${data.resourcePost.day})`;
    } else if (day >= postConfig.minDay) {
      resourceStatus = 'READY';
    } else {
      resourceStatus = `Day ${postConfig.minDay}`;
    }

    let nextAction;
    if (todayCount < MAX_COMMENTS_PER_SUB_PER_DAY) {
      nextAction = `Post ${remaining} comment(s)`;
    } else {
      nextAction = 'Done for today';
    }
    if (!data.resourcePost && day >= postConfig.minDay) {
      nextAction = `POST RESOURCE (run: post ${sub})`;
    }

    const row =
      `r/${sub}`.padEnd(20) +
      String(total).padEnd(8) +
      String(todayCount).padEnd(8) +
      String(Math.max(0, remaining)).padEnd(8) +
      resourceStatus.padEnd(16) +
      nextAction;
    console.log(row);
  }

  const totalToday = getTotalCommentsToday(state);
  console.log(`\nTotal comments today: ${totalToday}/${MAX_COMMENTS_PER_DAY}`);
  console.log(`Total comments all-time: ${Object.values(state.subreddits).reduce((sum, s) => sum + s.comments.length, 0)}`);

  // Recent activity
  const allComments = [];
  for (const [sub, data] of Object.entries(state.subreddits)) {
    for (const c of data.comments) {
      allComments.push({ ...c, subreddit: sub });
    }
  }
  allComments.sort((a, b) => b.date.localeCompare(a.date));

  if (allComments.length > 0) {
    console.log(`\nRecent comments (last 5):`);
    for (const c of allComments.slice(0, 5)) {
      console.log(`  [${c.date}] r/${c.subreddit} — "${c.postTitle || c.postId}" (day ${c.day})`);
    }
  }
}

// ─── Check Mode ──────────────────────────────────────────────────────────────

async function runCheckMode() {
  const state = loadState();
  const reddit = createRedditClient();

  console.log(`\n=== Reddit Engagement Check ===\n`);

  const allComments = [];
  for (const [sub, data] of Object.entries(state.subreddits)) {
    for (const c of data.comments) {
      if (c.commentId && c.commentId !== 'unknown') {
        allComments.push({ ...c, subreddit: sub });
      }
    }
  }

  if (allComments.length === 0) {
    console.log('No tracked comments found. Run "comment" mode first.');
    return;
  }

  console.log(`Checking ${allComments.length} comment(s)...\n`);

  const results = [];
  const subStats = {};

  for (const c of allComments) {
    try {
      const comment = await reddit.getComment(c.commentId).fetch();
      const daysAgo = Math.round((Date.now() / 1000 - comment.created_utc) / 86400);
      const replies = comment.replies ? comment.replies.length : 0;

      results.push({
        subreddit: c.subreddit,
        postTitle: (c.postTitle || c.postId).slice(0, 40),
        score: comment.score,
        replies: replies,
        daysAgo: daysAgo,
      });

      if (!subStats[c.subreddit]) {
        subStats[c.subreddit] = { totalScore: 0, totalReplies: 0, count: 0 };
      }
      subStats[c.subreddit].totalScore += comment.score;
      subStats[c.subreddit].totalReplies += replies;
      subStats[c.subreddit].count++;

      // Brief delay to avoid rate limits
      await sleep(1000);
    } catch (err) {
      console.error(`  Error fetching comment ${c.commentId}: ${err.message}`);
    }
  }

  // Print results table
  const header = 'Subreddit'.padEnd(20) + 'Post Title'.padEnd(42) + 'Score'.padEnd(8) + 'Replies'.padEnd(10) + 'Days Ago';
  console.log(header);
  console.log('-'.repeat(header.length));

  for (const r of results) {
    const row =
      `r/${r.subreddit}`.padEnd(20) +
      r.postTitle.padEnd(42) +
      String(r.score).padEnd(8) +
      String(r.replies).padEnd(10) +
      String(r.daysAgo);
    console.log(row);
  }

  // Subreddit summary
  console.log(`\n=== Engagement by Subreddit ===\n`);
  const sumHeader = 'Subreddit'.padEnd(20) + 'Comments'.padEnd(10) + 'Avg Score'.padEnd(12) + 'Avg Replies';
  console.log(sumHeader);
  console.log('-'.repeat(sumHeader.length));

  const sortedSubs = Object.entries(subStats).sort(
    (a, b) => (b[1].totalScore / b[1].count) - (a[1].totalScore / a[1].count)
  );

  for (const [sub, stats] of sortedSubs) {
    const row =
      `r/${sub}`.padEnd(20) +
      String(stats.count).padEnd(10) +
      (stats.totalScore / stats.count).toFixed(1).padEnd(12) +
      (stats.totalReplies / stats.count).toFixed(1);
    console.log(row);
  }

  if (sortedSubs.length > 0) {
    console.log(`\nBest engagement: r/${sortedSubs[0][0]} (avg score: ${(sortedSubs[0][1].totalScore / sortedSubs[0][1].count).toFixed(1)})`);
  }
}

// ─── LinkedIn Mode ───────────────────────────────────────────────────────────

async function runLinkedInMode() {
  const claude = createClaudeClient();

  console.log(`\n=== LinkedIn Post Generator ===\n`);
  console.log('Generating value-first LinkedIn post about documentation...\n');

  const response = await claude.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 600,
    messages: [
      {
        role: 'user',
        content: `You are a senior developer writing a LinkedIn post about the importance of code documentation.

Write a value-first LinkedIn post (150-250 words) that:
- Opens with a bold, attention-grabbing first line (this is critical for LinkedIn)
- Shares a concrete insight or personal experience about documentation
- Provides 3-5 actionable tips or a framework
- Uses short paragraphs and line breaks for readability (LinkedIn style)
- Ends with a question to drive engagement
- Does NOT mention any specific product, tool, or link
- Does NOT use hashtags excessively (max 3 at the very end)
- Sounds authentic, not like marketing copy
- Focuses on a specific angle (e.g., onboarding, open source, reducing support load, or technical debt)

Just write the post text, nothing else.`,
      },
    ],
  });

  const post = response.content[0].text.trim();

  console.log('Generated LinkedIn post:\n');
  console.log('─'.repeat(60));
  console.log(post);
  console.log('─'.repeat(60));

  // Copy to clipboard
  try {
    const { execSync } = await import('child_process');
    execSync('pbcopy', { input: post });
    console.log('\nPost copied to clipboard!');
  } catch (err) {
    console.error('\nCould not copy to clipboard. Please copy the text above manually.');
  }

  // Open LinkedIn
  try {
    const { execSync } = await import('child_process');
    execSync('open "https://www.linkedin.com/feed/"');
    console.log('LinkedIn opened in browser.');
  } catch (err) {
    console.log('Open https://www.linkedin.com/feed/ in your browser.');
  }

  console.log('\nInstructions:');
  console.log('  1. Click "Start a post" on LinkedIn');
  console.log('  2. Paste the copied text (Cmd+V)');
  console.log('  3. Review and edit as needed');
  console.log('  4. Click "Post"');
}

// ─── CLI Entry Point ──────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const command = args[0];

if (!command || command === '--help' || command === '-h') {
  console.log(`
Reddit Marketing Bot for Codec8

Usage:
  node scripts/reddit-bot.js comment              Find posts & post AI-generated value comments
  node scripts/reddit-bot.js comment --dry-run     Preview comments without posting
  node scripts/reddit-bot.js post <subreddit>      Submit resource post (day 8+)
  node scripts/reddit-bot.js status                Show progress across all subreddits
  node scripts/reddit-bot.js check                 Check engagement on posted comments
  node scripts/reddit-bot.js linkedin              Generate a LinkedIn post & copy to clipboard

Subreddits: ${Object.keys(SUBREDDITS).join(', ')}

Environment variables required in .env:
  REDDIT_CLIENT_ID        Reddit app client ID
  REDDIT_CLIENT_SECRET    Reddit app client secret
  REDDIT_USERNAME         Reddit username
  REDDIT_PASSWORD         Reddit password
  ANTHROPIC_API_KEY       Claude API key (already set)

For resource posts, also set:
  GOOGLE_DOC_WEBDEV             Google Doc URL for r/webdev
  GOOGLE_DOC_LEARNPROGRAMMING   Google Doc URL for r/learnprogramming
  GOOGLE_DOC_SAAS               Google Doc URL for r/SaaS
  GOOGLE_DOC_OPENSOURCE         Google Doc URL for r/opensource
  GOOGLE_DOC_EXPERIENCEDDEVS    Google Doc URL for r/ExperiencedDevs
`);
  process.exit(0);
}

switch (command) {
  case 'comment': {
    const dryRun = args.includes('--dry-run');
    runCommentMode(dryRun).catch((err) => {
      console.error(`\nFatal error: ${err.message}`);
      process.exit(1);
    });
    break;
  }
  case 'post': {
    const subreddit = args[1];
    if (!subreddit) {
      console.error('Usage: node scripts/reddit-bot.js post <subreddit>');
      console.error(`Options: ${Object.keys(RESOURCE_POSTS).join(', ')}`);
      process.exit(1);
    }
    runPostMode(subreddit).catch((err) => {
      console.error(`\nFatal error: ${err.message}`);
      process.exit(1);
    });
    break;
  }
  case 'status':
    runStatus();
    break;
  case 'check':
    runCheckMode().catch((err) => {
      console.error(`\nFatal error: ${err.message}`);
      process.exit(1);
    });
    break;
  case 'linkedin':
    runLinkedInMode().catch((err) => {
      console.error(`\nFatal error: ${err.message}`);
      process.exit(1);
    });
    break;
  default:
    console.error(`Unknown command: ${command}`);
    console.error('Run with --help for usage.');
    process.exit(1);
}
