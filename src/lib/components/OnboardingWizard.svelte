<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let currentStep = 1;
  const totalSteps = 3;

  const steps = [
    {
      title: 'Welcome to Codec8',
      description: 'Generate professional documentation for your repositories in seconds.',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      title: 'Connect a Repository',
      description: 'Link your GitHub repositories to get started with documentation generation.',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
    },
    {
      title: 'Generate Documentation',
      description: 'Click Generate to create README, API docs, architecture diagrams, and setup guides.',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    }
  ];

  const features = [
    { icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', text: 'README Generator' },
    { icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4', text: 'API Documentation' },
    { icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', text: 'Architecture Diagrams' },
    { icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', text: 'Setup Guides' }
  ];

  function nextStep() {
    if (currentStep < totalSteps) {
      currentStep++;
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      currentStep--;
    }
  }

  function handleConnect() {
    dispatch('connect');
  }

  function handleComplete() {
    dispatch('complete');
  }

  function skip() {
    dispatch('complete');
  }
</script>

<div class="onboarding-wizard">
  <div class="wizard-card">
    <!-- Progress Indicator -->
    <div class="progress-bar">
      {#each Array(totalSteps) as _, i}
        <div class="progress-step" class:active={i + 1 <= currentStep} class:current={i + 1 === currentStep}>
          <div class="step-number">{i + 1}</div>
        </div>
        {#if i < totalSteps - 1}
          <div class="progress-line" class:active={i + 1 < currentStep}></div>
        {/if}
      {/each}
    </div>

    <!-- Step Content -->
    <div class="step-content">
      {#if currentStep === 1}
        <div class="step-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d={steps[0].icon}></path>
          </svg>
        </div>
        <h2>{steps[0].title}</h2>
        <p class="step-description">{steps[0].description}</p>

        <div class="features-grid">
          {#each features as feature}
            <div class="feature-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d={feature.icon}></path>
              </svg>
              <span>{feature.text}</span>
            </div>
          {/each}
        </div>

        <div class="step-actions">
          <button class="btn-primary" on:click={nextStep}>
            Get Started
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
          </button>
        </div>
      {:else if currentStep === 2}
        <div class="step-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d={steps[1].icon}></path>
          </svg>
        </div>
        <h2>{steps[1].title}</h2>
        <p class="step-description">{steps[1].description}</p>

        <div class="connect-preview">
          <div class="preview-card">
            <div class="preview-header">
              <div class="preview-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </div>
              <span>GitHub</span>
            </div>
            <p>Connect to import your repositories</p>
          </div>
        </div>

        <div class="step-actions">
          <button class="btn-secondary" on:click={prevStep}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 17l-5-5m0 0l5-5m-5 5h12"></path>
            </svg>
            Back
          </button>
          <button class="btn-primary" on:click={handleConnect}>
            Connect Repository
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
          </button>
        </div>
      {:else if currentStep === 3}
        <div class="step-icon success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d={steps[2].icon}></path>
          </svg>
        </div>
        <h2>{steps[2].title}</h2>
        <p class="step-description">{steps[2].description}</p>

        <div class="doc-types-preview">
          <div class="doc-type">
            <div class="doc-icon readme">README</div>
            <span>Project overview</span>
          </div>
          <div class="doc-type">
            <div class="doc-icon api">API</div>
            <span>Endpoints & methods</span>
          </div>
          <div class="doc-type">
            <div class="doc-icon arch">ARCH</div>
            <span>System design</span>
          </div>
          <div class="doc-type">
            <div class="doc-icon setup">SETUP</div>
            <span>Installation steps</span>
          </div>
        </div>

        <div class="step-actions">
          <button class="btn-secondary" on:click={prevStep}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 17l-5-5m0 0l5-5m-5 5h12"></path>
            </svg>
            Back
          </button>
          <button class="btn-primary" on:click={handleComplete}>
            Start Documenting
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 13l4 4L19 7"></path>
            </svg>
          </button>
        </div>
      {/if}
    </div>

    <!-- Skip Link -->
    <button class="skip-link" on:click={skip}>
      Skip onboarding
    </button>
  </div>
</div>

<style>
  .onboarding-wizard {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 60vh;
    padding: 32px;
  }

  .wizard-card {
    background: #111113;
    border: 1px solid #262628;
    border-radius: 20px;
    padding: 40px;
    max-width: 560px;
    width: 100%;
    text-align: center;
  }

  .progress-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 40px;
  }

  .progress-step {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #262628;
    transition: all 0.3s;
  }

  .progress-step.active {
    background: rgba(16, 185, 129, 0.2);
  }

  .progress-step.current {
    background: #10b981;
  }

  .step-number {
    font-size: 0.85rem;
    font-weight: 600;
    color: #6b6b70;
  }

  .progress-step.active .step-number {
    color: #10b981;
  }

  .progress-step.current .step-number {
    color: #000;
  }

  .progress-line {
    width: 40px;
    height: 2px;
    background: #262628;
    transition: all 0.3s;
  }

  .progress-line.active {
    background: #10b981;
  }

  .step-content {
    margin-bottom: 24px;
  }

  .step-icon {
    width: 64px;
    height: 64px;
    background: rgba(16, 185, 129, 0.1);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
  }

  .step-icon svg {
    width: 32px;
    height: 32px;
    color: #10b981;
  }

  .step-icon.success {
    background: rgba(16, 185, 129, 0.2);
  }

  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 12px;
  }

  .step-description {
    color: #a1a1a6;
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 32px;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 32px;
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    text-align: left;
  }

  .feature-item svg {
    width: 20px;
    height: 20px;
    color: #10b981;
    min-width: 20px;
  }

  .feature-item span {
    font-size: 0.9rem;
    color: #a1a1a6;
  }

  .connect-preview {
    margin-bottom: 32px;
  }

  .preview-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 24px;
    max-width: 280px;
    margin: 0 auto;
  }

  .preview-header {
    display: flex;
    align-items: center;
    gap: 12px;
    justify-content: center;
    margin-bottom: 12px;
  }

  .preview-icon {
    width: 32px;
    height: 32px;
  }

  .preview-icon svg {
    width: 100%;
    height: 100%;
    color: #fff;
  }

  .preview-header span {
    font-size: 1.1rem;
    font-weight: 600;
    color: #fff;
  }

  .preview-card p {
    color: #6b6b70;
    font-size: 0.9rem;
  }

  .doc-types-preview {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 32px;
  }

  .doc-type {
    text-align: center;
  }

  .doc-icon {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 8px;
    font-size: 0.7rem;
    font-weight: 700;
    color: #fff;
  }

  .doc-icon.readme { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
  .doc-icon.api { background: linear-gradient(135deg, #10b981, #059669); }
  .doc-icon.arch { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
  .doc-icon.setup { background: linear-gradient(135deg, #f59e0b, #d97706); }

  .doc-type span {
    font-size: 0.75rem;
    color: #6b6b70;
  }

  .step-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .btn-primary, .btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 14px 28px;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }

  .btn-primary {
    background: #10b981;
    color: #000;
    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
  }

  .btn-primary:hover {
    background: #059669;
    transform: translateY(-2px);
  }

  .btn-primary svg, .btn-secondary svg {
    width: 18px;
    height: 18px;
  }

  .btn-secondary {
    background: transparent;
    color: #a1a1a6;
    border: 1px solid #262628;
  }

  .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
  }

  .skip-link {
    display: inline-block;
    margin-top: 24px;
    color: #6b6b70;
    font-size: 0.9rem;
    background: none;
    border: none;
    cursor: pointer;
    transition: color 0.2s;
  }

  .skip-link:hover {
    color: #a1a1a6;
  }

  @media (max-width: 640px) {
    .wizard-card {
      padding: 24px;
    }

    .features-grid {
      grid-template-columns: 1fr;
    }

    .doc-types-preview {
      grid-template-columns: repeat(2, 1fr);
    }

    .step-actions {
      flex-direction: column;
    }

    .btn-primary, .btn-secondary {
      width: 100%;
      justify-content: center;
    }
  }
</style>
