<script lang="ts">
  import { onMount } from 'svelte';
  import { trackClientEvent } from '$lib/stores/analytics';

  let stage = 0; // 0=idle, 1=typing, 2=analyzing, 3=generating, 4=done
  let typedUrl = '';
  let visible = false;
  let hasPlayed = false;

  const fullUrl = 'github.com/acme/api-server';
  const stages = [
    { label: 'Paste your repo URL', icon: '→' },
    { label: 'Reading file structure...', icon: '◆' },
    { label: 'Analyzing code patterns...', icon: '◆' },
    { label: 'Generating documentation...', icon: '◆' },
    { label: 'Done! 4 docs ready', icon: '✓' },
  ];

  const docTypes = [
    { name: 'README.md', lines: 6, color: '#10b981' },
    { name: 'API Reference', lines: 5, color: '#3b82f6' },
    { name: 'Architecture', lines: 4, color: '#a855f7' },
    { name: 'Setup Guide', lines: 5, color: '#f59e0b' },
  ];

  let activeDoc = 0;
  let docLines: boolean[] = [];

  function startDemo() {
    if (stage > 0 && stage < 5) return;
    stage = 1;
    typedUrl = '';
    docLines = [];
    activeDoc = 0;
    hasPlayed = true;
    trackClientEvent('video_demo_opened');
    typeUrl(0);
  }

  function typeUrl(i: number) {
    if (i >= fullUrl.length) {
      setTimeout(() => { stage = 2; analyzeStep(); }, 600);
      return;
    }
    typedUrl = fullUrl.slice(0, i + 1);
    setTimeout(() => typeUrl(i + 1), 40 + Math.random() * 30);
  }

  function analyzeStep() {
    setTimeout(() => {
      stage = 3;
      generateDocs(0);
    }, 1200);
  }

  function generateDocs(lineIndex: number) {
    const totalLines = docTypes[activeDoc].lines;
    if (lineIndex >= totalLines) {
      if (activeDoc < docTypes.length - 1) {
        activeDoc++;
        docLines = [];
        setTimeout(() => generateDocs(0), 300);
      } else {
        setTimeout(() => { stage = 4; }, 400);
      }
      return;
    }
    docLines = [...docLines, true];
    setTimeout(() => generateDocs(lineIndex + 1), 120 + Math.random() * 80);
  }

  onMount(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasPlayed) {
          visible = true;
          setTimeout(startDemo, 800);
        }
      },
      { threshold: 0.5 }
    );
    const el = document.querySelector('.animated-demo');
    if (el) observer.observe(el);
    return () => observer.disconnect();
  });
</script>

<div class="animated-demo" class:visible>
  <div class="demo-wrapper">
    <!-- Browser Chrome -->
    <div class="browser-chrome">
      <div class="browser-dots">
        <span class="dot red"></span>
        <span class="dot yellow"></span>
        <span class="dot green"></span>
      </div>
      <div class="browser-url">codec8.com</div>
    </div>

    <!-- Demo Content -->
    <div class="demo-body">
      <!-- Input Area -->
      <div class="input-area">
        <div class="input-row">
          <div class="url-input" class:active={stage === 1}>
            {#if stage === 0}
              <span class="placeholder">https://github.com/owner/repo</span>
            {:else}
              <span class="typed">https://{typedUrl}</span>
              {#if stage === 1}<span class="cursor">|</span>{/if}
            {/if}
          </div>
          <button class="generate-btn" class:pulsing={stage === 0} disabled={stage > 0 && stage < 4}>
            {stage === 0 ? 'Generate' : stage < 4 ? 'Generating...' : 'Done!'}
          </button>
        </div>
      </div>

      <!-- Status Bar -->
      {#if stage >= 2}
        <div class="status-bar" class:done={stage === 4}>
          <div class="status-icon">
            {#if stage === 4}
              <svg viewBox="0 0 20 20" fill="currentColor" class="check-icon"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
            {:else}
              <div class="spinner"></div>
            {/if}
          </div>
          <span class="status-text">
            {stages[stage]?.label || ''}
          </span>
          {#if stage < 4}
            <span class="status-time">~{stage === 2 ? '45' : '30'}s remaining</span>
          {/if}
        </div>
      {/if}

      <!-- Doc Tabs + Content -->
      {#if stage >= 3}
        <div class="doc-area" class:complete={stage === 4}>
          <div class="doc-tabs">
            {#each docTypes as doc, i}
              <button
                class="doc-tab"
                class:active={i === activeDoc || (stage === 4 && i <= activeDoc)}
                class:current={i === activeDoc}
                style="--accent: {doc.color}"
              >
                {#if stage === 4 || i < activeDoc}
                  <svg viewBox="0 0 16 16" fill="currentColor" class="tab-check"><path fill-rule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" clip-rule="evenodd"/></svg>
                {/if}
                {doc.name}
              </button>
            {/each}
          </div>
          <div class="doc-content">
            <div class="doc-header" style="--accent: {docTypes[activeDoc].color}">
              {docTypes[activeDoc].name}
            </div>
            <div class="doc-lines">
              {#each { length: docTypes[activeDoc].lines } as _, i}
                <div
                  class="doc-line"
                  class:visible={i < docLines.length}
                  style="--w: {70 + Math.sin(i * 2.1) * 25}%; --delay: {i * 0.05}s; --accent: {docTypes[activeDoc].color}"
                ></div>
              {/each}
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Label -->
  <button class="demo-label" on:click={startDemo} type="button">
    {#if stage === 4}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="replay-icon"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/></svg>
      Replay demo
    {:else if stage === 0}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/></svg>
      See how it works — 60 seconds
    {:else}
      <div class="small-spinner"></div>
      Generating documentation...
    {/if}
  </button>
</div>

<style>
  .animated-demo {
    margin: 32px 0;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s, transform 0.6s;
  }

  .animated-demo.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .demo-wrapper {
    max-width: 560px;
    margin: 0 auto;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid #262628;
    background: #0a0a0b;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  }

  /* Browser Chrome */
  .browser-chrome {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    background: #1a1a1c;
    border-bottom: 1px solid #262628;
  }

  .browser-dots {
    display: flex;
    gap: 6px;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .dot.red { background: #ef4444; }
  .dot.yellow { background: #fbbf24; }
  .dot.green { background: #22c55e; }

  .browser-url {
    flex: 1;
    background: #262628;
    border-radius: 6px;
    padding: 5px 10px;
    font-size: 0.75rem;
    color: #6b6b70;
    font-family: monospace;
  }

  /* Demo Body */
  .demo-body {
    padding: 16px;
    min-height: 240px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* Input Area */
  .input-row {
    display: flex;
    gap: 8px;
  }

  .url-input {
    flex: 1;
    background: #111113;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 0.8rem;
    font-family: monospace;
    color: #e4e4e7;
    overflow: hidden;
    white-space: nowrap;
  }

  .url-input.active {
    border-color: #10b981;
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.15);
  }

  .placeholder {
    color: #555;
  }

  .typed {
    color: #e4e4e7;
  }

  .cursor {
    color: #10b981;
    animation: blink 0.8s step-end infinite;
  }

  @keyframes blink {
    50% { opacity: 0; }
  }

  .generate-btn {
    padding: 10px 18px;
    background: #10b981;
    color: #000;
    border: none;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;
  }

  .generate-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .generate-btn.pulsing {
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
    50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
  }

  /* Status Bar */
  .status-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    background: #111113;
    border-radius: 8px;
    font-size: 0.78rem;
    border: 1px solid #262628;
  }

  .status-bar.done {
    border-color: rgba(16, 185, 129, 0.3);
    background: rgba(16, 185, 129, 0.05);
  }

  .status-icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  .spinner {
    width: 18px;
    height: 18px;
    border: 2px solid #333;
    border-top-color: #10b981;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .check-icon {
    width: 18px;
    height: 18px;
    color: #10b981;
  }

  .status-text {
    flex: 1;
    color: #a1a1a6;
  }

  .status-bar.done .status-text {
    color: #10b981;
    font-weight: 600;
  }

  .status-time {
    color: #555;
    font-size: 0.72rem;
  }

  /* Doc Area */
  .doc-area {
    border: 1px solid #262628;
    border-radius: 8px;
    overflow: hidden;
    animation: fadeUp 0.3s ease-out;
  }

  .doc-area.complete {
    border-color: rgba(16, 185, 129, 0.3);
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .doc-tabs {
    display: flex;
    background: #111113;
    border-bottom: 1px solid #262628;
    overflow-x: auto;
  }

  .doc-tab {
    padding: 8px 12px;
    font-size: 0.7rem;
    color: #555;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: all 0.2s;
  }

  .doc-tab.active {
    color: #a1a1a6;
  }

  .doc-tab.current {
    color: var(--accent);
    border-bottom-color: var(--accent);
  }

  .tab-check {
    width: 12px;
    height: 12px;
    color: var(--accent);
  }

  .doc-content {
    padding: 12px;
    min-height: 100px;
  }

  .doc-header {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--accent);
    margin-bottom: 10px;
    font-family: monospace;
  }

  .doc-lines {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .doc-line {
    height: 8px;
    width: var(--w);
    background: #1a1a1c;
    border-radius: 4px;
    opacity: 0;
    transform: translateX(-8px);
    transition: all 0.25s ease-out;
    transition-delay: var(--delay);
  }

  .doc-line.visible {
    opacity: 1;
    transform: translateX(0);
    background: linear-gradient(90deg, #262628 0%, color-mix(in srgb, var(--accent) 15%, #262628) 100%);
  }

  /* Demo Label */
  .demo-label {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin: 16px auto 0;
    padding: 8px 16px;
    background: none;
    border: none;
    cursor: pointer;
    color: #a1a1a6;
    font-size: 0.9rem;
    font-weight: 500;
    transition: color 0.2s;
  }

  .demo-label:hover {
    color: #10b981;
  }

  .demo-label svg {
    width: 20px;
    height: 20px;
  }

  .replay-icon {
    width: 18px;
    height: 18px;
  }

  .small-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid #444;
    border-top-color: #10b981;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @media (max-width: 640px) {
    .demo-wrapper {
      border-radius: 12px;
    }

    .input-row {
      flex-direction: column;
    }

    .generate-btn {
      width: 100%;
    }

    .doc-tab {
      padding: 6px 8px;
      font-size: 0.65rem;
    }
  }
</style>
