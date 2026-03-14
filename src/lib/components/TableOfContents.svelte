<script lang="ts">
	export let entries: { id: string; text: string; level: number }[] = [];
</script>

{#if entries.length > 0}
	<nav class="toc">
		<h4>Table of Contents</h4>
		<ul>
			{#each entries as entry}
				<li class="level-{entry.level}">
					<a href="#{entry.id}">{entry.text}</a>
				</li>
			{/each}
		</ul>
	</nav>
{/if}

<style>
	.toc {
		position: sticky;
		top: 5rem;
		max-height: calc(100vh - 6rem);
		overflow-y: auto;
		padding: 1.25rem;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 12px;
	}
	h4 {
		font-size: 0.85rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.5);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0 0 0.75rem;
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	li {
		margin: 0;
	}
	li a {
		display: block;
		padding: 0.3rem 0;
		font-size: 0.85rem;
		color: rgba(255, 255, 255, 0.5);
		text-decoration: none;
		transition: color 0.15s;
		line-height: 1.4;
	}
	li a:hover {
		color: rgba(99, 102, 241, 0.9);
	}
	.level-3 {
		padding-left: 1rem;
	}
</style>
