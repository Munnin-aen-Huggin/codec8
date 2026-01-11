<script lang="ts">
  import Skeleton from './Skeleton.svelte';
</script>

<div class="bg-white border rounded-lg p-4">
  <div class="flex items-start justify-between gap-4">
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 mb-2">
        <Skeleton width="150px" height="1.25rem" />
        <Skeleton width="50px" height="1rem" rounded="full" />
      </div>
      <div class="mb-3">
        <Skeleton width="200px" height="0.875rem" />
      </div>
      <div class="mb-3 space-y-1">
        <Skeleton width="100%" height="0.875rem" />
        <Skeleton width="80%" height="0.875rem" />
      </div>
      <div class="flex items-center gap-1.5">
        <Skeleton width="12px" height="12px" rounded="full" />
        <Skeleton width="60px" height="0.75rem" />
      </div>
    </div>
    <div class="flex-shrink-0 flex flex-col gap-2">
      <Skeleton width="100px" height="2rem" />
      <Skeleton width="100px" height="2rem" />
    </div>
  </div>
</div>
