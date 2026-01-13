<svelte:head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>CodeDoc AI - Complete docs in 60 seconds</title>
	<meta
		name="description"
		content="README, API docs, architecture diagrams, and setup guides - generated automatically from your GitHub repo. Try it once free."
	/>

	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<!-- Sticky Header (appears on scroll) -->
<header class="sticky-header" id="stickyHeader">
	<div class="container">
		<div class="logo">CodeDoc AI</div>
		<div class="header-actions">
			<a href="/auth/login" class="header-link">Sign In</a>
			<a href="#pricing" class="cta-small">View Pricing</a>
		</div>
	</div>
</header>

<!-- Top Navigation -->
<nav class="top-nav">
	<div class="container">
		<div class="logo">CodeDoc AI</div>
		<div class="nav-actions">
			<a href="#pricing" class="nav-link">Pricing</a>
			<a href="/auth/login" class="nav-link">Sign In</a>
			<button class="nav-cta" on:click={scrollToHero}>Try Demo</button>
		</div>
	</div>
</nav>

<!-- Hero Section -->
<section class="hero" id="hero">
	<div class="container">
		<div class="hero-content">
			<!-- Trust Badge -->
			<div class="trust-badge">
				Beta - try free, no signup
			</div>

			<!-- Headline -->
			<h1>
				Complete docs in <span>60 seconds</span>
			</h1>

			<!-- Subheadline -->
			<p class="hero-subtitle">
				README, API docs, architecture diagrams, and setup guides - generated automatically from your GitHub repo. Try it once free.
			</p>

			<!-- Doc Type Icons -->
			<div class="doc-types">
				<div class="doc-type">
					<span class="doc-icon">README</span>
				</div>
				<div class="doc-type">
					<span class="doc-icon">API Docs</span>
				</div>
				<div class="doc-type">
					<span class="doc-icon">Architecture</span>
				</div>
				<div class="doc-type">
					<span class="doc-icon">Setup Guide</span>
				</div>
			</div>

			<!-- Demo Input Box -->
			<form class="demo-form" on:submit={handleDemoSubmit}>
				<input
					type="text"
					placeholder="https://github.com/owner/repo"
					bind:value={repoUrl}
					class="demo-input"
				/>
				<button type="submit" class="cta-primary">
					Generate
				</button>
			</form>
			{#if urlError}
				<div class="error-message">{urlError}</div>
			{/if}

			<!-- Demo Details -->
			<div class="demo-details">
				<span>1 free demo per day</span>
				<span class="separator">|</span>
				<span>README preview</span>
				<span class="separator">|</span>
				<span>No signup</span>
			</div>
		</div>
	</div>
</section>

<!-- What You Get Section -->
<section class="what-you-get">
	<div class="container">
		<div class="section-header">
			<h2>What You Get</h2>
			<p>Four documentation types, automatically generated</p>
		</div>

		<div class="get-grid">
			<div class="get-card">
				<div class="get-icon">README</div>
				<h3>README.md</h3>
				<p>Project overview, badges, installation, usage, and configuration - ready to merge.</p>
			</div>
			<div class="get-card">
				<div class="get-icon">API</div>
				<h3>API Documentation</h3>
				<p>Auto-detected endpoints, request/response examples, authentication docs.</p>
			</div>
			<div class="get-card">
				<div class="get-icon">ARCH</div>
				<h3>Architecture Diagram</h3>
				<p>Component relationships and data flow in editable Mermaid.js format.</p>
			</div>
			<div class="get-card">
				<div class="get-icon">SETUP</div>
				<h3>Setup Guide</h3>
				<p>Environment setup, dependencies, and deployment instructions.</p>
			</div>
		</div>
	</div>
</section>

<!-- Free vs Paid Comparison -->
<section class="comparison">
	<div class="container">
		<div class="section-header">
			<h2>Free vs Paid</h2>
			<p>See what you get with each option</p>
		</div>

		<div class="comparison-grid">
			<div class="comparison-card free">
				<h3>FREE DEMO</h3>
				<ul>
					<li class="included">README generation</li>
					<li class="locked">API docs</li>
					<li class="locked">Architecture diagram</li>
					<li class="locked">Setup guide</li>
					<li class="included">Public repos only</li>
					<li class="included">1 demo per day</li>
					<li class="locked">No export</li>
				</ul>
			</div>
			<div class="comparison-card paid">
				<h3>SINGLE REPO - $39 once</h3>
				<ul>
					<li class="included">All 4 documentation types</li>
					<li class="included">Private repos</li>
					<li class="included">Keep forever</li>
					<li class="included">Export & PR creation</li>
					<li class="included">Regenerate: $9</li>
				</ul>
			</div>
		</div>
	</div>
</section>

<!-- How It Works -->
<section class="how-section">
	<div class="container">
		<div class="section-header">
			<h2>How It Works</h2>
			<p>Three simple steps to complete documentation</p>
		</div>

		<div class="steps">
			<div class="step">
				<div class="step-number">1</div>
				<h3>Paste your repo URL</h3>
				<p>Enter any GitHub repository URL - public or private.</p>
			</div>
			<div class="step">
				<div class="step-number">2</div>
				<h3>AI generates docs</h3>
				<p>Claude AI analyzes your code and creates documentation.</p>
			</div>
			<div class="step">
				<div class="step-number">3</div>
				<h3>Export or sync</h3>
				<p>Download as markdown or create a pull request directly.</p>
			</div>
		</div>
	</div>
</section>

<!-- Pricing Section -->
<section class="pricing-section" id="pricing">
	<div class="container">
		<div class="section-header">
			<h2>Simple Pricing</h2>
			<p>7-day free trial on Pro & Team | $9 to regenerate Single Repo | Cancel anytime</p>
		</div>

		<div class="pricing-grid">
			<!-- Free Demo -->
			<div class="pricing-card">
				<h3>FREE DEMO</h3>
				<div class="price">
					<span class="amount">$0</span>
				</div>
				<ul class="features">
					<li>README only</li>
					<li>1/day limit</li>
					<li>Public repos</li>
					<li>No signup</li>
				</ul>
				<button class="pricing-cta" on:click={scrollToHero}>Try Demo</button>
			</div>

			<!-- Single Repo -->
			<div class="pricing-card">
				<h3>SINGLE REPO</h3>
				<div class="price">
					<span class="amount">$39</span>
					<span class="period">one-time</span>
				</div>
				<ul class="features">
					<li>All 4 doc types</li>
					<li>Private repos</li>
					<li>Export & PRs</li>
					<li>Regenerate: $9</li>
					<li>No subscription</li>
				</ul>
				<a href="/auth/login?intent=purchase&product=single" class="pricing-cta">Buy Once - $39</a>
			</div>

			<!-- Pro -->
			<div class="pricing-card featured">
				<div class="featured-badge">POPULAR</div>
				<h3>PRO</h3>
				<div class="price">
					<span class="amount">$99</span>
					<span class="period">/mo</span>
				</div>
				<ul class="features">
					<li>30 repos/month</li>
					<li>All features</li>
					<li>Auto-sync on push</li>
					<li>Priority support</li>
				</ul>
				<a href="/auth/login?intent=trial&tier=pro" class="pricing-cta primary">Start 7-Day Trial</a>
			</div>

			<!-- Team -->
			<div class="pricing-card">
				<h3>TEAM</h3>
				<div class="price">
					<span class="amount">$249</span>
					<span class="period">/mo</span>
				</div>
				<ul class="features">
					<li>100 repos/month</li>
					<li>5 team members</li>
					<li>Custom templates</li>
					<li>Slack integration</li>
				</ul>
				<a href="/auth/login?intent=trial&tier=team" class="pricing-cta">Start 7-Day Trial</a>
			</div>
		</div>
	</div>
</section>

<!-- FAQ Section -->
<section class="faq-section">
	<div class="container">
		<div class="section-header">
			<h2>Frequently Asked Questions</h2>
		</div>

		<div class="faq-list">
			{#each faqs as faq, index}
				<div class="faq-item" class:open={openFaq === index}>
					<button class="faq-question" on:click={() => toggleFaq(index)}>
						<span>{faq.question}</span>
						<span class="faq-icon">{openFaq === index ? '-' : '+'}</span>
					</button>
					{#if openFaq === index}
						<div class="faq-answer">
							<p>{faq.answer}</p>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Final CTA -->
<section class="final-cta">
	<div class="container">
		<h2>See it work. Free.</h2>
		<p>One demo. Full README. Decide later.</p>

		<form class="demo-form" on:submit={handleDemoSubmit}>
			<input
				type="text"
				placeholder="https://github.com/owner/repo"
				bind:value={repoUrl}
				class="demo-input"
			/>
			<button type="submit" class="cta-primary">
				Generate
			</button>
		</form>
	</div>
</section>

<!-- Footer -->
<footer>
	<div class="container">
		<div class="footer-links">
			<a href="/privacy">Privacy</a>
			<a href="/terms">Terms</a>
			<a href="mailto:support@codedoc.ai">Contact</a>
		</div>
		<p class="footer-copy">2026 CodeDoc AI</p>
	</div>
</footer>

<script lang="ts">
	import { onMount } from 'svelte';

	let repoUrl = '';
	let urlError = '';
	let openFaq: number | null = null;

	const faqs = [
		{
			question: 'What languages do you support?',
			answer: 'JavaScript, TypeScript, Python, Go, Rust, Java, Ruby, PHP, and more. We support all major frameworks including React, Next.js, Express, Django, FastAPI, Rails, and Laravel.'
		},
		{
			question: 'Is my code secure?',
			answer: 'Yes. We never store your code after processing. All analysis happens in isolated environments. Your code is transmitted securely and deleted immediately after documentation generation.'
		},
		{
			question: 'Why only README in the free demo?',
			answer: 'The free demo lets you experience the quality of our AI-generated documentation without commitment. README is the most essential doc type. Purchase Single Repo or subscribe to Pro/Team for all 4 documentation types.'
		},
		{
			question: 'Can I edit the generated docs?',
			answer: 'Absolutely. All generated documentation is editable before export. You can refine, add sections, or modify anything. Paid tiers include a full markdown editor with live preview.'
		},
		{
			question: 'What if I\'m not satisfied?',
			answer: 'Pro and Team subscriptions include a 7-day free trial. For Single Repo purchases, contact us within 7 days for a full refund if the documentation doesn\'t meet your expectations.'
		},
		{
			question: 'Why 1 demo per day?',
			answer: 'This limit prevents abuse while letting everyone try the service. It ensures our AI resources remain available for all users. Need more? The Single Repo option at $39 gives you unlimited access to one repository.'
		}
	];

	function validateGitHubUrl(url: string): boolean {
		const githubPattern = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/;
		return githubPattern.test(url.trim());
	}

	function handleDemoSubmit(e: Event) {
		e.preventDefault();
		urlError = '';

		if (!repoUrl.trim()) {
			urlError = 'Please enter a GitHub repository URL';
			return;
		}

		if (!validateGitHubUrl(repoUrl)) {
			urlError = 'Please enter a valid GitHub URL (https://github.com/owner/repo)';
			return;
		}

		// Redirect to try page with encoded URL
		const encodedUrl = encodeURIComponent(repoUrl.trim());
		window.location.href = `/try?url=${encodedUrl}`;
	}

	function scrollToHero() {
		const hero = document.getElementById('hero');
		if (hero) {
			hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	function toggleFaq(index: number) {
		openFaq = openFaq === index ? null : index;
	}

	onMount(() => {
		// Sticky header on scroll
		const stickyHeader = document.getElementById('stickyHeader');

		const handleScroll = () => {
			const currentScroll = window.pageYOffset;

			if (currentScroll > 400) {
				stickyHeader?.classList.add('visible');
			} else {
				stickyHeader?.classList.remove('visible');
			}
		};

		window.addEventListener('scroll', handleScroll);

		// Smooth scroll for anchor links
		document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
			anchor.addEventListener('click', function (this: HTMLAnchorElement, e: Event) {
				e.preventDefault();
				const target = document.querySelector(this.getAttribute('href') || '');
				if (target) {
					(target as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
				}
			});
		});

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

<style>
	:root {
		--bg: #09090b;
		--bg-elevated: #111113;
		--bg-hover: #1a1a1c;
		--border: #262628;
		--text: #ffffff;
		--text-secondary: #a1a1a6;
		--text-muted: #6b6b70;
		--accent: #10b981;
		--accent-hover: #059669;
		--accent-glow: rgba(16, 185, 129, 0.3);
	}

	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	html {
		scroll-behavior: smooth;
		font-size: 16px;
	}

	:global(body) {
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
		background: var(--bg);
		color: var(--text);
		line-height: 1.6;
		-webkit-font-smoothing: antialiased;
	}

	/* Utility Classes */
	.container {
		max-width: 1100px;
		margin: 0 auto;
		padding: 0 20px;
	}

	/* Sticky Header */
	.sticky-header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 1000;
		background: rgba(9, 9, 11, 0.95);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid var(--border);
		padding: 12px 0;
		transform: translateY(-100%);
		transition: transform 0.3s ease;
	}

	.sticky-header.visible {
		transform: translateY(0);
	}

	.sticky-header .container {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.sticky-header .logo {
		font-weight: 700;
		font-size: 1.1rem;
		color: var(--text);
	}

	.sticky-header .cta-small {
		background: var(--accent);
		color: #000;
		padding: 8px 20px;
		border-radius: 6px;
		font-weight: 600;
		font-size: 0.9rem;
		text-decoration: none;
		transition: all 0.2s;
	}

	.sticky-header .cta-small:hover {
		background: var(--accent-hover);
	}

	.sticky-header .header-actions {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.sticky-header .header-link {
		color: var(--text-secondary);
		text-decoration: none;
		font-size: 0.9rem;
		transition: color 0.2s;
	}

	.sticky-header .header-link:hover {
		color: var(--text);
	}

	/* Top Navigation */
	.top-nav {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		z-index: 100;
		padding: 20px 0;
	}

	.top-nav .container {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.top-nav .logo {
		font-weight: 700;
		font-size: 1.2rem;
		color: var(--text);
	}

	.nav-actions {
		display: flex;
		align-items: center;
		gap: 24px;
	}

	.nav-link {
		color: var(--text-secondary);
		text-decoration: none;
		font-size: 0.95rem;
		transition: color 0.2s;
	}

	.nav-link:hover {
		color: var(--text);
	}

	.nav-cta {
		background: var(--accent);
		color: #000;
		padding: 10px 20px;
		border-radius: 8px;
		font-weight: 600;
		font-size: 0.95rem;
		text-decoration: none;
		transition: all 0.2s;
		border: none;
		cursor: pointer;
	}

	.nav-cta:hover {
		background: var(--accent-hover);
		transform: translateY(-1px);
	}

	/* Hero Section */
	.hero {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 100px 0 60px;
		position: relative;
		overflow: hidden;
	}

	.hero::before {
		content: '';
		position: absolute;
		top: -50%;
		left: 50%;
		transform: translateX(-50%);
		width: 800px;
		height: 800px;
		background: radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%);
		pointer-events: none;
	}

	.hero-content {
		position: relative;
		z-index: 1;
		text-align: center;
		max-width: 800px;
		margin: 0 auto;
	}

	/* Trust Badge */
	.trust-badge {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background: rgba(16, 185, 129, 0.1);
		border: 1px solid rgba(16, 185, 129, 0.3);
		color: var(--accent);
		padding: 8px 16px;
		border-radius: 100px;
		font-size: 0.85rem;
		font-weight: 600;
		margin-bottom: 24px;
	}

	/* Headline */
	.hero h1 {
		font-size: clamp(2.5rem, 6vw, 4rem);
		font-weight: 800;
		line-height: 1.1;
		margin-bottom: 20px;
		letter-spacing: -0.03em;
	}

	.hero h1 span {
		background: linear-gradient(135deg, var(--accent) 0%, #34d399 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	/* Subheadline */
	.hero-subtitle {
		font-size: 1.25rem;
		color: var(--text-secondary);
		margin-bottom: 32px;
		max-width: 600px;
		margin-left: auto;
		margin-right: auto;
	}

	/* Doc Types */
	.doc-types {
		display: flex;
		justify-content: center;
		gap: 16px;
		margin-bottom: 32px;
		flex-wrap: wrap;
	}

	.doc-type {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.doc-icon {
		background: var(--bg-elevated);
		border: 1px solid var(--border);
		padding: 8px 12px;
		border-radius: 6px;
		font-size: 0.85rem;
		color: var(--text-secondary);
	}

	/* Demo Form */
	.demo-form {
		display: flex;
		gap: 12px;
		max-width: 560px;
		margin: 0 auto 16px;
	}

	.demo-input {
		flex: 1;
		padding: 16px 20px;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--bg-elevated);
		color: var(--text);
		font-size: 1rem;
		outline: none;
		transition: border-color 0.2s;
	}

	.demo-input:focus {
		border-color: var(--accent);
	}

	.demo-input::placeholder {
		color: var(--text-muted);
	}

	.cta-primary {
		background: var(--accent);
		color: #000;
		padding: 16px 32px;
		border: none;
		border-radius: 10px;
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
	}

	.cta-primary:hover {
		background: var(--accent-hover);
		transform: translateY(-2px);
		box-shadow: 0 8px 30px var(--accent-glow);
	}

	.error-message {
		color: #ef4444;
		font-size: 0.9rem;
		margin-bottom: 16px;
		text-align: center;
	}

	/* Demo Details */
	.demo-details {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		font-size: 0.85rem;
		color: var(--text-muted);
		flex-wrap: wrap;
	}

	.demo-details .separator {
		color: var(--border);
	}

	/* Section Styles */
	.section-header {
		text-align: center;
		margin-bottom: 48px;
	}

	.section-header h2 {
		font-size: 2rem;
		font-weight: 700;
		margin-bottom: 12px;
	}

	.section-header p {
		color: var(--text-secondary);
		font-size: 1.1rem;
	}

	/* What You Get Section */
	.what-you-get {
		padding: 80px 0;
	}

	.get-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 24px;
	}

	.get-card {
		background: var(--bg-elevated);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 28px;
		transition: all 0.3s;
	}

	.get-card:hover {
		border-color: var(--accent);
		transform: translateY(-4px);
	}

	.get-icon {
		display: inline-block;
		background: rgba(16, 185, 129, 0.1);
		color: var(--accent);
		padding: 8px 12px;
		border-radius: 6px;
		font-size: 0.75rem;
		font-weight: 700;
		margin-bottom: 16px;
	}

	.get-card h3 {
		font-size: 1.15rem;
		margin-bottom: 8px;
	}

	.get-card p {
		color: var(--text-secondary);
		font-size: 0.95rem;
	}

	/* Comparison Section */
	.comparison {
		padding: 80px 0;
		background: linear-gradient(180deg, transparent 0%, var(--bg-elevated) 50%, transparent 100%);
	}

	.comparison-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 24px;
		max-width: 700px;
		margin: 0 auto;
	}

	.comparison-card {
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 28px;
	}

	.comparison-card.paid {
		border-color: var(--accent);
	}

	.comparison-card h3 {
		font-size: 1.1rem;
		margin-bottom: 20px;
		text-align: center;
	}

	.comparison-card ul {
		list-style: none;
	}

	.comparison-card li {
		padding: 10px 0;
		border-bottom: 1px solid var(--border);
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 0.95rem;
	}

	.comparison-card li:last-child {
		border-bottom: none;
	}

	.comparison-card li.included::before {
		content: '\2713';
		color: var(--accent);
		font-weight: 700;
	}

	.comparison-card li.locked {
		color: var(--text-muted);
	}

	.comparison-card li.locked::before {
		content: '\1F512';
		font-size: 0.85rem;
	}

	/* How It Works */
	.how-section {
		padding: 80px 0;
	}

	.steps {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 40px;
		max-width: 900px;
		margin: 0 auto;
	}

	@media (max-width: 768px) {
		.steps {
			grid-template-columns: 1fr;
			gap: 32px;
		}
	}

	.step {
		text-align: center;
		position: relative;
	}

	.step:not(:last-child)::after {
		content: '\2192';
		position: absolute;
		right: -28px;
		top: 24px;
		color: var(--text-muted);
		font-size: 1.5rem;
	}

	@media (max-width: 768px) {
		.step:not(:last-child)::after {
			content: '\2193';
			position: static;
			display: block;
			margin-top: 20px;
		}
	}

	.step-number {
		width: 56px;
		height: 56px;
		background: var(--accent);
		color: #000;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0 auto 20px;
	}

	.step h3 {
		font-size: 1.1rem;
		margin-bottom: 8px;
	}

	.step p {
		color: var(--text-secondary);
		font-size: 0.9rem;
	}

	/* Pricing Section */
	.pricing-section {
		padding: 80px 0;
	}

	.pricing-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 20px;
	}

	@media (max-width: 1024px) {
		.pricing-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 640px) {
		.pricing-grid {
			grid-template-columns: 1fr;
		}
	}

	.pricing-card {
		background: var(--bg-elevated);
		border: 1px solid var(--border);
		border-radius: 16px;
		padding: 28px;
		text-align: center;
		position: relative;
	}

	.pricing-card.featured {
		border: 2px solid var(--accent);
	}

	.featured-badge {
		position: absolute;
		top: -12px;
		left: 50%;
		transform: translateX(-50%);
		background: var(--accent);
		color: #000;
		padding: 4px 12px;
		border-radius: 100px;
		font-size: 0.7rem;
		font-weight: 700;
	}

	.pricing-card h3 {
		font-size: 1rem;
		margin-bottom: 16px;
		color: var(--text-secondary);
	}

	.price {
		margin-bottom: 24px;
	}

	.price .amount {
		font-size: 2.5rem;
		font-weight: 800;
	}

	.price .period {
		color: var(--text-muted);
		font-size: 0.9rem;
	}

	.features {
		list-style: none;
		text-align: left;
		margin-bottom: 24px;
	}

	.features li {
		padding: 8px 0;
		font-size: 0.9rem;
		color: var(--text-secondary);
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.features li::before {
		content: '\2713';
		color: var(--accent);
		font-weight: 700;
	}

	.pricing-cta {
		display: block;
		width: 100%;
		background: transparent;
		color: var(--text);
		padding: 12px 20px;
		border: 1px solid var(--border);
		border-radius: 8px;
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		text-decoration: none;
		text-align: center;
	}

	.pricing-cta:hover {
		background: var(--bg-hover);
		border-color: var(--text-muted);
	}

	.pricing-cta.primary {
		background: var(--accent);
		color: #000;
		border-color: var(--accent);
	}

	.pricing-cta.primary:hover {
		background: var(--accent-hover);
		border-color: var(--accent-hover);
	}

	/* FAQ Section */
	.faq-section {
		padding: 80px 0;
	}

	.faq-list {
		max-width: 700px;
		margin: 0 auto;
	}

	.faq-item {
		border-bottom: 1px solid var(--border);
	}

	.faq-question {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px 0;
		background: none;
		border: none;
		color: var(--text);
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		text-align: left;
	}

	.faq-question:hover {
		color: var(--accent);
	}

	.faq-icon {
		font-size: 1.5rem;
		color: var(--text-muted);
	}

	.faq-answer {
		padding: 0 0 20px;
	}

	.faq-answer p {
		color: var(--text-secondary);
		font-size: 0.95rem;
		line-height: 1.7;
	}

	/* Final CTA */
	.final-cta {
		padding: 100px 0;
		text-align: center;
		position: relative;
	}

	.final-cta::before {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 600px;
		height: 600px;
		background: radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%);
		pointer-events: none;
	}

	.final-cta h2 {
		font-size: 2.5rem;
		font-weight: 800;
		margin-bottom: 16px;
		position: relative;
		z-index: 1;
	}

	.final-cta p {
		color: var(--text-secondary);
		font-size: 1.2rem;
		margin-bottom: 32px;
		position: relative;
		z-index: 1;
	}

	.final-cta .demo-form {
		position: relative;
		z-index: 1;
	}

	/* Footer */
	footer {
		padding: 40px 0;
		border-top: 1px solid var(--border);
		text-align: center;
	}

	.footer-links {
		display: flex;
		justify-content: center;
		gap: 24px;
		margin-bottom: 16px;
	}

	.footer-links a {
		color: var(--text-muted);
		text-decoration: none;
		font-size: 0.9rem;
		transition: color 0.2s;
	}

	.footer-links a:hover {
		color: var(--text);
	}

	.footer-copy {
		color: var(--text-muted);
		font-size: 0.85rem;
	}

	/* Mobile Responsive */
	@media (max-width: 640px) {
		.hero h1 {
			font-size: 2rem;
		}

		.hero-subtitle {
			font-size: 1.1rem;
		}

		.demo-form {
			flex-direction: column;
		}

		.demo-input,
		.cta-primary {
			width: 100%;
		}

		.demo-details {
			flex-direction: column;
			gap: 4px;
		}

		.demo-details .separator {
			display: none;
		}

		.doc-types {
			gap: 8px;
		}

		.doc-icon {
			padding: 6px 10px;
			font-size: 0.75rem;
		}
	}

	/* Animations */
	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.hero-content > * {
		animation: fadeInUp 0.6s ease-out backwards;
	}

	.hero-content > *:nth-child(1) {
		animation-delay: 0s;
	}
	.hero-content > *:nth-child(2) {
		animation-delay: 0.1s;
	}
	.hero-content > *:nth-child(3) {
		animation-delay: 0.2s;
	}
	.hero-content > *:nth-child(4) {
		animation-delay: 0.3s;
	}
	.hero-content > *:nth-child(5) {
		animation-delay: 0.4s;
	}
	.hero-content > *:nth-child(6) {
		animation-delay: 0.5s;
	}
	.hero-content > *:nth-child(7) {
		animation-delay: 0.6s;
	}
</style>
