<script lang="ts">
  const docTypes = [
    {
      id: 'readme',
      label: 'README',
      color: '#3b82f6',
      description: 'Professional project overview with badges, features, and installation guide',
      preview: `# 🚀 Project Name

A brief description of what this project does and who it's for.

## ✨ Features

- **Feature 1** - Description of the feature
- **Feature 2** - Another awesome feature
- **Feature 3** - And one more

## 📦 Installation

\`\`\`bash
npm install project-name
\`\`\`

## 🛠️ Usage

\`\`\`javascript
import { project } from 'project-name';

project.init();
\`\`\`

## 📝 License

MIT © Your Name`
    },
    {
      id: 'api',
      label: 'API Docs',
      color: '#10b981',
      description: 'Complete API reference with endpoints, parameters, and response examples',
      preview: `# API Reference

## Authentication

All API requests require authentication via Bearer token.

\`\`\`
Authorization: Bearer <token>
\`\`\`

---

## Endpoints

### GET /api/users

Returns a list of all users.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| limit | number | Max results (default: 20) |
| offset | number | Pagination offset |

**Response:**
\`\`\`json
{
  "users": [...],
  "total": 150
}
\`\`\``
    },
    {
      id: 'architecture',
      label: 'Architecture',
      color: '#8b5cf6',
      description: 'Visual system architecture with Mermaid diagrams and component explanations',
      preview: `# System Architecture

## Overview

This document describes the high-level architecture.

## Component Diagram

\`\`\`mermaid
graph TB
    A[Client] --> B[API Gateway]
    B --> C[Auth Service]
    B --> D[User Service]
    B --> E[Data Service]
    D --> F[(Database)]
    E --> F
\`\`\`

## Data Flow

1. Client sends request to API Gateway
2. Gateway authenticates via Auth Service
3. Request routed to appropriate service
4. Response returned to client`
    },
    {
      id: 'setup',
      label: 'Setup Guide',
      color: '#f59e0b',
      description: 'Step-by-step installation and configuration instructions',
      preview: `# Setup Guide

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis (optional)

## Installation

### 1. Clone the repository

\`\`\`bash
git clone https://github.com/user/repo.git
cd repo
\`\`\`

### 2. Install dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Configure environment

\`\`\`bash
cp .env.example .env
# Edit .env with your values
\`\`\`

### 4. Run migrations

\`\`\`bash
npm run db:migrate
\`\`\`

### 5. Start development server

\`\`\`bash
npm run dev
\`\`\``
    }
  ];

  let activeTab = 'readme';
  $: activeDoc = docTypes.find(d => d.id === activeTab) || docTypes[0];
</script>

<section class="product-preview">
  <div class="container">
    <div class="section-header">
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
          <span class="tab-label">{doc.label}</span>
        </button>
      {/each}
    </div>

    <div class="preview-content">
      <div class="preview-sidebar">
        <div class="doc-info">
          <div class="doc-icon" style="background: {activeDoc.color}">
            {activeDoc.label.charAt(0)}
          </div>
          <div>
            <h3>{activeDoc.label}</h3>
            <p>{activeDoc.description}</p>
          </div>
        </div>
        <div class="features-list">
          <div class="feature-check">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 13l4 4L19 7"/>
            </svg>
            AI-generated content
          </div>
          <div class="feature-check">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 13l4 4L19 7"/>
            </svg>
            Fully editable
          </div>
          <div class="feature-check">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 13l4 4L19 7"/>
            </svg>
            Export to Markdown
          </div>
        </div>
      </div>
      <div class="preview-window">
        <div class="window-header">
          <div class="window-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span class="window-title">{activeDoc.label.toLowerCase()}.md</span>
        </div>
        <div class="window-content">
          <pre>{activeDoc.preview}</pre>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .product-preview {
    padding: 80px 0;
    background: linear-gradient(180deg, transparent 0%, rgba(17, 17, 19, 0.3) 50%, transparent 100%);
  }

  .container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .section-header {
    text-align: center;
    margin-bottom: 48px;
  }

  .section-header h2 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 12px;
  }

  .section-header p {
    font-size: 1.1rem;
    color: #a1a1a6;
  }

  .preview-tabs {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 32px;
    flex-wrap: wrap;
  }

  .tab {
    padding: 12px 24px;
    background: #111113;
    border: 1px solid #262628;
    border-radius: 8px;
    color: #a1a1a6;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .tab:hover {
    border-color: #3a3a3c;
    color: #fff;
  }

  .tab.active {
    background: var(--tab-color);
    border-color: var(--tab-color);
    color: #fff;
    box-shadow: 0 4px 20px color-mix(in srgb, var(--tab-color) 40%, transparent);
  }

  .preview-content {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 24px;
  }

  .preview-sidebar {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .doc-info {
    display: flex;
    gap: 16px;
    padding: 20px;
    background: #111113;
    border: 1px solid #262628;
    border-radius: 12px;
  }

  .doc-icon {
    width: 48px;
    height: 48px;
    min-width: 48px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    font-weight: 700;
    color: #fff;
  }

  .doc-info h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #fff;
    margin-bottom: 4px;
  }

  .doc-info p {
    font-size: 0.85rem;
    color: #6b6b70;
    line-height: 1.4;
  }

  .features-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 20px;
    background: #111113;
    border: 1px solid #262628;
    border-radius: 12px;
  }

  .feature-check {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #a1a1a6;
    font-size: 0.9rem;
  }

  .feature-check svg {
    width: 18px;
    height: 18px;
    color: #10b981;
  }

  .preview-window {
    background: #0a0a0b;
    border: 1px solid #262628;
    border-radius: 12px;
    overflow: hidden;
  }

  .window-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: #111113;
    border-bottom: 1px solid #262628;
  }

  .window-dots {
    display: flex;
    gap: 6px;
  }

  .window-dots span {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #3a3a3c;
  }

  .window-dots span:first-child { background: #ef4444; }
  .window-dots span:nth-child(2) { background: #fbbf24; }
  .window-dots span:last-child { background: #22c55e; }

  .window-title {
    font-size: 0.85rem;
    color: #6b6b70;
    font-family: 'SF Mono', Monaco, monospace;
  }

  .window-content {
    padding: 20px;
    max-height: 400px;
    overflow-y: auto;
  }

  .window-content pre {
    margin: 0;
    font-family: 'SF Mono', Monaco, 'Courier New', monospace;
    font-size: 0.8rem;
    line-height: 1.6;
    color: #a1a1a6;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  @media (max-width: 900px) {
    .preview-content {
      grid-template-columns: 1fr;
    }

    .preview-sidebar {
      flex-direction: row;
      flex-wrap: wrap;
    }

    .doc-info, .features-list {
      flex: 1;
      min-width: 250px;
    }
  }

  @media (max-width: 640px) {
    .section-header h2 {
      font-size: 1.75rem;
    }

    .preview-tabs {
      gap: 6px;
    }

    .tab {
      padding: 10px 16px;
      font-size: 0.85rem;
    }

    .window-content {
      max-height: 300px;
    }
  }
</style>
