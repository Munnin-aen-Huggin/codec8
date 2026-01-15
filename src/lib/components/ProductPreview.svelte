<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { marked, Renderer } from 'marked';

  // Custom renderer that demotes headings (h1 -> h2, etc.) to avoid multiple h1 tags on page
  const renderer = new Renderer();
  renderer.heading = ({ text, depth }) => {
    const demotedLevel = Math.min(depth + 1, 6); // h1 becomes h2, max h6
    return `<h${demotedLevel}>${text}</h${demotedLevel}>`;
  };
  marked.use({ renderer });

  const docTypes = [
    {
      id: 'readme',
      label: 'README',
      color: '#3b82f6',
      icon: '📖',
      description: 'Professional project overview with badges, features, and installation guide',
      preview: `# Project Name

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

A modern, blazing-fast solution for your needs.

## Features

- **Lightning Fast** - Optimized for performance
- **Type Safe** - Full TypeScript support
- **Well Documented** - Comprehensive guides

## Quick Start

\`\`\`bash
npm install project-name
\`\`\`

\`\`\`typescript
import { init } from 'project-name';
init({ debug: true });
\`\`\`

## License

MIT © 2026`
    },
    {
      id: 'api',
      label: 'API Docs',
      color: '#10b981',
      icon: '⚡',
      description: 'Complete API reference with endpoints, parameters, and response examples',
      preview: `# API Reference

## Authentication

\`\`\`
Authorization: Bearer <token>
\`\`\`

## Endpoints

### GET /api/users

Fetch all users with pagination.

| Param | Type | Default |
|-------|------|---------|
| limit | int | 20 |
| page | int | 1 |

**Response 200:**
\`\`\`json
{
  "data": [...],
  "meta": { "total": 150 }
}
\`\`\`

### POST /api/users

Create a new user account.`
    },
    {
      id: 'architecture',
      label: 'Architecture',
      color: '#8b5cf6',
      icon: '🏗️',
      description: 'Visual system architecture with Mermaid diagrams and component explanations',
      preview: 'mermaid',
      mermaidCode: `graph TB
    subgraph Client
        A[Web App]
        B[Mobile App]
    end

    subgraph API Layer
        C[API Gateway]
        D[Auth Service]
    end

    subgraph Services
        E[User Service]
        F[Data Service]
        G[Notification]
    end

    subgraph Storage
        H[(PostgreSQL)]
        I[(Redis Cache)]
    end

    A --> C
    B --> C
    C --> D
    C --> E
    C --> F
    E --> H
    F --> H
    F --> I
    E --> G`
    },
    {
      id: 'setup',
      label: 'Setup Guide',
      color: '#f59e0b',
      icon: '🛠️',
      description: 'Step-by-step installation and configuration instructions',
      preview: `# Setup Guide

## Prerequisites

- Node.js 18+
- PostgreSQL 14+

## Step 1: Clone

\`\`\`bash
git clone https://github.com/user/repo
cd repo
\`\`\`

## Step 2: Install

\`\`\`bash
npm install
\`\`\`

## Step 3: Configure

\`\`\`bash
cp .env.example .env
\`\`\`

## Step 4: Database

\`\`\`bash
npm run db:migrate
npm run db:seed
\`\`\`

## Step 5: Run

\`\`\`bash
npm run dev
\`\`\`

Server at http://localhost:3000`
    }
  ];

  let activeTab = 'readme';
  let mermaidSvg = '';
  let mermaidLoading = true;

  $: activeDoc = docTypes.find(d => d.id === activeTab) || docTypes[0];
  $: renderedMarkdown = activeDoc.preview !== 'mermaid' ? marked.parse(activeDoc.preview) : '';

  async function renderMermaid() {
    if (!browser) return;

    mermaidLoading = true;
    const archDoc = docTypes.find(d => d.id === 'architecture');
    if (!archDoc?.mermaidCode) return;

    try {
      const mermaid = (await import('mermaid')).default;
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        themeVariables: {
          primaryColor: '#8b5cf6',
          primaryTextColor: '#fafafa',
          primaryBorderColor: '#6d28d9',
          lineColor: '#71717a',
          secondaryColor: '#27272a',
          tertiaryColor: '#18181b',
          background: '#09090b',
          mainBkg: '#18181b',
          secondBkg: '#27272a',
          border1: '#3f3f46',
          border2: '#52525b',
          arrowheadColor: '#a1a1aa',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '14px',
          nodeBorder: '#6d28d9',
          clusterBkg: '#18181b',
          clusterBorder: '#3f3f46',
          defaultLinkColor: '#71717a',
          edgeLabelBackground: '#27272a'
        },
        flowchart: {
          htmlLabels: true,
          curve: 'basis',
          padding: 15
        }
      });

      const id = `mermaid-preview-${Math.random().toString(36).substr(2, 9)}`;
      const { svg } = await mermaid.render(id, archDoc.mermaidCode);
      mermaidSvg = svg;
    } catch (err) {
      console.error('Mermaid rendering error:', err);
      mermaidSvg = '';
    } finally {
      mermaidLoading = false;
    }
  }

  onMount(() => {
    renderMermaid();
  });
</script>

<section class="product-preview">
  <div class="container">
    <div class="section-header">
      <span class="section-badge">Live Preview</span>
      <h2>See What You'll Get</h2>
      <p>Real documentation examples, generated in seconds</p>
    </div>

    <div class="preview-tabs">
      {#each docTypes as doc}
        <button
          class="tab"
          class:active={activeTab === doc.id}
          style="--tab-color: {doc.color}"
          on:click={() => activeTab = doc.id}
        >
          <span class="tab-icon">{doc.icon}</span>
          <span class="tab-label">{doc.label}</span>
        </button>
      {/each}
    </div>

    <div class="preview-content">
      <div class="preview-sidebar">
        <div class="doc-info">
          <div class="doc-icon" style="background: linear-gradient(135deg, {activeDoc.color}, color-mix(in srgb, {activeDoc.color} 70%, #000))">
            <span>{activeDoc.icon}</span>
          </div>
          <div>
            <h3>{activeDoc.label}</h3>
            <p>{activeDoc.description}</p>
          </div>
        </div>
        <div class="features-list">
          <h4>Included Features</h4>
          <div class="feature-check">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 13l4 4L19 7"/>
            </svg>
            <span>AI-generated from your code</span>
          </div>
          <div class="feature-check">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 13l4 4L19 7"/>
            </svg>
            <span>Fully editable before export</span>
          </div>
          <div class="feature-check">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 13l4 4L19 7"/>
            </svg>
            <span>Export as Markdown or PR</span>
          </div>
          <div class="feature-check">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 13l4 4L19 7"/>
            </svg>
            <span>Regenerate anytime</span>
          </div>
        </div>
        <div class="time-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          <span>Generated in ~60 seconds</span>
        </div>
      </div>

      <div class="preview-window">
        <div class="window-header">
          <div class="window-dots">
            <span class="dot red"></span>
            <span class="dot yellow"></span>
            <span class="dot green"></span>
          </div>
          <span class="window-title">{activeDoc.label}</span>
          <div class="window-actions">
            <span class="badge-live">LIVE</span>
          </div>
        </div>
        <div class="window-content">
          {#if activeDoc.id === 'architecture'}
            {#if mermaidLoading}
              <div class="mermaid-loading">
                <div class="spinner"></div>
                <span>Rendering diagram...</span>
              </div>
            {:else if mermaidSvg}
              <div class="mermaid-container">
                {@html mermaidSvg}
              </div>
              <div class="architecture-text">
                <h4>System Overview</h4>
                <p>Multi-tier architecture with API gateway pattern, microservices, and caching layer.</p>
              </div>
            {:else}
              <pre class="code-preview">{activeDoc.mermaidCode}</pre>
            {/if}
          {:else}
            <div class="markdown-preview">
              {@html renderedMarkdown}
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .product-preview {
    padding: 100px 0;
    background: linear-gradient(180deg, transparent 0%, rgba(17, 17, 19, 0.5) 50%, transparent 100%);
    position: relative;
    overflow: hidden;
  }

  .product-preview::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 800px;
    height: 800px;
    background: radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%);
    pointer-events: none;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    position: relative;
  }

  .section-header {
    text-align: center;
    margin-bottom: 48px;
  }

  .section-badge {
    display: inline-block;
    padding: 6px 14px;
    background: rgba(139, 92, 246, 0.15);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 100px;
    color: #a78bfa;
    font-size: 0.8rem;
    font-weight: 600;
    margin-bottom: 16px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .section-header h2 {
    font-size: 2.5rem;
    font-weight: 800;
    color: #fff;
    margin-bottom: 12px;
    letter-spacing: -0.02em;
  }

  .section-header p {
    font-size: 1.15rem;
    color: #a1a1a6;
  }

  .preview-tabs {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 40px;
    flex-wrap: wrap;
  }

  .tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 14px 24px;
    background: rgba(17, 17, 19, 0.8);
    border: 1px solid #262628;
    border-radius: 12px;
    color: #a1a1a6;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
  }

  .tab:hover {
    border-color: #3f3f46;
    color: #fff;
    transform: translateY(-2px);
  }

  .tab.active {
    background: linear-gradient(135deg, var(--tab-color), color-mix(in srgb, var(--tab-color) 70%, #000));
    border-color: var(--tab-color);
    color: #fff;
    box-shadow: 0 8px 32px color-mix(in srgb, var(--tab-color) 40%, transparent);
  }

  .tab-icon {
    font-size: 1.1rem;
  }

  .preview-content {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 32px;
  }

  .preview-sidebar {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .doc-info {
    display: flex;
    gap: 16px;
    padding: 24px;
    background: rgba(17, 17, 19, 0.9);
    border: 1px solid #262628;
    border-radius: 16px;
    backdrop-filter: blur(10px);
  }

  .doc-icon {
    width: 56px;
    height: 56px;
    min-width: 56px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
  }

  .doc-info h3 {
    font-size: 1.2rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 6px;
  }

  .doc-info p {
    font-size: 0.9rem;
    color: #71717a;
    line-height: 1.5;
  }

  .features-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 24px;
    background: rgba(17, 17, 19, 0.9);
    border: 1px solid #262628;
    border-radius: 16px;
    backdrop-filter: blur(10px);
  }

  .features-list h4 {
    font-size: 0.85rem;
    font-weight: 600;
    color: #71717a;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 4px;
  }

  .feature-check {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #e4e4e7;
    font-size: 0.9rem;
  }

  .feature-check svg {
    width: 20px;
    height: 20px;
    color: #10b981;
    flex-shrink: 0;
  }

  .time-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 16px 20px;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05));
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 12px;
    color: #10b981;
    font-size: 0.95rem;
    font-weight: 600;
  }

  .time-badge svg {
    width: 20px;
    height: 20px;
  }

  .preview-window {
    background: #0a0a0b;
    border: 1px solid #262628;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  }

  .window-header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 18px;
    background: #111113;
    border-bottom: 1px solid #262628;
  }

  .window-dots {
    display: flex;
    gap: 8px;
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  .dot.red { background: #ef4444; }
  .dot.yellow { background: #fbbf24; }
  .dot.green { background: #22c55e; }

  .window-title {
    font-size: 0.85rem;
    color: #71717a;
    font-family: 'SF Mono', Monaco, monospace;
  }

  .window-actions {
    margin-left: auto;
  }

  .badge-live {
    padding: 4px 10px;
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 6px;
    color: #10b981;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.05em;
  }

  .window-content {
    padding: 24px;
    min-height: 420px;
    max-height: 500px;
    overflow-y: auto;
  }

  .code-preview {
    margin: 0;
    font-family: 'SF Mono', Monaco, 'Courier New', monospace;
    font-size: 0.85rem;
    line-height: 1.7;
    color: #d4d4d8;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .markdown-preview {
    color: #d4d4d8;
    font-size: 0.9rem;
    line-height: 1.7;
  }

  .markdown-preview :global(h2) {
    font-size: 1.5rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #27272a;
  }

  .markdown-preview :global(h3) {
    font-size: 1.15rem;
    font-weight: 600;
    color: #e4e4e7;
    margin-top: 20px;
    margin-bottom: 10px;
  }

  .markdown-preview :global(h4) {
    font-size: 1rem;
    font-weight: 600;
    color: #d4d4d8;
    margin-top: 16px;
    margin-bottom: 8px;
  }

  .markdown-preview :global(p) {
    margin-bottom: 12px;
    color: #a1a1aa;
  }

  .markdown-preview :global(ul),
  .markdown-preview :global(ol) {
    margin-bottom: 12px;
    padding-left: 20px;
  }

  .markdown-preview :global(li) {
    margin-bottom: 6px;
    color: #a1a1aa;
  }

  .markdown-preview :global(strong) {
    color: #fff;
    font-weight: 600;
  }

  .markdown-preview :global(code) {
    background: #18181b;
    color: #10b981;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'SF Mono', Monaco, monospace;
    font-size: 0.85em;
  }

  .markdown-preview :global(pre) {
    background: #18181b;
    border: 1px solid #27272a;
    border-radius: 8px;
    padding: 14px;
    margin: 12px 0;
    overflow-x: auto;
  }

  .markdown-preview :global(pre code) {
    background: none;
    padding: 0;
    color: #d4d4d8;
  }

  .markdown-preview :global(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    font-size: 0.85rem;
  }

  .markdown-preview :global(th),
  .markdown-preview :global(td) {
    padding: 8px 12px;
    border: 1px solid #27272a;
    text-align: left;
  }

  .markdown-preview :global(th) {
    background: #18181b;
    color: #e4e4e7;
    font-weight: 600;
  }

  .markdown-preview :global(img) {
    max-height: 20px;
    vertical-align: middle;
    margin-right: 6px;
  }

  .markdown-preview :global(a) {
    color: #8b5cf6;
    text-decoration: none;
  }

  .mermaid-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    background: #18181b;
    border-radius: 12px;
    margin-bottom: 20px;
  }

  .mermaid-container :global(svg) {
    max-width: 100%;
    height: auto;
  }

  .architecture-text {
    padding: 20px;
    background: rgba(139, 92, 246, 0.1);
    border: 1px solid rgba(139, 92, 246, 0.2);
    border-radius: 12px;
  }

  .architecture-text h4 {
    font-size: 1rem;
    font-weight: 600;
    color: #fff;
    margin-bottom: 8px;
  }

  .architecture-text p {
    font-size: 0.9rem;
    color: #a1a1a6;
    line-height: 1.5;
  }

  .mermaid-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 60px;
    color: #71717a;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #27272a;
    border-top-color: #8b5cf6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 900px) {
    .preview-content {
      grid-template-columns: 1fr;
    }

    .preview-sidebar {
      flex-direction: row;
      flex-wrap: wrap;
    }

    .doc-info {
      flex: 1;
      min-width: 280px;
    }

    .features-list {
      flex: 1;
      min-width: 280px;
    }

    .time-badge {
      width: 100%;
    }
  }

  @media (max-width: 640px) {
    .product-preview {
      padding: 60px 0;
    }

    .section-header h2 {
      font-size: 1.75rem;
    }

    .preview-tabs {
      gap: 8px;
    }

    .tab {
      padding: 12px 18px;
      font-size: 0.85rem;
    }

    .tab-icon {
      display: none;
    }

    .window-content {
      padding: 16px;
      min-height: 300px;
      max-height: 400px;
    }

    .code-preview {
      font-size: 0.75rem;
    }
  }
</style>
