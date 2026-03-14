<script lang="ts">
	import BlogCard from '$lib/components/BlogCard.svelte';
	export let data;
</script>

<svelte:head>
	<title>Blog - Codec8 | Documentation Tips & Developer Guides</title>
	<meta
		name="description"
		content="Developer guides, documentation best practices, and AI-powered documentation tips. Learn how to write better READMEs, API docs, and architecture documentation."
	/>
	<link rel="canonical" href="https://codec8.com/blog" />

	<meta property="og:title" content="Codec8 Blog - Documentation Tips & Developer Guides" />
	<meta
		property="og:description"
		content="Developer guides, documentation best practices, and AI-powered documentation tips."
	/>
	<meta property="og:url" content="https://codec8.com/blog" />
	<meta property="og:type" content="website" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Codec8 Blog - Documentation Tips & Developer Guides" />
	<meta name="twitter:site" content="@code_c8" />

	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: 'Codec8 Blog',
		description:
			'Developer guides, documentation best practices, and AI-powered documentation tips.',
		url: 'https://codec8.com/blog',
		publisher: {
			'@type': 'Organization',
			name: 'Codec8',
			url: 'https://codec8.com'
		}
	})}</script>`}

	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://codec8.com' },
			{ '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://codec8.com/blog' }
		]
	})}</script>`}

	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="blog-page">
	<header class="blog-header">
		<nav class="blog-nav">
			<a href="/" class="logo">Codec8</a>
			<div class="nav-links">
				<a href="/blog" class="active">Blog</a>
				<a href="/#pricing">Pricing</a>
				<a href="/try" class="nav-cta">Try Free</a>
			</div>
		</nav>
		<div class="header-content">
			<h1>Codec8 Blog</h1>
			<p>Guides, best practices, and insights on documentation, developer tools, and AI.</p>
		</div>
	</header>

	<main class="blog-grid">
		{#each data.posts as post}
			<BlogCard
				title={post.title}
				description={post.description}
				slug={post.slug}
				date={post.date}
				readingTime={post.readingTime}
				tags={post.tags}
			/>
		{/each}
	</main>
</div>

<style>
	:global(body) {
		background: #0a0a0f;
		color: #fff;
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
	}
	.blog-page {
		max-width: 1100px;
		margin: 0 auto;
		padding: 0 1.5rem 4rem;
	}
	.blog-nav {
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
		transition: color 0.15s;
	}
	.nav-links a:hover,
	.nav-links a.active {
		color: #fff;
	}
	.nav-cta {
		padding: 0.5rem 1rem !important;
		background: linear-gradient(135deg, #6366f1, #8b5cf6);
		border-radius: 8px;
		color: #fff !important;
		font-weight: 600;
	}
	.header-content {
		text-align: center;
		padding: 3rem 0 2.5rem;
	}
	h1 {
		font-size: 2.5rem;
		font-weight: 800;
		margin: 0 0 0.75rem;
	}
	.header-content p {
		font-size: 1.1rem;
		color: rgba(255, 255, 255, 0.5);
		max-width: 600px;
		margin: 0 auto;
	}
	.blog-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 1.5rem;
	}
	@media (max-width: 640px) {
		h1 {
			font-size: 1.75rem;
		}
		.blog-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
