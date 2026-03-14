<script lang="ts">
	import TableOfContents from '$lib/components/TableOfContents.svelte';
	import BlogCTA from '$lib/components/BlogCTA.svelte';
	import BlogCard from '$lib/components/BlogCard.svelte';
	export let data;

	$: post = data.post;
	$: formattedDate = new Date(post.date).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
</script>

<svelte:head>
	<title>{post.title} - Codec8 Blog</title>
	<meta name="description" content={post.description} />
	<link rel="canonical" href="https://codec8.com/blog/{post.slug}" />

	<meta property="og:title" content={post.title} />
	<meta property="og:description" content={post.description} />
	<meta property="og:url" content="https://codec8.com/blog/{post.slug}" />
	<meta property="og:type" content="article" />
	<meta property="article:published_time" content={post.date} />
	<meta property="article:author" content={post.author} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={post.title} />
	<meta name="twitter:description" content={post.description} />
	<meta name="twitter:site" content="@code_c8" />

	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: post.title,
		description: post.description,
		datePublished: post.date,
		author: {
			'@type': 'Person',
			name: post.author
		},
		publisher: {
			'@type': 'Organization',
			name: 'Codec8',
			url: 'https://codec8.com'
		},
		mainEntityOfPage: `https://codec8.com/blog/${post.slug}`,
		wordCount: post.content.split(/\s+/).length
	})}</script>`}

	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://codec8.com' },
			{ '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://codec8.com/blog' },
			{
				'@type': 'ListItem',
				position: 3,
				name: post.title,
				item: `https://codec8.com/blog/${post.slug}`
			}
		]
	})}</script>`}

	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="post-page">
	<nav class="post-nav">
		<a href="/" class="logo">Codec8</a>
		<div class="nav-links">
			<a href="/blog">Blog</a>
			<a href="/#pricing">Pricing</a>
			<a href="/try" class="nav-cta">Try Free</a>
		</div>
	</nav>

	<div class="post-layout">
		<aside class="toc-sidebar">
			<TableOfContents entries={data.toc} />
		</aside>

		<article class="post-content">
			<header class="post-header">
				<div class="post-meta">
					<a href="/blog" class="back-link">&larr; Back to Blog</a>
					<div class="meta-row">
						<time datetime={post.date}>{formattedDate}</time>
						<span class="sep">&middot;</span>
						<span>{post.readingTime} min read</span>
						<span class="sep">&middot;</span>
						<span>{post.author}</span>
					</div>
				</div>
				<h1>{post.title}</h1>
				<p class="post-desc">{post.description}</p>
				{#if post.tags.length > 0}
					<div class="post-tags">
						{#each post.tags as tag}
							<span class="tag">{tag}</span>
						{/each}
					</div>
				{/if}
			</header>

			<div class="prose">
				{@html post.html}
			</div>

			<BlogCTA />
		</article>
	</div>

	{#if data.related.length > 0}
		<section class="related">
			<h2>Related Articles</h2>
			<div class="related-grid">
				{#each data.related as rel}
					<BlogCard
						title={rel.title}
						description={rel.description}
						slug={rel.slug}
						date={rel.date}
						readingTime={rel.readingTime}
						tags={rel.tags}
					/>
				{/each}
			</div>
		</section>
	{/if}
</div>

<style>
	:global(body) {
		background: #0a0a0f;
		color: #fff;
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
	}
	.post-page {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1.5rem 4rem;
	}
	.post-nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.25rem 0;
	}
	.logo {
		font-size: 1.25rem;
		font-weight: 800;
		color: #fff;
		text-decoration: none;
	}
	.nav-links {
		display: flex;
		gap: 1.5rem;
		align-items: center;
	}
	.nav-links a {
		font-size: 0.9rem;
		color: rgba(255, 255, 255, 0.6);
		text-decoration: none;
	}
	.nav-links a:hover {
		color: #fff;
	}
	.nav-cta {
		padding: 0.5rem 1rem !important;
		background: linear-gradient(135deg, #6366f1, #8b5cf6);
		border-radius: 8px;
		color: #fff !important;
		font-weight: 600;
	}
	.post-layout {
		display: grid;
		grid-template-columns: 220px 1fr;
		gap: 3rem;
		margin-top: 1rem;
	}
	.toc-sidebar {
		display: block;
	}
	.post-header {
		margin-bottom: 2rem;
	}
	.back-link {
		font-size: 0.85rem;
		color: rgba(99, 102, 241, 0.8);
		text-decoration: none;
	}
	.back-link:hover {
		color: #6366f1;
	}
	.meta-row {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		font-size: 0.85rem;
		color: rgba(255, 255, 255, 0.45);
		margin-top: 0.75rem;
	}
	h1 {
		font-size: 2.25rem;
		font-weight: 800;
		line-height: 1.25;
		margin: 1rem 0 0.75rem;
	}
	.post-desc {
		font-size: 1.1rem;
		color: rgba(255, 255, 255, 0.55);
		line-height: 1.6;
		margin: 0 0 1rem;
	}
	.post-tags {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
	.tag {
		font-size: 0.75rem;
		padding: 0.2rem 0.6rem;
		border-radius: 9999px;
		background: rgba(99, 102, 241, 0.15);
		color: rgba(99, 102, 241, 0.9);
	}

	/* Prose styles for rendered markdown */
	.prose :global(h2) {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 2.5rem 0 1rem;
		color: #fff;
	}
	.prose :global(h3) {
		font-size: 1.2rem;
		font-weight: 600;
		margin: 2rem 0 0.75rem;
		color: #fff;
	}
	.prose :global(p) {
		font-size: 1rem;
		line-height: 1.75;
		color: rgba(255, 255, 255, 0.7);
		margin: 0 0 1.25rem;
	}
	.prose :global(ul),
	.prose :global(ol) {
		margin: 0 0 1.25rem;
		padding-left: 1.5rem;
		color: rgba(255, 255, 255, 0.7);
	}
	.prose :global(li) {
		margin-bottom: 0.5rem;
		line-height: 1.7;
	}
	.prose :global(a) {
		color: #818cf8;
		text-decoration: underline;
	}
	.prose :global(code) {
		background: rgba(255, 255, 255, 0.08);
		padding: 0.15rem 0.4rem;
		border-radius: 4px;
		font-size: 0.9em;
	}
	.prose :global(pre) {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 8px;
		padding: 1rem;
		overflow-x: auto;
		margin: 0 0 1.5rem;
	}
	.prose :global(pre code) {
		background: none;
		padding: 0;
	}
	.prose :global(blockquote) {
		border-left: 3px solid rgba(99, 102, 241, 0.5);
		margin: 0 0 1.25rem;
		padding: 0.5rem 1rem;
		color: rgba(255, 255, 255, 0.6);
	}
	.prose :global(strong) {
		color: #fff;
		font-weight: 600;
	}
	.prose :global(hr) {
		border: none;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		margin: 2rem 0;
	}

	.related {
		margin-top: 4rem;
		padding-top: 3rem;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
	}
	.related h2 {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0 0 1.5rem;
	}
	.related-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	@media (max-width: 860px) {
		.post-layout {
			grid-template-columns: 1fr;
		}
		.toc-sidebar {
			display: none;
		}
		h1 {
			font-size: 1.75rem;
		}
	}
</style>
