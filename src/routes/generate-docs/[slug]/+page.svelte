<script lang="ts">
	import { getRelatedPages } from '$lib/data/seo-pages';
	import type { PageData } from './$types';

	export let data: PageData;

	$: page = data.page;
	$: related = getRelatedPages(page);

	const SITE = 'https://codec8.com';

	$: canonicalUrl = `${SITE}/generate-docs/${page.slug}`;
	$: title = `${page.name} Documentation Generator - Auto-generate README & API Docs | Codec8`;

	$: faqSchema = {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: page.faqs.map((faq) => ({
			'@type': 'Question',
			name: faq.q,
			acceptedAnswer: {
				'@type': 'Answer',
				text: faq.a
			}
		}))
	};

	$: softwareSchema = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'Codec8',
		applicationCategory: 'DeveloperApplication',
		operatingSystem: 'Web',
		description: `AI-powered documentation generator for ${page.name} projects on GitHub. Generates README, API docs, architecture diagrams, and setup guides automatically.`,
		url: canonicalUrl,
		offers: [
			{
				'@type': 'Offer',
				price: '0',
				priceCurrency: 'USD',
				name: 'Free Demo'
			},
			{
				'@type': 'Offer',
				price: '99',
				priceCurrency: 'USD',
				name: 'Single Repo'
			}
		]
	};
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={page.description} />
	<link rel="canonical" href={canonicalUrl} />

	<!-- Open Graph -->
	<meta property="og:title" content={title} />
	<meta property="og:description" content={page.description} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:image" content="{SITE}/og-image.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:type" content="website" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={page.description} />
	<meta name="twitter:image" content="{SITE}/og-image.png" />
	<meta name="twitter:site" content="@code_c8" />

	<!-- JSON-LD: FAQPage -->
	{@html `<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>`}

	<!-- JSON-LD: SoftwareApplication -->
	{@html `<script type="application/ld+json">${JSON.stringify(softwareSchema)}</script>`}

	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<!-- Navigation -->
<nav class="top-nav">
	<div class="container">
		<a href="/" class="logo">Codec8</a>
		<div class="nav-actions">
			<a href="/blog" class="nav-link">Blog</a>
			<a href="/#pricing" class="nav-link">Pricing</a>
			<a href="/auth/login" class="nav-link" rel="external">Sign In</a>
			<a href="/#demo" class="nav-cta">Try Free</a>
		</div>
	</div>
</nav>

<!-- Hero Section -->
<section class="hero">
	<div class="container">
		<div class="breadcrumb">
			<a href="/generate-docs">Documentation Generators</a>
			<span class="breadcrumb-sep">/</span>
			<span>{page.name}</span>
		</div>

		<div class="type-badge">
			{page.type === 'language' ? 'Language' : 'Framework'}
			{#if page.parent}
				&nbsp;· {page.parent}
			{/if}
		</div>

		<h1>{page.headline}</h1>

		<p class="hero-subtitle">{page.description}</p>

		<div class="hero-ctas">
			<a href="/#demo" class="cta-primary">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
					<path d="M13 10V3L4 14h7v7l9-11h-7z" />
				</svg>
				Generate docs free
			</a>
			<a href="/#pricing" class="cta-secondary">See pricing</a>
		</div>

		<div class="hero-meta">
			<span>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
					<path d="M5 13l4 4L19 7" />
				</svg>
				README free, no signup
			</span>
			<span class="sep">·</span>
			<span>60 seconds</span>
			<span class="sep">·</span>
			<span>Export as Markdown</span>
		</div>
	</div>
</section>

<!-- Pain Point Section -->
<section class="pain-section">
	<div class="container">
		<div class="pain-card">
			<div class="pain-icon">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
					<circle cx="12" cy="12" r="10" />
					<path d="M12 8v4M12 16h.01" />
				</svg>
			</div>
			<div>
				<h2 class="pain-title">The {page.name} documentation problem</h2>
				<p class="pain-body">{page.pain_point}</p>
			</div>
		</div>
	</div>
</section>

<!-- Features Section -->
<section class="features-section">
	<div class="container">
		<div class="section-header">
			<h2>What Codec8 generates for your {page.name} project</h2>
			<p>Tailored documentation features for {page.name} codebases</p>
		</div>

		<div class="features-grid">
			{#each page.features as feature, i}
				<div class="feature-card">
					<div class="feature-num">{String(i + 1).padStart(2, '0')}</div>
					<p>{feature}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- How It Works -->
<section class="how-section">
	<div class="container">
		<div class="section-header">
			<h2>Three steps to complete {page.name} documentation</h2>
			<p>From zero to published docs in under a minute</p>
		</div>

		<div class="steps">
			<div class="step">
				<div class="step-number">1</div>
				<h3>Connect your {page.name} repo</h3>
				<p>
					Paste your GitHub repository URL. Public repos work instantly — no signup required for the
					free README preview.
				</p>
			</div>
			<div class="step-arrow">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
					<path d="M5 12h14M12 5l7 7-7 7" />
				</svg>
			</div>
			<div class="step">
				<div class="step-number">2</div>
				<h3>AI generates your docs</h3>
				<p>
					Codec8 reads your {page.name} source code, dependencies, and structure, then generates
					README, API docs, architecture diagrams, and setup guide.
				</p>
			</div>
			<div class="step-arrow">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
					<path d="M5 12h14M12 5l7 7-7 7" />
				</svg>
			</div>
			<div class="step">
				<div class="step-number">3</div>
				<h3>Export or open a PR</h3>
				<p>
					Download your documentation as Markdown files or let Codec8 open a pull request directly
					to your repository.
				</p>
			</div>
		</div>

		<div class="steps-cta">
			<a href="/#demo" class="cta-primary">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
					<path d="M13 10V3L4 14h7v7l9-11h-7z" />
				</svg>
				Try it free — no signup
			</a>
		</div>
	</div>
</section>

<!-- Example Repos -->
<section class="examples-section">
	<div class="container">
		<div class="section-header">
			<h2>Docs we can generate for popular {page.name} repos</h2>
			<p>These well-known projects are perfect candidates for Codec8</p>
		</div>

		<div class="examples-grid">
			{#each page.example_repos as repo}
				<div class="example-card">
					<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" class="github-icon">
						<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
					</svg>
					<a
						href="https://github.com/{repo}"
						target="_blank"
						rel="noopener noreferrer"
						class="example-link"
					>
						{repo}
					</a>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- FAQ Section -->
<section class="faq-section">
	<div class="container">
		<div class="section-header">
			<h2>Frequently asked questions about {page.name} documentation</h2>
		</div>

		<div class="faq-list">
			{#each page.faqs as faq}
				<details class="faq-item">
					<summary class="faq-question">{faq.q}</summary>
					<p class="faq-answer">{faq.a}</p>
				</details>
			{/each}
		</div>
	</div>
</section>

<!-- Related Pages -->
{#if related.length > 0}
	<section class="related-section">
		<div class="container">
			<h2 class="related-title">Also generate docs for</h2>
			<div class="related-grid">
				{#each related as rel}
					<a href="/generate-docs/{rel.slug}" class="related-card">
						<span class="related-name">{rel.name}</span>
						<span class="related-type">{rel.type}</span>
					</a>
				{/each}
			</div>
		</div>
	</section>
{/if}

<!-- Final CTA -->
<section class="final-cta-section">
	<div class="container">
		<div class="final-cta-card">
			<h2>Ready to document your {page.name} project?</h2>
			<p>
				Paste your GitHub repo URL and get a free README preview in 60 seconds. No signup required.
			</p>
			<a href="/#demo" class="cta-primary large">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
					<path d="M13 10V3L4 14h7v7l9-11h-7z" />
				</svg>
				Generate {page.name} docs free
			</a>
			<p class="final-cta-meta">
				Free README · No signup · 30-day refund on paid plans
			</p>
		</div>
	</div>
</section>

<!-- Footer -->
<footer class="footer">
	<div class="container">
		<div class="footer-top">
			<div class="footer-brand">
				<span class="footer-logo">Codec8</span>
				<p>AI documentation generator for GitHub repositories.</p>
			</div>
			<div class="footer-links">
				<a href="/">Home</a>
				<a href="/generate-docs">All languages</a>
				<a href="/blog">Blog</a>
				<a href="/terms">Terms</a>
				<a href="/privacy">Privacy</a>
			</div>
		</div>
		<div class="footer-bottom">
			<p>&copy; {new Date().getFullYear()} Codec8. All rights reserved.</p>
		</div>
	</div>
</footer>

<style>
	:root {
		--bg: #09090b;
		--bg-elevated: #111113;
		--bg-card: #131315;
		--border: #262628;
		--text: #ffffff;
		--text-secondary: #a1a1a6;
		--text-muted: #6b6b70;
		--accent: #10b981;
		--accent-hover: #059669;
		--accent-glow: rgba(16, 185, 129, 0.15);
	}

	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	:global(body) {
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
		background: var(--bg);
		color: var(--text);
		line-height: 1.6;
		-webkit-font-smoothing: antialiased;
	}

	.container {
		max-width: 1080px;
		margin: 0 auto;
		padding: 0 24px;
	}

	/* ── Nav ── */
	.top-nav {
		position: sticky;
		top: 0;
		z-index: 100;
		background: rgba(9, 9, 11, 0.92);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid var(--border);
		padding: 14px 0;
	}

	.top-nav .container {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.logo {
		font-weight: 800;
		font-size: 1.15rem;
		color: var(--text);
		text-decoration: none;
	}

	.nav-actions {
		display: flex;
		align-items: center;
		gap: 20px;
	}

	.nav-link {
		color: var(--text-secondary);
		text-decoration: none;
		font-size: 0.9rem;
		transition: color 0.2s;
	}

	.nav-link:hover {
		color: var(--text);
	}

	.nav-cta {
		background: var(--accent);
		color: #000;
		padding: 8px 18px;
		border-radius: 6px;
		font-weight: 600;
		font-size: 0.875rem;
		text-decoration: none;
		transition: background 0.2s;
	}

	.nav-cta:hover {
		background: var(--accent-hover);
	}

	/* ── Hero ── */
	.hero {
		padding: 72px 0 60px;
		background: radial-gradient(ellipse 70% 40% at 50% -10%, rgba(16, 185, 129, 0.12), transparent);
	}

	.breadcrumb {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.85rem;
		color: var(--text-muted);
		margin-bottom: 20px;
	}

	.breadcrumb a {
		color: var(--text-secondary);
		text-decoration: none;
	}

	.breadcrumb a:hover {
		color: var(--accent);
	}

	.breadcrumb-sep {
		color: var(--text-muted);
	}

	.type-badge {
		display: inline-block;
		background: rgba(16, 185, 129, 0.12);
		border: 1px solid rgba(16, 185, 129, 0.3);
		color: var(--accent);
		padding: 4px 12px;
		border-radius: 20px;
		font-size: 0.8rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 20px;
	}

	h1 {
		font-size: clamp(2rem, 4vw, 3rem);
		font-weight: 800;
		line-height: 1.15;
		letter-spacing: -0.02em;
		margin-bottom: 20px;
		color: var(--text);
		max-width: 760px;
	}

	.hero-subtitle {
		font-size: 1.125rem;
		color: var(--text-secondary);
		max-width: 620px;
		margin-bottom: 36px;
		line-height: 1.7;
	}

	.hero-ctas {
		display: flex;
		gap: 14px;
		align-items: center;
		flex-wrap: wrap;
		margin-bottom: 20px;
	}

	.cta-primary {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background: var(--accent);
		color: #000;
		padding: 13px 24px;
		border-radius: 8px;
		font-weight: 700;
		font-size: 0.95rem;
		text-decoration: none;
		transition: background 0.2s, transform 0.1s;
	}

	.cta-primary:hover {
		background: var(--accent-hover);
		transform: translateY(-1px);
	}

	.cta-primary.large {
		padding: 16px 32px;
		font-size: 1.05rem;
	}

	.cta-secondary {
		color: var(--text-secondary);
		font-size: 0.9rem;
		text-decoration: none;
		padding: 12px 4px;
		border-bottom: 1px solid var(--border);
		transition: color 0.2s, border-color 0.2s;
	}

	.cta-secondary:hover {
		color: var(--text);
		border-color: var(--text-secondary);
	}

	.hero-meta {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 0.85rem;
		color: var(--text-muted);
	}

	.hero-meta span {
		display: flex;
		align-items: center;
		gap: 5px;
	}

	.sep {
		color: var(--border);
	}

	/* ── Pain Section ── */
	.pain-section {
		padding: 48px 0;
	}

	.pain-card {
		display: flex;
		gap: 24px;
		align-items: flex-start;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 32px;
	}

	.pain-icon {
		flex-shrink: 0;
		color: #f59e0b;
		margin-top: 2px;
	}

	.pain-title {
		font-size: 1.2rem;
		font-weight: 700;
		margin-bottom: 12px;
		color: var(--text);
	}

	.pain-body {
		color: var(--text-secondary);
		line-height: 1.75;
	}

	/* ── Section Headers ── */
	.section-header {
		text-align: center;
		margin-bottom: 48px;
	}

	.section-header h2 {
		font-size: clamp(1.4rem, 2.5vw, 1.9rem);
		font-weight: 700;
		margin-bottom: 10px;
		letter-spacing: -0.01em;
	}

	.section-header p {
		color: var(--text-secondary);
		font-size: 1rem;
	}

	/* ── Features ── */
	.features-section {
		padding: 72px 0;
		background: var(--bg-elevated);
		border-top: 1px solid var(--border);
		border-bottom: 1px solid var(--border);
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 20px;
	}

	.feature-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 24px;
		transition: border-color 0.2s;
	}

	.feature-card:hover {
		border-color: rgba(16, 185, 129, 0.4);
	}

	.feature-num {
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--accent);
		letter-spacing: 0.1em;
		margin-bottom: 10px;
		font-feature-settings: 'tnum';
	}

	.feature-card p {
		color: var(--text-secondary);
		font-size: 0.9rem;
		line-height: 1.65;
	}

	/* ── How It Works ── */
	.how-section {
		padding: 72px 0;
	}

	.steps {
		display: flex;
		align-items: flex-start;
		gap: 0;
		margin-bottom: 40px;
	}

	.step {
		flex: 1;
		padding: 24px;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 10px;
	}

	.step-arrow {
		flex-shrink: 0;
		color: var(--text-muted);
		display: flex;
		align-items: center;
		padding: 0 8px;
		margin-top: 32px;
	}

	.step-number {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		background: var(--accent-glow);
		border: 1px solid rgba(16, 185, 129, 0.3);
		border-radius: 50%;
		font-size: 0.85rem;
		font-weight: 700;
		color: var(--accent);
		margin-bottom: 14px;
	}

	.step h3 {
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: 8px;
		color: var(--text);
	}

	.step p {
		font-size: 0.875rem;
		color: var(--text-secondary);
		line-height: 1.65;
	}

	.steps-cta {
		text-align: center;
	}

	/* ── Examples ── */
	.examples-section {
		padding: 72px 0;
		background: var(--bg-elevated);
		border-top: 1px solid var(--border);
		border-bottom: 1px solid var(--border);
	}

	.examples-grid {
		display: flex;
		gap: 14px;
		flex-wrap: wrap;
		justify-content: center;
	}

	.example-card {
		display: flex;
		align-items: center;
		gap: 10px;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 14px 20px;
		transition: border-color 0.2s;
	}

	.example-card:hover {
		border-color: rgba(16, 185, 129, 0.35);
	}

	.github-icon {
		color: var(--text-secondary);
		flex-shrink: 0;
	}

	.example-link {
		color: var(--text-secondary);
		text-decoration: none;
		font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', monospace;
		font-size: 0.875rem;
		transition: color 0.2s;
	}

	.example-link:hover {
		color: var(--accent);
	}

	/* ── FAQ ── */
	.faq-section {
		padding: 72px 0;
	}

	.faq-list {
		max-width: 760px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.faq-item {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 10px;
		overflow: hidden;
		transition: border-color 0.2s;
	}

	.faq-item:hover {
		border-color: rgba(16, 185, 129, 0.3);
	}

	.faq-item[open] {
		border-color: rgba(16, 185, 129, 0.4);
	}

	.faq-question {
		padding: 20px 24px;
		font-weight: 600;
		font-size: 0.95rem;
		color: var(--text);
		cursor: pointer;
		list-style: none;
		display: flex;
		align-items: center;
		justify-content: space-between;
		user-select: none;
	}

	.faq-question::-webkit-details-marker {
		display: none;
	}

	.faq-question::after {
		content: '+';
		font-size: 1.2rem;
		color: var(--accent);
		flex-shrink: 0;
		margin-left: 12px;
	}

	.faq-item[open] .faq-question::after {
		content: '−';
	}

	.faq-answer {
		padding: 0 24px 20px;
		color: var(--text-secondary);
		font-size: 0.9rem;
		line-height: 1.75;
	}

	/* ── Related Pages ── */
	.related-section {
		padding: 48px 0;
		background: var(--bg-elevated);
		border-top: 1px solid var(--border);
	}

	.related-title {
		font-size: 1.1rem;
		font-weight: 600;
		margin-bottom: 20px;
		color: var(--text-secondary);
		text-align: center;
	}

	.related-grid {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
		justify-content: center;
	}

	.related-card {
		display: flex;
		align-items: center;
		gap: 8px;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 10px 18px;
		text-decoration: none;
		transition: border-color 0.2s, background 0.2s;
	}

	.related-card:hover {
		border-color: rgba(16, 185, 129, 0.4);
		background: rgba(16, 185, 129, 0.05);
	}

	.related-name {
		color: var(--text);
		font-size: 0.9rem;
		font-weight: 500;
	}

	.related-type {
		font-size: 0.75rem;
		color: var(--text-muted);
		background: var(--bg);
		padding: 2px 8px;
		border-radius: 4px;
		border: 1px solid var(--border);
	}

	/* ── Final CTA ── */
	.final-cta-section {
		padding: 80px 0;
		background: radial-gradient(ellipse 60% 50% at 50% 50%, rgba(16, 185, 129, 0.1), transparent);
		border-top: 1px solid var(--border);
	}

	.final-cta-card {
		text-align: center;
		max-width: 560px;
		margin: 0 auto;
	}

	.final-cta-card h2 {
		font-size: clamp(1.5rem, 2.5vw, 2rem);
		font-weight: 700;
		margin-bottom: 14px;
		letter-spacing: -0.01em;
	}

	.final-cta-card > p {
		color: var(--text-secondary);
		margin-bottom: 32px;
		font-size: 1rem;
		line-height: 1.65;
	}

	.final-cta-meta {
		margin-top: 16px;
		font-size: 0.8rem;
		color: var(--text-muted);
		margin-bottom: 0 !important;
	}

	/* ── Footer ── */
	.footer {
		border-top: 1px solid var(--border);
		padding: 48px 0 32px;
		background: var(--bg-elevated);
	}

	.footer-top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 40px;
		flex-wrap: wrap;
		margin-bottom: 32px;
	}

	.footer-logo {
		font-weight: 800;
		font-size: 1.1rem;
		display: block;
		margin-bottom: 8px;
	}

	.footer-brand p {
		color: var(--text-muted);
		font-size: 0.875rem;
		max-width: 240px;
	}

	.footer-links {
		display: flex;
		gap: 20px;
		flex-wrap: wrap;
	}

	.footer-links a {
		color: var(--text-secondary);
		text-decoration: none;
		font-size: 0.875rem;
		transition: color 0.2s;
	}

	.footer-links a:hover {
		color: var(--text);
	}

	.footer-bottom {
		border-top: 1px solid var(--border);
		padding-top: 20px;
	}

	.footer-bottom p {
		color: var(--text-muted);
		font-size: 0.8rem;
	}

	/* ── Responsive ── */
	@media (max-width: 700px) {
		.steps {
			flex-direction: column;
		}

		.step-arrow {
			transform: rotate(90deg);
			align-self: center;
			margin: 0;
			padding: 4px 0;
		}

		.pain-card {
			flex-direction: column;
		}

		.nav-actions .nav-link {
			display: none;
		}

		h1 {
			font-size: 1.75rem;
		}
	}
</style>
