# The Complete Documentation Checklist for Web Projects

*Every project needs 4 types of documentation. Use this checklist to make sure you've covered everything.*

---

## 1. README (Start Here)

Your README is your project's landing page. If it doesn't hook someone in 10 seconds, they bounce.

### Must-Have Sections

- [ ] **One-line description** — What does this do? (No jargon)
- [ ] **Badges** — Build status, version, license, test coverage
- [ ] **Screenshot or GIF** — Show, don't tell
- [ ] **Quick Start** — Copy-paste commands to get running in < 2 minutes
  ```
  npm install your-package
  npx your-package init
  ```
- [ ] **Key Features** — 3-5 bullet points, each with a one-line code example
- [ ] **Requirements** — Node version, OS, dependencies
- [ ] **Installation** — Step-by-step, tested on a fresh machine
- [ ] **Usage** — The 3 most common operations
- [ ] **Configuration** — Environment variables, config files, defaults
- [ ] **Contributing** — How to set up dev environment, coding standards, PR process
- [ ] **License** — Which license and why

### Good vs. Bad README Example

**Bad:**
> This project is a web application built with React and Node.js that provides functionality for users.

**Good:**
> **TaskFlow** — A kanban board that syncs across devices in real-time. Built with React + WebSocket. Self-hostable.

---

## 2. API Documentation

For any project with endpoints, functions, or a public interface.

### For REST APIs

For each endpoint:
- [ ] **Method + Path** — `GET /api/users/:id`
- [ ] **Description** — One sentence: what it does
- [ ] **Authentication** — Required? What type?
- [ ] **Parameters** — Name, type, required/optional, description
- [ ] **Request body** — JSON schema with example
- [ ] **Response** — Success response with example JSON
- [ ] **Error responses** — Common error codes and what they mean
- [ ] **Working example** — curl or fetch command they can copy-paste

### For Libraries/Packages

For each exported function:
- [ ] **Function signature** — `parseConfig(path: string, options?: ParseOptions): Config`
- [ ] **Parameters** — What each one does, types, defaults
- [ ] **Return value** — What it returns and when
- [ ] **Throws** — What errors can occur
- [ ] **Example** — Working code snippet
- [ ] **Edge cases** — What happens with null/undefined/empty inputs

### Common Mistakes

- [ ] No examples (just type signatures)
- [ ] Examples that don't actually work
- [ ] Missing error documentation (users will hit errors)
- [ ] No authentication examples
- [ ] Outdated examples from a previous API version

---

## 3. Architecture Overview

Helps new contributors understand WHY the code is structured the way it is.

### Must-Have Sections

- [ ] **System diagram** — How the main components connect
  - Use Mermaid, draw.io, or even ASCII art
  - Show data flow direction with arrows
- [ ] **Folder structure** — What each top-level directory contains
  ```
  src/
  ├── routes/       # API endpoints and pages
  ├── lib/          # Shared utilities and business logic
  ├── components/   # Reusable UI components
  └── stores/       # State management
  ```
- [ ] **Data flow** — How a request travels through the system
  - User action → Frontend → API → Database → Response
- [ ] **Key design decisions** — Why you chose this approach
  - "We use PostgreSQL instead of MongoDB because..."
  - "State lives in stores, not components, because..."
- [ ] **Dependencies** — Major libraries and what they're used for
- [ ] **External services** — Third-party APIs, databases, cloud services

### Good Architecture Doc Pattern

```
## How Authentication Works

1. User clicks "Sign in with GitHub"
2. Redirect to GitHub OAuth → user approves
3. GitHub redirects back with auth code
4. Server exchanges code for access token
5. Server creates/updates user in database
6. Session cookie set, user redirected to dashboard

Why GitHub OAuth? Our users are developers who already have GitHub accounts.
We considered email/password but it adds friction and password management overhead.
```

---

## 4. Setup Guide

For anyone who wants to run this locally or deploy it.

### Development Setup

- [ ] **Prerequisites** — Every tool and version needed
  - [ ] Node.js (specify exact version or range)
  - [ ] Package manager (npm/yarn/pnpm)
  - [ ] Database (version, how to install)
  - [ ] Other tools (Docker, Redis, etc.)
- [ ] **Clone + Install** — Exact commands
  ```bash
  git clone https://github.com/you/project.git
  cd project
  npm install
  ```
- [ ] **Environment Setup** — Which env vars, where to get values
  - [ ] Copy `.env.example` to `.env`
  - [ ] Where to get each API key (with links)
- [ ] **Database Setup** — Migrations, seeds, test data
- [ ] **Run locally** — The exact command + expected output
  ```bash
  npm run dev
  # Server running at http://localhost:3000
  ```
- [ ] **Verify it works** — How to confirm everything is set up correctly

### Deployment

- [ ] **Platform** — Vercel/Railway/AWS/etc. + why
- [ ] **Environment variables** — Production values needed
- [ ] **Build command** — `npm run build`
- [ ] **Database** — Production database setup
- [ ] **Domain + SSL** — Custom domain configuration

### Troubleshooting

- [ ] **Common errors** — Top 5 errors people hit and how to fix them
  - [ ] "Module not found" → Run `npm install` again
  - [ ] "Connection refused" → Start the database first
  - [ ] "Port already in use" → Kill process on port 3000
- [ ] **Reset instructions** — How to start fresh if everything breaks

---

## Tips

1. **Write docs BEFORE you forget** — The best time is right after you implement something
2. **Test your docs on a fresh machine** — If setup instructions fail on a clean install, they're wrong
3. **Include the "why"** — Code shows what, docs explain why
4. **Keep examples working** — Broken examples are worse than no examples
5. **Update docs when you change code** — Stale docs erode trust faster than no docs

---

## Want to automate this?

[Codec8](https://codec8.com) generates all 4 documentation types automatically from your GitHub repo using AI. It reads your actual codebase and produces README, API docs, architecture diagrams, and setup guides in 30 seconds.

Free for 1 repo. $99 lifetime for unlimited.
