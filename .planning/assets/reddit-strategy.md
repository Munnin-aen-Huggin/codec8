# Reddit Launch Strategy — Codec8

## The Method: Value-First Resource Posts

Instead of direct selling, post genuinely useful free resources with a natural upsell to Codec8.

---

## Target Subreddits

| Subreddit | Members | Pain Point | Free Resource |
|-----------|---------|------------|---------------|
| r/webdev | 2.4M | Repos with no docs, onboarding friction | Documentation checklist |
| r/learnprogramming | 4.2M | Don't know how to write docs | "How to Document" guide |
| r/SaaS | 150K | Documentation debt, user churn | SaaS documentation template pack |
| r/opensource | 300K | READMEs that don't convert contributors | Open source README template |
| r/ExperiencedDevs | 200K | Team onboarding takes too long | Developer onboarding docs template |

---

## Phase 1: Karma Building (Days 1-7)

### Daily Actions (3 comments per subreddit per day)

**r/webdev — helpful comment templates:**

> For documentation, I've found it helps to break it into 4 parts: README (what it does + quick start), API reference (endpoints/functions), architecture overview (how things connect), and a setup guide. Tackle them in that order — the README alone gives you 80% of the value.

> One thing that helped my open source project get more contributors: I added a "Project Structure" section to the README that explained what each top-level folder does. Contributors went from 0 to 5/month.

> The best documentation tip I ever got: write it before you forget why you made that decision. Future you will thank current you.

**r/learnprogramming — helpful comment templates:**

> Good documentation follows this pattern: 1) What is this? (one sentence) 2) Why would I use it? 3) How do I install it? 4) Show me the simplest working example. If your README covers those four things, you're ahead of 90% of projects.

> For your portfolio projects, a solid README is more impressive than fancy features. Hiring managers look at whether you can communicate clearly about your code.

**r/SaaS — helpful comment templates:**

> Documentation is one of the most underrated retention tools. We reduced support tickets by 40% just by adding proper setup guides and API docs. The time investment pays for itself in the first week.

> If your users have to ask how something works, that's a documentation bug, not a user bug.

**r/opensource — helpful comment templates:**

> The #1 reason people bounce from open source repos: the README doesn't tell them how to get started in under 2 minutes. If your "Getting Started" section has more than 5 steps, simplify it.

---

## Phase 2: Free Resource Posts (Day 8+)

### Post 1: r/webdev

**Title:** I made a free documentation checklist for web projects (covers the 4 doc types every repo needs)

**Body:**
```
Hey r/webdev,

I've been documenting projects professionally for a while and kept using the same checklist, so I cleaned it up and made it public.

**The checklist covers 4 documentation types:**

1. **README** — Project overview, features list, quick start (with copy-paste install commands), contributing guidelines
2. **API Documentation** — Every endpoint/function with parameters, return types, and working examples
3. **Architecture Overview** — System diagram, data flow, key design decisions and why you made them
4. **Setup Guide** — Environment requirements, configuration, deployment steps, troubleshooting common errors

**The Google Doc:** [link]

Each section has a checkbox format so you can literally check off items as you write them. I also included examples of what good vs. bad documentation looks like for each type.

I use this for every project now. Has saved me hours of "what am I forgetting" anxiety.

What documentation patterns have worked for you? Always looking to improve the checklist.
```

**The Google Doc** contains:
- Full checklist (genuinely useful, 2-3 pages)
- Examples for each doc type
- At the bottom: "Want to skip the manual work? Codec8 generates all 4 doc types automatically from your GitHub repo in 30 seconds. Try it free → codec8.com"

---

### Post 2: r/learnprogramming

**Title:** I created a free guide: "How to write documentation that actually helps people use your code"

**Body:**
```
Hey r/learnprogramming,

I see a lot of questions here about documentation — when to write it, how to structure it, what to include. So I put together a free guide based on patterns I've seen in successful open source projects.

**What the guide covers:**

- The 4 types of documentation every project needs (and which one to write first)
- A fill-in-the-blank README template that works for any project
- How to write API docs that developers actually read
- Architecture docs: how to explain your design decisions
- Common mistakes that make documentation useless

**Free Google Doc:** [link]

The README template alone will level up your portfolio projects. Hiring managers notice when a candidate can communicate clearly about their code.

This started as notes I kept for myself and grew into something I thought others might find useful. Hope it helps!

What's the hardest part about documentation for you? I'd love to add more sections based on what people struggle with.
```

**Bottom of Google Doc:** "If you want to skip writing docs entirely, I built Codec8 — it reads your GitHub repo and generates all 4 doc types automatically. Free for 1 repo → codec8.com"

---

### Post 3: r/SaaS

**Title:** Free template pack: The 4 documentation pages every SaaS needs to reduce support tickets

**Body:**
```
Hey r/SaaS,

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

**Free template pack (Google Doc):** [link]

Each template is fill-in-the-blank — just replace the [bracketed text] with your product's specifics.

We cut our support tickets by ~35% after filling these out properly. The ROI on documentation is insane if you actually do it.

What documentation has helped your SaaS the most?
```

**Bottom of Google Doc:** "Don't want to write these manually? Codec8 generates documentation from your codebase automatically using AI. It reads your GitHub repo and produces README, API docs, architecture diagrams, and setup guides in 30 seconds. Try free → codec8.com"

---

### Post 4: r/opensource

**Title:** I made a free README template that helped my project go from 0 to 50 stars in a week

**Body:**
```
Hey r/opensource,

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

**Free template (Google Doc):** [link]

The key insight: your README is a landing page, not a manual. The first 10 lines determine if someone installs your package or bounces.

After rewriting my README using this template, I went from 0 stars to 50 in a week. Not viral, but way more engagement than before.

What README patterns have you found work best for getting contributors?
```

**Bottom of Google Doc:** "If you want to generate a professional README automatically, I built Codec8 — it analyzes your GitHub repo and generates documentation in 30 seconds. Free for 1 repo → codec8.com"

---

### Post 5: r/ExperiencedDevs

**Title:** Free developer onboarding docs template — reduced our new hire ramp-up from 3 weeks to 1

**Body:**
```
After watching multiple new hires struggle through the same onboarding confusion, I finally documented our setup properly. Sharing the template in case it helps other teams.

**What the template covers:**

1. **Environment Setup** — Every tool, version, and config needed
2. **Architecture Map** — How services connect, where data flows
3. **Key Decisions** — Why we chose X over Y (prevents "why don't we just..." questions)
4. **Common Tasks** — How to deploy, run tests, create a PR, debug locally
5. **Who Owns What** — Team structure, code ownership, escalation paths

**Free template (Google Doc):** [link]

The biggest win was the "Key Decisions" section. New devs stopped suggesting rewrites of things we'd already evaluated and rejected.

Result: new hire ramp-up went from ~3 weeks of hand-holding to ~1 week of self-directed learning.

What documentation has been most impactful for your team's onboarding?
```

**Bottom of Google Doc:** "For the architecture and setup docs, I built a tool called Codec8 that generates them automatically from your codebase. It reads your GitHub repo and produces docs in 30 seconds. Free for 1 repo → codec8.com"

---

## Phase 3: Create the Google Docs

Each Google Doc needs:
- Genuinely valuable, complete content (not a teaser)
- Clean formatting with headers, checkboxes, examples
- 2-3 pages of real content
- **One subtle line at the very bottom:**

> ---
> **Want to automate this?** [Codec8](https://codec8.com) generates all 4 documentation types automatically from your GitHub repo using AI. Free for 1 repo, $99 lifetime for unlimited.

---

## Timing

| Day | Action |
|-----|--------|
| 1-7 | 3 value comments per day in each target subreddit |
| 8 | Post to r/webdev (documentation checklist) |
| 9 | Post to r/learnprogramming (how-to guide) |
| 11 | Post to r/SaaS (template pack) |
| 13 | Post to r/opensource (README template) |
| 15 | Post to r/ExperiencedDevs (onboarding template) |

Space posts 2 days apart. Never post to 2 subreddits on the same day.

---

## Rules

1. The free resource must be **genuinely complete and useful** — not a teaser
2. Never mention Codec8 in the post body — only in the Google Doc footer
3. Answer every comment genuinely — this is your reputation
4. If someone asks "how do you generate docs?" — then mention Codec8 naturally in a reply
5. Never edit the post to add a link after it gains traction — mods notice
6. Create a separate Google Doc for each subreddit (track which converts best)
