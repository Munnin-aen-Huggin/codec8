<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;

  const tierNames: Record<string, string> = {
    single: 'Single Repo',
    pro: 'Pro',
    team: 'Team',
    ltd: 'Pro' // Legacy LTD mapped to Pro
  };

  const tierLimits: Record<string, number> = {
    pro: 30,
    team: 100
  };

  function copyLicenseKey() {
    if (data.licenseKey) {
      navigator.clipboard.writeText(data.licenseKey);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    }
  }

  let copied = false;

  $: isSingleRepo = data.tier === 'single';
  $: isSubscription = data.tier === 'pro' || data.tier === 'team';
</script>

<svelte:head>
  <title>Payment Successful - Codec8</title>
</svelte:head>

<div class="success-page">
  <div class="success-card">
    <div class="success-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    </div>

    <h1>Payment Successful!</h1>
    <p class="subtitle">Welcome to Codec8 {tierNames[data.tier || 'ltd']}</p>

    <div class="details">
      <div class="detail-item">
        <span class="label">Plan</span>
        <span class="value">{tierNames[data.tier || 'ltd']}</span>
      </div>

      {#if data.licenseKey}
        <div class="detail-item license">
          <span class="label">License Key</span>
          <div class="license-key">
            <code>{data.licenseKey}</code>
            <button class="copy-btn" on:click={copyLicenseKey}>
              {#if copied}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 6L9 17l-5-5"></path>
                </svg>
              {:else}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              {/if}
            </button>
          </div>
          <p class="note">Save this key for your records</p>
        </div>
      {/if}
    </div>

    <!-- Tier-specific Next Steps -->
    <div class="next-steps">
      <h3>What's Next?</h3>
      {#if isSingleRepo}
        <ol>
          <li>
            <span class="step-number">1</span>
            <span class="step-text">Go to your dashboard</span>
          </li>
          <li>
            <span class="step-number">2</span>
            <span class="step-text">Find <strong>{data.purchasedRepoName || 'your purchased repo'}</strong></span>
          </li>
          <li>
            <span class="step-number">3</span>
            <span class="step-text">Click "Generate Documentation" to get all 4 doc types</span>
          </li>
          <li>
            <span class="step-number">4</span>
            <span class="step-text">Edit, export, or create a GitHub PR</span>
          </li>
        </ol>
      {:else if isSubscription}
        <ol>
          <li>
            <span class="step-number">1</span>
            <span class="step-text">Connect your GitHub repositories</span>
          </li>
          <li>
            <span class="step-number">2</span>
            <span class="step-text">Generate docs for up to <strong>{tierLimits[data.tier || 'pro']} repos/month</strong></span>
          </li>
          <li>
            <span class="step-number">3</span>
            <span class="step-text">Enable auto-sync to keep docs updated on every push</span>
          </li>
          {#if data.tier === 'team'}
            <li>
              <span class="step-number">4</span>
              <span class="step-text">Invite up to 5 team members from settings</span>
            </li>
          {/if}
        </ol>
      {:else}
        <ol>
          <li>
            <span class="step-number">1</span>
            <span class="step-text">Connect your repositories</span>
          </li>
          <li>
            <span class="step-number">2</span>
            <span class="step-text">Generate documentation</span>
          </li>
          <li>
            <span class="step-number">3</span>
            <span class="step-text">Export or create PRs</span>
          </li>
        </ol>
      {/if}
    </div>

    <div class="features">
      <h3>What's included:</h3>
      <ul>
        {#if isSingleRepo}
          <li>Complete documentation for 1 repository</li>
          <li>All 4 documentation types (README, API, Architecture, Setup)</li>
          <li>Unlimited regenerations included</li>
          <li>Export to Markdown & create PRs</li>
          <li>Email support</li>
        {:else if data.tier === 'pro'}
          <li>Up to 30 repositories per month</li>
          <li>All documentation types</li>
          <li>Architecture diagrams (Mermaid)</li>
          <li>Export to Markdown & PR</li>
          <li>Auto-sync on push</li>
          <li>Priority support</li>
        {:else if data.tier === 'team'}
          <li>Up to 100 repositories per month</li>
          <li>All documentation types</li>
          <li>Architecture diagrams (Mermaid)</li>
          <li>Up to 5 team members</li>
          <li>Auto-sync on push</li>
          <li>Dedicated support</li>
        {:else}
          <li>Unlimited repositories</li>
          <li>All documentation types</li>
          <li>Architecture diagrams</li>
          <li>Export to Markdown & PR</li>
          <li>Auto-sync on push</li>
          <li>Priority support</li>
        {/if}
      </ul>
    </div>

    <div class="actions">
      {#if isSingleRepo && data.purchasedRepoId}
        <a href="/dashboard" class="btn-primary">Generate Docs Now</a>
      {:else}
        <a href="/dashboard" class="btn-primary">Go to Dashboard</a>
      {/if}
    </div>

    <p class="support">
      Questions? Contact us at <a href="mailto:support@codec8.com">support@codec8.com</a>
    </p>
  </div>
</div>

<style>
  .success-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: #0a0a0b;
  }

  .success-card {
    background: #111113;
    border: 1px solid #262628;
    border-radius: 20px;
    padding: 48px;
    max-width: 500px;
    width: 100%;
    text-align: center;
  }

  .success-icon {
    width: 80px;
    height: 80px;
    background: rgba(34, 197, 94, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
  }

  .success-icon svg {
    width: 40px;
    height: 40px;
    color: #22c55e;
  }

  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 8px;
  }

  .subtitle {
    color: #a1a1a6;
    font-size: 1.1rem;
    margin-bottom: 32px;
  }

  .details {
    background: #0a0a0b;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #262628;
  }

  .detail-item:last-child {
    border-bottom: none;
  }

  .detail-item.license {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .label {
    color: #6b6b70;
    font-size: 0.9rem;
  }

  .value {
    color: #fff;
    font-weight: 600;
  }

  .license-key {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
  }

  .license-key code {
    flex: 1;
    background: #1a1a1c;
    padding: 12px 16px;
    border-radius: 8px;
    font-family: 'Monaco', monospace;
    font-size: 1rem;
    color: #22c55e;
    letter-spacing: 0.05em;
  }

  .copy-btn {
    background: #262628;
    border: none;
    padding: 10px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .copy-btn:hover {
    background: #363638;
  }

  .copy-btn svg {
    width: 20px;
    height: 20px;
    color: #a1a1a6;
  }

  .note {
    font-size: 0.8rem;
    color: #6b6b70;
  }

  .next-steps {
    text-align: left;
    background: rgba(34, 197, 94, 0.05);
    border: 1px solid rgba(34, 197, 94, 0.2);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
  }

  .next-steps h3 {
    font-size: 1rem;
    color: #22c55e;
    margin-bottom: 16px;
    font-weight: 600;
  }

  .next-steps ol {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .next-steps li {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 10px 0;
    color: #a1a1a6;
  }

  .step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    min-width: 24px;
    background: rgba(34, 197, 94, 0.15);
    color: #22c55e;
    border-radius: 50%;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .step-text {
    flex: 1;
    line-height: 1.5;
  }

  .step-text strong {
    color: #fff;
  }

  .features {
    text-align: left;
    margin-bottom: 32px;
  }

  .features h3 {
    font-size: 1rem;
    color: #fff;
    margin-bottom: 12px;
  }

  .features ul {
    list-style: none;
    padding: 0;
  }

  .features li {
    padding: 8px 0;
    color: #a1a1a6;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .features li::before {
    content: '✓';
    color: #22c55e;
    font-weight: bold;
  }

  .actions {
    margin-bottom: 24px;
  }

  .btn-primary {
    display: inline-block;
    background: #22c55e;
    color: #000;
    padding: 16px 48px;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 700;
    text-decoration: none;
    transition: all 0.2s;
  }

  .btn-primary:hover {
    background: #16a34a;
    transform: translateY(-2px);
  }

  .support {
    font-size: 0.9rem;
    color: #6b6b70;
  }

  .support a {
    color: #22c55e;
    text-decoration: none;
  }

  .support a:hover {
    text-decoration: underline;
  }

  @media (max-width: 640px) {
    .success-card {
      padding: 32px 24px;
    }

    h1 {
      font-size: 1.5rem;
    }

    .license-key code {
      font-size: 0.85rem;
    }
  }
</style>
