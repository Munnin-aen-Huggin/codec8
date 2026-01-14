<script lang="ts">
	import Skeleton from './Skeleton.svelte';
</script>

<div class="doc-skeleton">
	<!-- Action bar skeleton -->
	<div class="flex items-center justify-between mb-4 pb-4 border-b border-zinc-800">
		<Skeleton width="200px" height="1rem" />
		<div class="flex items-center gap-2">
			<Skeleton width="60px" height="2rem" rounded="md" />
			<Skeleton width="70px" height="2rem" rounded="md" />
			<Skeleton width="80px" height="2rem" rounded="md" />
		</div>
	</div>

	<!-- Document content skeleton -->
	<div class="space-y-4">
		<!-- Title -->
		<Skeleton width="60%" height="2rem" />

		<!-- Paragraph 1 -->
		<div class="space-y-2">
			<Skeleton width="100%" height="1rem" />
			<Skeleton width="90%" height="1rem" />
			<Skeleton width="95%" height="1rem" />
		</div>

		<!-- Subtitle -->
		<Skeleton width="40%" height="1.5rem" />

		<!-- Paragraph 2 -->
		<div class="space-y-2">
			<Skeleton width="100%" height="1rem" />
			<Skeleton width="85%" height="1rem" />
			<Skeleton width="92%" height="1rem" />
			<Skeleton width="75%" height="1rem" />
		</div>

		<!-- Code block -->
		<div class="bg-zinc-800 rounded-lg p-4 space-y-2">
			<Skeleton width="70%" height="0.875rem" />
			<Skeleton width="50%" height="0.875rem" />
			<Skeleton width="80%" height="0.875rem" />
			<Skeleton width="60%" height="0.875rem" />
		</div>

		<!-- Paragraph 3 -->
		<div class="space-y-2">
			<Skeleton width="100%" height="1rem" />
			<Skeleton width="88%" height="1rem" />
		</div>

		<!-- List items -->
		<div class="space-y-3 pl-4">
			<div class="flex items-center gap-2">
				<Skeleton width="8px" height="8px" rounded="full" />
				<Skeleton width="70%" height="1rem" />
			</div>
			<div class="flex items-center gap-2">
				<Skeleton width="8px" height="8px" rounded="full" />
				<Skeleton width="60%" height="1rem" />
			</div>
			<div class="flex items-center gap-2">
				<Skeleton width="8px" height="8px" rounded="full" />
				<Skeleton width="75%" height="1rem" />
			</div>
		</div>
	</div>
</div>
