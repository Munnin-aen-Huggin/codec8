<script lang="ts">
	export let title: string;
	export let description: string;
	export let slug: string;
	export let date: string;
	export let readingTime: number;
	export let tags: string[] = [];

	$: formattedDate = new Date(date).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
</script>

<a href="/blog/{slug}" class="blog-card">
	<div class="card-content">
		<div class="card-meta">
			<time datetime={date}>{formattedDate}</time>
			<span class="separator">&middot;</span>
			<span>{readingTime} min read</span>
		</div>
		<h3>{title}</h3>
		<p>{description}</p>
		{#if tags.length > 0}
			<div class="card-tags">
				{#each tags.slice(0, 3) as tag}
					<span class="tag">{tag}</span>
				{/each}
			</div>
		{/if}
	</div>
</a>

<style>
	.blog-card {
		display: block;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 12px;
		padding: 1.5rem;
		text-decoration: none;
		transition: all 0.2s ease;
	}
	.blog-card:hover {
		border-color: rgba(99, 102, 241, 0.4);
		background: rgba(99, 102, 241, 0.05);
		transform: translateY(-2px);
	}
	.card-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.85rem;
		color: rgba(255, 255, 255, 0.5);
		margin-bottom: 0.75rem;
	}
	h3 {
		font-size: 1.25rem;
		font-weight: 700;
		color: #fff;
		margin: 0 0 0.5rem;
		line-height: 1.4;
	}
	p {
		font-size: 0.95rem;
		color: rgba(255, 255, 255, 0.6);
		line-height: 1.6;
		margin: 0;
	}
	.card-tags {
		display: flex;
		gap: 0.5rem;
		margin-top: 1rem;
		flex-wrap: wrap;
	}
	.tag {
		font-size: 0.75rem;
		padding: 0.2rem 0.6rem;
		border-radius: 9999px;
		background: rgba(99, 102, 241, 0.15);
		color: rgba(99, 102, 241, 0.9);
	}
</style>
