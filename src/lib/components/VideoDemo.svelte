<script lang="ts">
  import { trackClientEvent } from '$lib/stores/analytics';

  export let videoUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
  export let thumbnailUrl = '/images/demo-thumbnail.jpg';

  let showModal = false;

  function openVideo() {
    showModal = true;
    trackClientEvent('video_demo_opened');
  }

  function closeVideo() {
    showModal = false;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      closeVideo();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="video-demo">
  <button class="video-trigger" on:click={openVideo} type="button">
    <div class="thumbnail">
      <div class="thumbnail-overlay">
        <div class="play-button">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>
      <div class="thumbnail-content">
        <div class="fake-browser">
          <div class="browser-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div class="browser-url">codedoc.ai/demo</div>
        </div>
        <div class="demo-preview">
          <div class="demo-sidebar">
            <div class="sidebar-item active"></div>
            <div class="sidebar-item"></div>
            <div class="sidebar-item"></div>
            <div class="sidebar-item"></div>
          </div>
          <div class="demo-content">
            <div class="content-line long"></div>
            <div class="content-line medium"></div>
            <div class="content-line short"></div>
            <div class="content-line long"></div>
            <div class="content-line medium"></div>
          </div>
        </div>
      </div>
    </div>
    <span class="video-label">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/>
      </svg>
      Watch 60-second demo
    </span>
  </button>
</div>

{#if showModal}
  <div
    class="modal-overlay"
    on:click|self={closeVideo}
    on:keydown={(e) => e.key === 'Escape' && closeVideo()}
    role="dialog"
    aria-modal="true"
    aria-label="Video demo"
    tabindex="-1"
  >
    <div class="modal-content">
      <button class="close-button" on:click={closeVideo} aria-label="Close video">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
      <div class="video-container">
        <iframe
          src="{videoUrl}?autoplay=1"
          title="CodeDoc AI Demo"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    </div>
  </div>
{/if}

<style>
  .video-demo {
    margin: 32px 0;
  }

  .video-trigger {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    background: none;
    border: none;
    cursor: pointer;
    width: 100%;
    max-width: 480px;
    margin: 0 auto;
  }

  .thumbnail {
    position: relative;
    width: 100%;
    aspect-ratio: 16/9;
    border-radius: 16px;
    overflow: hidden;
    background: #111113;
    border: 1px solid #262628;
    transition: all 0.3s;
  }

  .video-trigger:hover .thumbnail {
    border-color: #10b981;
    box-shadow: 0 8px 40px rgba(16, 185, 129, 0.2);
    transform: translateY(-4px);
  }

  .thumbnail-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.3);
    z-index: 2;
  }

  .play-button {
    width: 72px;
    height: 72px;
    background: #10b981;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    box-shadow: 0 8px 30px rgba(16, 185, 129, 0.4);
  }

  .video-trigger:hover .play-button {
    transform: scale(1.1);
    box-shadow: 0 12px 40px rgba(16, 185, 129, 0.5);
  }

  .play-button svg {
    width: 32px;
    height: 32px;
    color: #000;
    margin-left: 4px;
  }

  .thumbnail-content {
    position: absolute;
    inset: 0;
    padding: 12px;
    z-index: 1;
  }

  .fake-browser {
    background: #1a1a1c;
    border-radius: 8px 8px 0 0;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .browser-dots {
    display: flex;
    gap: 6px;
  }

  .browser-dots span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #3a3a3c;
  }

  .browser-dots span:first-child { background: #ef4444; }
  .browser-dots span:nth-child(2) { background: #fbbf24; }
  .browser-dots span:last-child { background: #22c55e; }

  .browser-url {
    flex: 1;
    background: #262628;
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 0.7rem;
    color: #6b6b70;
    text-align: left;
  }

  .demo-preview {
    display: flex;
    height: calc(100% - 40px);
    background: #0a0a0b;
    border-radius: 0 0 8px 8px;
  }

  .demo-sidebar {
    width: 60px;
    background: #111113;
    padding: 12px 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .sidebar-item {
    height: 28px;
    background: #262628;
    border-radius: 4px;
  }

  .sidebar-item.active {
    background: rgba(16, 185, 129, 0.3);
    border: 1px solid rgba(16, 185, 129, 0.5);
  }

  .demo-content {
    flex: 1;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .content-line {
    height: 12px;
    background: #262628;
    border-radius: 4px;
  }

  .content-line.long { width: 100%; }
  .content-line.medium { width: 75%; }
  .content-line.short { width: 50%; }

  .video-label {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #a1a1a6;
    font-size: 0.95rem;
    font-weight: 500;
    transition: color 0.2s;
  }

  .video-trigger:hover .video-label {
    color: #10b981;
  }

  .video-label svg {
    width: 20px;
    height: 20px;
  }

  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }

  .modal-content {
    position: relative;
    width: 100%;
    max-width: 900px;
  }

  .close-button {
    position: absolute;
    top: -40px;
    right: 0;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
  }

  .close-button svg {
    width: 24px;
    height: 24px;
    color: #fff;
  }

  .close-button:hover svg {
    color: #10b981;
  }

  .video-container {
    position: relative;
    width: 100%;
    padding-bottom: 56.25%;
    background: #000;
    border-radius: 12px;
    overflow: hidden;
  }

  .video-container iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  @media (max-width: 640px) {
    .play-button {
      width: 56px;
      height: 56px;
    }

    .play-button svg {
      width: 24px;
      height: 24px;
    }
  }
</style>
