<script lang="ts">
  export let width: string = '100%';
  export let height: string = '1rem';
  export let rounded: 'none' | 'sm' | 'md' | 'lg' | 'full' = 'md';
  export let animate: boolean = true;
</script>

<div
  class="skeleton"
  class:animate
  class:rounded-none={rounded === 'none'}
  class:rounded-sm={rounded === 'sm'}
  class:rounded-md={rounded === 'md'}
  class:rounded-lg={rounded === 'lg'}
  class:rounded-full={rounded === 'full'}
  style="width: {width}; height: {height};"
></div>

<style>
  .skeleton {
    background: linear-gradient(90deg, #27272a 25%, #3f3f46 50%, #27272a 75%);
    background-size: 200% 100%;
  }

  .skeleton.animate {
    animation: shimmer 1.5s infinite;
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  .rounded-none { border-radius: 0; }
  .rounded-sm { border-radius: 0.125rem; }
  .rounded-md { border-radius: 0.375rem; }
  .rounded-lg { border-radius: 0.5rem; }
  .rounded-full { border-radius: 9999px; }
</style>
