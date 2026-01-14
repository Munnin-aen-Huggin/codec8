<script lang="ts">
  export let repoName: string;
  export let repoFullName: string;

  const lockedDocs = [
    {
      type: 'api',
      title: 'API Documentation',
      description: 'Complete API reference with endpoints, parameters, and examples',
      icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4'
    },
    {
      type: 'architecture',
      title: 'Architecture Diagram',
      description: 'Visual system architecture with Mermaid diagrams',
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
    },
    {
      type: 'setup',
      title: 'Setup Guide',
      description: 'Step-by-step installation and configuration instructions',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z'
    }
  ];

  function handleUpgrade() {
    window.location.href = `/auth/login?intent=purchase&product=single&repo=${encodeURIComponent(repoFullName)}`;
  }
</script>

<div class="upgrade-prompt">
  <div class="prompt-header">
    <div class="lock-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
    </div>
    <h3>Unlock Complete Documentation</h3>
    <p>You've generated the README for <strong>{repoName}</strong>. Get the full documentation suite:</p>
  </div>

  <div class="locked-docs">
    {#each lockedDocs as doc}
      <div class="locked-doc">
        <div class="doc-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d={doc.icon}></path>
          </svg>
        </div>
        <div class="doc-info">
          <h4>{doc.title}</h4>
          <p>{doc.description}</p>
        </div>
        <div class="lock-badge">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M12 1a5 5 0 0 0-5 5v4H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V12a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5zm3 9H9V6a3 3 0 1 1 6 0v4z"></path>
          </svg>
        </div>
      </div>
    {/each}
  </div>

  <div class="upgrade-cta">
    <button class="btn-upgrade" on:click={handleUpgrade}>
      <span>Unlock All Documentation</span>
      <span class="price">$99 one-time</span>
    </button>
    <p class="guarantee">30-day money-back guarantee</p>
  </div>

  <div class="features">
    <div class="feature">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M5 13l4 4L19 7"></path>
      </svg>
      <span>Unlimited regenerations</span>
    </div>
    <div class="feature">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M5 13l4 4L19 7"></path>
      </svg>
      <span>Export & GitHub PR</span>
    </div>
    <div class="feature">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M5 13l4 4L19 7"></path>
      </svg>
      <span>Auto-sync on push</span>
    </div>
  </div>
</div>

<style>
  .upgrade-prompt {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.02) 100%);
    border: 1px solid rgba(16, 185, 129, 0.2);
    border-radius: 16px;
    padding: 32px;
    margin-top: 32px;
  }

  .prompt-header {
    text-align: center;
    margin-bottom: 24px;
  }

  .lock-icon {
    width: 48px;
    height: 48px;
    background: rgba(16, 185, 129, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
  }

  .lock-icon svg {
    width: 24px;
    height: 24px;
    color: #10b981;
  }

  .prompt-header h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 8px;
  }

  .prompt-header p {
    color: #a1a1a6;
    font-size: 0.95rem;
  }

  .prompt-header strong {
    color: #fff;
  }

  .locked-docs {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
  }

  .locked-doc {
    display: flex;
    align-items: center;
    gap: 16px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    padding: 16px;
  }

  .doc-icon {
    width: 40px;
    height: 40px;
    min-width: 40px;
    background: rgba(16, 185, 129, 0.1);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .doc-icon svg {
    width: 20px;
    height: 20px;
    color: #10b981;
  }

  .doc-info {
    flex: 1;
  }

  .doc-info h4 {
    font-size: 0.95rem;
    font-weight: 600;
    color: #fff;
    margin-bottom: 4px;
  }

  .doc-info p {
    font-size: 0.85rem;
    color: #6b6b70;
    margin: 0;
  }

  .lock-badge {
    color: #6b6b70;
  }

  .upgrade-cta {
    text-align: center;
    margin-bottom: 24px;
  }

  .btn-upgrade {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    background: #10b981;
    color: #000;
    border: none;
    padding: 16px 32px;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 8px 30px rgba(16, 185, 129, 0.3);
  }

  .btn-upgrade:hover {
    background: #059669;
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(16, 185, 129, 0.4);
  }

  .price {
    background: rgba(0, 0, 0, 0.2);
    padding: 4px 12px;
    border-radius: 6px;
    font-weight: 600;
  }

  .guarantee {
    font-size: 0.85rem;
    color: #6b6b70;
    margin-top: 12px;
  }

  .features {
    display: flex;
    justify-content: center;
    gap: 24px;
    flex-wrap: wrap;
  }

  .feature {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #a1a1a6;
    font-size: 0.9rem;
  }

  .feature svg {
    width: 16px;
    height: 16px;
    color: #10b981;
  }

  @media (max-width: 640px) {
    .upgrade-prompt {
      padding: 24px 16px;
    }

    .locked-doc {
      padding: 12px;
    }

    .doc-info p {
      display: none;
    }

    .features {
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .btn-upgrade {
      width: 100%;
      justify-content: center;
    }
  }
</style>
