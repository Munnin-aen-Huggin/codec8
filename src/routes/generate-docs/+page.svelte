<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	const SITE = 'https://codec8.com';

	// Group frameworks by parent language
	$: frameworksByParent = data.frameworks.reduce(
		(acc, fw) => {
			const key = fw.parent || 'other';
			if (!acc[key]) acc[key] = [];
			acc[key].push(fw);
			return acc;
		},
		{} as Record<string, typeof data.frameworks>
	);
</script>

<svelte:head>
	<title>Documentation Generator for Every Language &amp; Framework | Codec8</title>
	<meta
		name="description"
		content="Codec8 auto-generates README, API docs, architecture diagrams, and setup guides for Python, JavaScript, TypeScript, Go, Rust, React, Next.js, Django, and 27 more languages and frameworks."
	/>
	<link rel="canonical" href="{SITE}/generate-docs" />

	<meta property="og:title" content="Documentation Generator for Every Language & Framework | Codec8" />
	<meta
		property="og:description"
		content="Codec8 auto-generates README, API docs, architecture diagrams, and setup guides for Python, JavaScript, TypeScript, Go, Rust, React, Next.js, Django, and 27 more languages and frameworks."
	/>
	<meta property="og:url" content="{SITE}/generate-docs" />
	<meta property="og:image" content="{SITE}/og-image.png" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Documentation Generator for Every Language & Framework | Codec8" />
	<meta name="twitter:site" content="@code_c8" />

	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<!-- Nav -->
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

<!-- Hero -->
<section class="hero">
	<div class="container">
		<div class="type-badge">
			{data.total} languages &amp; frameworks supported
		</div>
		<h1>Documentation Generator for Every Language &amp; Framework</h1>
		<p class="hero-subtitle">
			Paste any GitHub repo URL and Codec8 generates complete documentation — README, API
			reference, architecture diagrams, and setup guides — in under 60 seconds. Works with every
			major language and framework.
		</p>
		<div class="hero-ctas">
			<a href="/#demo" class="cta-primary">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
					<path d="M13 10V3L4 14h7v7l9-11h-7z" />
				</svg>
				Try free — no signup
			</a>
			<a href="/#pricing" class="cta-secondary">See pricing</a>
		</div>
	</div>
</section>

<!-- Languages -->
<section class="grid-section">
	<div class="container">
		<div class="section-header">
			<h2>Programming Languages</h2>
			<p>Generate docs for any repo in these languages</p>
		</div>

		<div class="page-grid">
			{#each data.languages as lang}
				<a href="/generate-docs/{lang.slug}" class="page-card">
					<div class="page-card-top">
						<span class="page-name">{lang.name}</span>
						<span class="page-type-badge language">Language</span>
					</div>
					<p class="page-headline">{lang.headline}</p>
					<span class="page-arrow">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
							<path d="M5 12h14M12 5l7 7-7 7" />
						</svg>
						View page
					</span>
				</a>
			{/each}
		</div>
	</div>
</section>

<!-- Frameworks -->
<section class="grid-section alt">
	<div class="container">
		<div class="section-header">
			<h2>Frameworks &amp; Libraries</h2>
			<p>Framework-specific documentation with contextual features for each ecosystem</p>
		</div>

		{#each Object.entries(frameworksByParent) as [parent, frameworks]}
			<div class="framework-group">
				<h3 class="framework-group-title">
					{parent.charAt(0).toUpperCase() + parent.slice(1)} frameworks
				</h3>
				<div class="page-grid">
					{#each frameworks as fw}
						<a href="/generate-docs/{fw.slug}" class="page-card">
							<div class="page-card-top">
								<span class="page-name">{fw.name}</span>
								<span class="page-type-badge framework">Framework</span>
							</div>
							<p class="page-headline">{fw.headline}</p>
							<span class="page-arrow">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
									<path d="M5 12h14M12 5l7 7-7 7" />
								</svg>
								View page
							</span>
						</a>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</section>

<!-- CTA -->
<section class="final-cta-section">
	<div class="container">
		<div class="final-cta-card">
			<h2>Don't see your language?</h2>
			<p>
				Codec8 works with any GitHub repository regardless of language. Our AI reads your source
				code, dependencies, and project structure to produce useful documentation even for languages
				not listed above.
			</p>
			<a href="/#demo" class="cta-primary large">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
					<path d="M13 10V3L4 14h7v7l9-11h-7z" />
				</svg>
				Try with any repo
			</a>
			<p class="final-cta-meta">Free README preview · No signup required</p>
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
		--accent-glow: rgba(16, 185, 129, 0.12);
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

	/* Nav */
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

	/* Hero */
	.hero {
		padding: 72px 0 60px;
		background: radial-gradient(ellipse 70% 40% at 50% -10%, rgba(16, 185, 129, 0.12), transparent);
	}

	.type-badge {
		display: inline-block;
		background: var(--accent-glow);
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
		font-size: clamp(1.8rem, 3.5vw, 2.8rem);
		font-weight: 800;
		line-height: 1.15;
		letter-spacing: -0.02em;
		margin-bottom: 20px;
		max-width: 760px;
	}

	.hero-subtitle {
		font-size: 1.1rem;
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
		font-size: 1rem;
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

	/* Grid sections */
	.grid-section {
		padding: 72px 0;
	}

	.grid-section.alt {
		background: var(--bg-elevated);
		border-top: 1px solid var(--border);
		border-bottom: 1px solid var(--border);
	}

	.section-header {
		text-align: center;
		margin-bottom: 48px;
	}

	.section-header h2 {
		font-size: clamp(1.4rem, 2.5vw, 1.85rem);
		font-weight: 700;
		margin-bottom: 10px;
		letter-spacing: -0.01em;
	}

	.section-header p {
		color: var(--text-secondary);
		font-size: 1rem;
	}

	.framework-group {
		margin-bottom: 48px;
	}

	.framework-group:last-child {
		margin-bottom: 0;
	}

	.framework-group-title {
		font-size: 0.85rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-muted);
		margin-bottom: 20px;
		padding-bottom: 10px;
		border-bottom: 1px solid var(--border);
	}

	.page-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 16px;
	}

	.page-card {
		display: flex;
		flex-direction: column;
		gap: 10px;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 20px;
		text-decoration: none;
		transition: border-color 0.2s, background 0.2s;
	}

	.page-card:hover {
		border-color: rgba(16, 185, 129, 0.4);
		background: rgba(16, 185, 129, 0.03);
	}

	.page-card-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	.page-name {
		font-size: 1rem;
		font-weight: 600;
		color: var(--text);
	}

	.page-type-badge {
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding: 2px 8px;
		border-radius: 4px;
		flex-shrink: 0;
	}

	.page-type-badge.language {
		background: rgba(59, 130, 246, 0.15);
		color: #60a5fa;
		border: 1px solid rgba(59, 130, 246, 0.25);
	}

	.page-type-badge.framework {
		background: rgba(167, 139, 250, 0.15);
		color: #a78bfa;
		border: 1px solid rgba(167, 139, 250, 0.25);
	}

	.page-headline {
		font-size: 0.825rem;
		color: var(--text-secondary);
		line-height: 1.5;
		flex: 1;
	}

	.page-arrow {
		display: flex;
		align-items: center;
		gap: 5px;
		font-size: 0.8rem;
		color: var(--accent);
		font-weight: 500;
		margin-top: auto;
	}

	/* Final CTA */
	.final-cta-section {
		padding: 80px 0;
		background: radial-gradient(ellipse 60% 50% at 50% 50%, rgba(16, 185, 129, 0.1), transparent);
	}

	.final-cta-card {
		text-align: center;
		max-width: 540px;
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
		margin-top: 16px !important;
		font-size: 0.8rem;
		color: var(--text-muted);
		margin-bottom: 0 !important;
	}

	/* Footer */
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

	@media (max-width: 700px) {
		h1 {
			font-size: 1.65rem;
		}

		.nav-actions .nav-link {
			display: none;
		}
	}
</style>
