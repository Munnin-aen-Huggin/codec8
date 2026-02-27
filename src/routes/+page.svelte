<svelte:head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>Codec8 - AI Documentation Generator</title>
	<meta
		name="description"
		content="Complete README, API docs, architecture diagrams, and setup guides from any GitHub repo. In 60 seconds. Not 6 hours."
	/>

	<!-- Canonical -->
	<link rel="canonical" href="https://codec8.com" />

	<!-- Open Graph -->
	<meta property="og:title" content="Codec8 - AI Documentation Generator" />
	<meta property="og:description" content="Complete README, API docs, architecture diagrams, and setup guides from any GitHub repo. In 60 seconds. Not 6 hours." />
	<meta property="og:url" content="https://codec8.com" />
	<meta property="og:image" content="https://codec8.com/og-image.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Codec8 - AI Documentation Generator" />
	<meta name="twitter:description" content="Complete README, API docs, architecture diagrams, and setup guides from any GitHub repo. In 60 seconds. Not 6 hours." />
	<meta name="twitter:image" content="https://codec8.com/og-image.png" />
	<meta name="twitter:site" content="@code_c8" />

	<!-- JSON-LD: Organization -->
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@type": "Organization",
		"name": "Codec8",
		"url": "https://codec8.com",
		"logo": "https://codec8.com/og-image.png",
		"sameAs": ["https://twitter.com/code_c8"],
		"contactPoint": {
			"@type": "ContactPoint",
			"email": "support@codec8.com",
			"contactType": "customer support"
		}
	})}</script>`}

	<!-- JSON-LD: SoftwareApplication -->
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		"name": "Codec8",
		"applicationCategory": "DeveloperApplication",
		"operatingSystem": "Web",
		"description": "AI-powered documentation generator for GitHub repositories. Generates README, API docs, architecture diagrams, and setup guides in 60 seconds.",
		"offers": [
			{
				"@type": "Offer",
				"price": "0",
				"priceCurrency": "USD",
				"name": "Free Demo"
			},
			{
				"@type": "Offer",
				"price": "99",
				"priceCurrency": "USD",
				"name": "Single Repo"
			},
			{
				"@type": "Offer",
				"price": "149",
				"priceCurrency": "USD",
				"name": "Pro",
				"priceSpecification": {
					"@type": "UnitPriceSpecification",
					"billingDuration": "P1M"
				}
			},
			{
				"@type": "Offer",
				"price": "399",
				"priceCurrency": "USD",
				"name": "Team",
				"priceSpecification": {
					"@type": "UnitPriceSpecification",
					"billingDuration": "P1M"
				}
			}
		]
	})}</script>`}

	<!-- JSON-LD: FAQPage -->
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@type": "FAQPage",
		"mainEntity": [
			{
				"@type": "Question",
				"name": "Why $99?",
				"acceptedAnswer": {
					"@type": "Answer",
					"text": "The average technical writer charges $50-100/hour. Writing proper documentation takes 6-8 hours minimum. That's $400-800 in writer fees, or 8 hours of your own time. Codec8: $99. 60 seconds. Done."
				}
			},
			{
				"@type": "Question",
				"name": "What languages do you support?",
				"acceptedAnswer": {
					"@type": "Answer",
					"text": "JavaScript, TypeScript, Python, Go, Rust, Java, Ruby, PHP, and more. We support all major frameworks including React, Next.js, Express, Django, FastAPI, Rails, and Laravel."
				}
			},
			{
				"@type": "Question",
				"name": "Is my code secure?",
				"acceptedAnswer": {
					"@type": "Answer",
					"text": "Yes. We never store your code after processing. All analysis happens in isolated environments. Your code is transmitted securely and deleted immediately after documentation generation."
				}
			},
			{
				"@type": "Question",
				"name": "Why only README in the free demo?",
				"acceptedAnswer": {
					"@type": "Answer",
					"text": "The free demo lets you experience the quality of our AI-generated documentation without commitment. README is the most essential doc type. Purchase Single Repo or subscribe to Pro/Team for all 4 documentation types."
				}
			},
			{
				"@type": "Question",
				"name": "Can I edit the generated docs?",
				"acceptedAnswer": {
					"@type": "Answer",
					"text": "Absolutely. All generated documentation is editable before export. You can refine, add sections, or modify anything. Paid tiers include a full markdown editor with live preview."
				}
			},
			{
				"@type": "Question",
				"name": "What if I'm not satisfied?",
				"acceptedAnswer": {
					"@type": "Answer",
					"text": "All purchases include a 30-day refund guarantee. If the documentation doesn't meet your expectations, contact us for a full refund. Pro and Team subscriptions can be canceled anytime."
				}
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

<!-- Sticky Header (appears on scroll) -->
<header class="sticky-header" id="stickyHeader">
	<div class="container">
		<div class="logo">Codec8</div>
		<div class="header-actions">
			<a href="/auth/login" class="header-link" rel="external">Sign In</a>
			<a href="#pricing" class="cta-small">View Pricing</a>
		</div>
	</div>
</header>

<!-- Top Navigation -->
<nav class="top-nav">
	<div class="container">
		<div class="logo">Codec8</div>
		<div class="nav-actions">
			<a href="#pricing" class="nav-link">Pricing</a>
			<a href="/auth/login" class="nav-link" rel="external">Sign In</a>
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
				<svg class="trust-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
				</svg>
				Try free, no signup required
			</div>

			<!-- Headline -->
			<h1>
				Documentation that <span>writes itself</span>
			</h1>

			<!-- Subheadline -->
			<p class="hero-subtitle">
				Complete README, API docs, architecture diagrams, and setup guides from any GitHub repo. <strong class="contrast-text">In 60 seconds. Not 6 hours.</strong>
			</p>

			<!-- Doc Type Badges - Free vs Locked -->
			<div class="doc-types">
				<div class="doc-type doc-free">
					<svg class="doc-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
						<path d="M5 13l4 4L19 7"/>
					</svg>
					<span class="doc-label">README</span>
					<span class="doc-status free">free</span>
				</div>
				<div class="doc-type doc-locked">
					<svg class="doc-lock" viewBox="0 0 24 24" fill="currentColor">
						<path d="M12 1a5 5 0 00-5 5v4H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V12a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zm3 9H9V6a3 3 0 116 0v4z"/>
					</svg>
					<span class="doc-label">API Docs</span>
				</div>
				<div class="doc-type doc-locked">
					<svg class="doc-lock" viewBox="0 0 24 24" fill="currentColor">
						<path d="M12 1a5 5 0 00-5 5v4H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V12a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zm3 9H9V6a3 3 0 116 0v4z"/>
					</svg>
					<span class="doc-label">Architecture</span>
				</div>
				<div class="doc-type doc-locked">
					<svg class="doc-lock" viewBox="0 0 24 24" fill="currentColor">
						<path d="M12 1a5 5 0 00-5 5v4H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V12a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zm3 9H9V6a3 3 0 116 0v4z"/>
					</svg>
					<span class="doc-label">Setup Guide</span>
				</div>
			</div>

			<!-- Demo Input Box -->
			<form class="demo-form" on:submit={handleDemoSubmit}>
				<div class="input-wrapper">
					<svg class="input-icon" viewBox="0 0 24 24" fill="currentColor">
						<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
					</svg>
					<input
						type="text"
						placeholder="https://github.com/owner/repo"
						bind:value={repoUrl}
						bind:this={demoInput}
						on:focus={handleDemoFocus}
						class="demo-input"
						aria-label="GitHub repository URL"
					/>
				</div>
				<button type="submit" class="cta-primary">
					<svg class="cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M13 10V3L4 14h7v7l9-11h-7z"/>
					</svg>
					Generate
				</button>
			</form>
			{#if urlError}
				<div class="error-message">{urlError}</div>
			{/if}

			<!-- Demo Details - Updated microcopy -->
			<div class="demo-details">
				<span>1 free demo</span>
				<span class="separator">•</span>
				<span>README preview</span>
				<span class="separator">•</span>
				<span>No signup</span>
			</div>

			<!-- Live Counter -->
			{#if docsGenerated > 0}
				<div class="docs-counter">
					<strong>{docsGenerated.toLocaleString()}</strong> docs generated and counting
				</div>
			{/if}

			<!-- UTM-Aware Messaging -->
			{#if utmSource === 'reddit'}
				<div class="utm-message">Fellow Redditor? Try the demo first, no signup needed.</div>
			{:else if utmSource === 'hackernews'}
				<div class="utm-message">Welcome from HN — try the demo first, no signup needed.</div>
			{/if}
		</div>
	</div>
</section>

<!-- Video Demo Section -->
<section class="video-section">
	<div class="container">
		<VideoDemo />
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
					<li class="included">1 demo only</li>
					<li class="locked">No export</li>
				</ul>
			</div>
			<div class="comparison-card paid">
				<h3>SINGLE REPO - $99 once</h3>
				<ul>
					<li class="included">All 4 documentation types</li>
					<li class="included">Private repos</li>
					<li class="included">Keep forever</li>
					<li class="included">Export & PR creation</li>
					<li class="included">Regenerate: $19</li>
				</ul>
			</div>
		</div>
	</div>
</section>

<!-- Product Preview Section -->
<ProductPreview />

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
				<p>Our AI analyzes your code and creates documentation.</p>
			</div>
			<div class="step">
				<div class="step-number">3</div>
				<h3>Export or sync</h3>
				<p>Download as markdown or create a pull request directly.</p>
			</div>
		</div>
	</div>
</section>

<!-- Value Comparison Section -->
<div bind:this={valueSection}>
	<ValueComparison />
</div>

<!-- Pricing Section -->
<section class="pricing-section" id="pricing" bind:this={pricingSection}>
	<div class="container">
		<div class="section-header">
			<h2>Simple Pricing</h2>
			<p>One repo? Pay once. Multiple repos? Subscribe.</p>
		</div>

		<div class="pricing-grid">
			<!-- Free Demo -->
			<div class="pricing-card">
				<div class="pricing-icon free-icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
					</svg>
				</div>
				<h3>FREE DEMO</h3>
				<div class="price">
					<span class="amount">$0</span>
				</div>
				<ul class="features">
					<li>README only</li>
					<li>One-time only</li>
					<li>Public repos</li>
					<li>No signup</li>
				</ul>
				<button class="pricing-cta" on:click={scrollToHero}>Try Demo</button>
			</div>

			<!-- Single Repo - POPULAR -->
			<div class="pricing-card featured">
				<div class="featured-badge">MOST POPULAR</div>
				<div class="pricing-icon featured-icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
					</svg>
				</div>
				<h3>SINGLE REPO</h3>
				<div class="price">
					<span class="amount">$99</span>
					<span class="period">one-time</span>
				</div>
				<ul class="features">
					<li>All 4 doc types</li>
					<li>Private repos</li>
					<li>Export & PRs</li>
					<li>Keep forever</li>
					<li>Regenerate: $19</li>
				</ul>
				<a href="/auth/login?intent=purchase&product=single" class="pricing-cta primary" rel="external">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px">
						<path d="M13 10V3L4 14h7v7l9-11h-7z"/>
					</svg>
					Get Docs — $99
				</a>
				<p class="refund-note">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px">
						<path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
					</svg>
					30-day refund guarantee
				</p>
			</div>

			<!-- Pro -->
			<div class="pricing-card">
				<div class="pricing-icon pro-icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M13 10V3L4 14h7v7l9-11h-7z"/>
					</svg>
				</div>
				<h3>PRO</h3>
				<div class="price">
					<span class="amount">$149</span>
					<span class="period">/mo</span>
				</div>
				<ul class="features">
					<li>30 repos/month</li>
					<li>All features</li>
					<li>Auto-sync on push</li>
					<li>Priority support</li>
					<li>Cancel anytime</li>
				</ul>
				<a href="/auth/login?intent=purchase&tier=pro" class="pricing-cta" rel="external">Subscribe Now</a>
			</div>

			<!-- Team -->
			<div class="pricing-card">
				<div class="pricing-icon team-icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
					</svg>
				</div>
				<h3>TEAM</h3>
				<div class="price">
					<span class="amount">$399</span>
					<span class="period">/mo</span>
				</div>
				<ul class="features">
					<li>100 repos/month</li>
					<li>5 team members</li>
					<li>Custom templates</li>
					<li>Slack integration</li>
					<li>Cancel anytime</li>
				</ul>
				<a href="/auth/login?intent=purchase&tier=team" class="pricing-cta" rel="external">Subscribe Now</a>
			</div>
		</div>

		<PaymentBadges />

		<!-- Inline Email Capture -->
		<div class="notify-section">
			{#if notifySubmitted}
				<p class="notify-success">You're on the list! We'll email you when deals drop.</p>
			{:else}
				<p class="notify-text">Not ready to buy? Get notified when we run deals.</p>
				<form class="notify-form" on:submit|preventDefault={submitNotifyEmail}>
					<input
						type="email"
						placeholder="your@email.com"
						bind:value={notifyEmail}
						class="notify-input"
						disabled={notifySubmitting}
					/>
					<button type="submit" class="notify-btn" disabled={notifySubmitting || !notifyEmail.trim()}>
						{notifySubmitting ? 'Sending...' : 'Notify Me'}
					</button>
				</form>
			{/if}
		</div>
	</div>
</section>

<!-- Bulk Purchase Section -->
<section class="bulk-purchase">
	<div class="container">
		<div class="bulk-content">
			<h3>Need multiple repos?</h3>
			<div class="bulk-options">
				<div class="bulk-option">
					<span class="bulk-deal">Buy 5 repos, get 1 free</span>
					<span class="bulk-price">$495</span>
					<span class="bulk-savings">(save $99)</span>
				</div>
				<div class="bulk-option">
					<span class="bulk-deal">Buy 10 repos, get 3 free</span>
					<span class="bulk-price">$990</span>
					<span class="bulk-savings">(save $297)</span>
				</div>
			</div>
			<a href="/auth/login?intent=purchase&product=bulk5" class="bulk-cta" rel="external">
				Unlock 5 Repos — $495
			</a>
		</div>
	</div>
</section>

<!-- Social Proof Section -->
<SocialProof />

<!-- Enterprise Section -->
<EnterpriseSection />

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
				on:focus={handleDemoFocus}
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
			<a href="mailto:support@codec8.com">Contact</a>
		</div>
		<p class="footer-copy">2026 Codec8</p>
	</div>
</footer>

<!-- Urgency Banner - Sticky at bottom -->
<UrgencyBanner />

<!-- Exit Intent Popup -->
<ExitIntent />

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import UrgencyBanner from '$lib/components/UrgencyBanner.svelte';
	import SocialProof from '$lib/components/SocialProof.svelte';
	import ValueComparison from '$lib/components/ValueComparison.svelte';
	import EnterpriseSection from '$lib/components/EnterpriseSection.svelte';
	import ExitIntent from '$lib/components/ExitIntent.svelte';
	import VideoDemo from '$lib/components/VideoDemo.svelte';
	import ProductPreview from '$lib/components/ProductPreview.svelte';
	import PaymentBadges from '$lib/components/PaymentBadges.svelte';
	import { trackPageView, trackOnVisible, trackClientEvent } from '$lib/stores/analytics';

	let repoUrl = '';
	let urlError = '';
	let openFaq: number | null = null;
	let demoInput: HTMLInputElement;
	let pricingSection: HTMLElement;
	let valueSection: HTMLElement;
	let cleanupFns: (() => void)[] = [];
	let docsGenerated = 0;
	let utmSource = '';
	let notifyEmail = '';
	let notifySubmitting = false;
	let notifySubmitted = false;

	const faqs = [
		{
			question: 'Why $99?',
			answer: 'The average technical writer charges $50-100/hour. Writing proper documentation takes 6-8 hours minimum. That\'s $400-800 in writer fees, or 8 hours of your own time. Codec8: $99. 60 seconds. Done.'
		},
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
			answer: 'All purchases include a 30-day refund guarantee. If the documentation doesn\'t meet your expectations, contact us for a full refund. Pro and Team subscriptions can be canceled anytime.'
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

	async function submitNotifyEmail() {
		if (!notifyEmail.trim()) return;
		notifySubmitting = true;
		try {
			const response = await fetch('/api/leads', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: notifyEmail.trim(), source: 'pricing_section' })
			});
			if (response.ok) {
				notifySubmitted = true;
			}
		} catch {
			// Silently fail
		} finally {
			notifySubmitting = false;
		}
	}

	onMount(() => {
		// Fetch docs generated count
		fetch('/api/stats')
			.then(r => r.json())
			.then(data => { docsGenerated = data.docsGenerated || 0; })
			.catch(() => {});

		// Detect UTM source
		const url = new URL(window.location.href);
		utmSource = url.searchParams.get('utm_source') || '';

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

		// Auto-focus demo input on desktop only (not mobile - would open keyboard)
		if (browser && window.innerWidth > 768 && demoInput) {
			// Small delay to ensure page is fully loaded
			setTimeout(() => {
				demoInput?.focus();
			}, 500);
		}

		// Analytics: Track page view
		trackPageView();

		// Analytics: Track section views
		cleanupFns.push(trackOnVisible(pricingSection, 'pricing_viewed'));
		cleanupFns.push(trackOnVisible(valueSection, 'upsell_viewed'));

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});

	onDestroy(() => {
		cleanupFns.forEach((fn) => fn());
	});

	// Track demo input focus
	function handleDemoFocus() {
		trackClientEvent('demo_input_focused');
	}
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
		background: none;
		border: none;
		cursor: pointer;
		font-family: inherit;
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
		background: none;
		border: none;
		cursor: pointer;
		font-family: inherit;
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
		top: -30%;
		left: 50%;
		transform: translateX(-50%);
		width: 1000px;
		height: 1000px;
		background: radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(16, 185, 129, 0.04) 40%, transparent 70%);
		pointer-events: none;
		animation: pulse-bg 8s ease-in-out infinite;
	}

	.hero::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 200px;
		background: linear-gradient(to top, var(--bg) 0%, transparent 100%);
		pointer-events: none;
	}

	@keyframes pulse-bg {
		0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
		50% { opacity: 0.7; transform: translateX(-50%) scale(1.1); }
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
		padding: 10px 20px;
		border-radius: 100px;
		font-size: 0.9rem;
		font-weight: 600;
		margin-bottom: 28px;
		animation: float 3s ease-in-out infinite;
	}

	.trust-icon {
		width: 16px;
		height: 16px;
		animation: sparkle 2s ease-in-out infinite;
	}

	@keyframes sparkle {
		0%, 100% { opacity: 1; transform: scale(1); }
		50% { opacity: 0.6; transform: scale(0.9); }
	}

	@keyframes float {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-4px); }
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

	/* Contrast text for subhead */
	.contrast-text {
		color: var(--accent);
		font-weight: 700;
	}

	/* Doc Types - Free vs Locked */
	.doc-types {
		display: flex;
		justify-content: center;
		gap: 12px;
		margin-bottom: 32px;
		flex-wrap: wrap;
	}

	.doc-type {
		display: flex;
		align-items: center;
		gap: 6px;
		background: var(--bg-elevated);
		border: 1px solid var(--border);
		padding: 8px 14px;
		border-radius: 100px;
		font-size: 0.85rem;
		transition: all 0.2s;
	}

	.doc-type:hover {
		transform: translateY(-2px);
		border-color: var(--text-muted);
	}

	.doc-type.doc-free {
		border-color: var(--accent);
		background: rgba(16, 185, 129, 0.1);
	}

	.doc-type.doc-free:hover {
		border-color: var(--accent);
		box-shadow: 0 4px 12px var(--accent-glow);
	}

	.doc-type.doc-locked {
		opacity: 0.7;
	}

	.doc-type.doc-locked:hover {
		opacity: 1;
	}

	.doc-check {
		width: 14px;
		height: 14px;
		color: var(--accent);
	}

	.doc-lock {
		width: 12px;
		height: 12px;
		color: var(--text-muted);
	}

	.doc-label {
		color: var(--text-secondary);
		font-weight: 500;
	}

	.doc-type.doc-free .doc-label {
		color: var(--accent);
	}

	.doc-status {
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.doc-status.free {
		color: var(--accent);
	}

	/* Demo Form */
	.demo-form {
		display: flex;
		gap: 12px;
		max-width: 600px;
		margin: 0 auto 16px;
	}

	.input-wrapper {
		flex: 1;
		position: relative;
	}

	.input-icon {
		position: absolute;
		left: 16px;
		top: 50%;
		transform: translateY(-50%);
		width: 20px;
		height: 20px;
		color: var(--text-muted);
		pointer-events: none;
		transition: color 0.2s;
	}

	.input-wrapper:focus-within .input-icon {
		color: var(--accent);
	}

	.demo-input {
		width: 100%;
		padding: 16px 20px 16px 48px;
		border: 2px solid var(--border);
		border-radius: 12px;
		background: var(--bg-elevated);
		color: var(--text);
		font-size: 1rem;
		outline: none;
		transition: all 0.3s;
	}

	.demo-input:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 4px var(--accent-glow), 0 8px 32px rgba(16, 185, 129, 0.15);
		background: var(--bg);
	}

	.demo-input::placeholder {
		color: var(--text-muted);
	}

	.cta-primary {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background: linear-gradient(135deg, var(--accent) 0%, #059669 100%);
		color: #000;
		padding: 16px 32px;
		border: none;
		border-radius: 12px;
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.3s;
		white-space: nowrap;
		box-shadow: 0 4px 20px var(--accent-glow);
	}

	.cta-icon {
		width: 18px;
		height: 18px;
	}

	.cta-primary:hover {
		background: linear-gradient(135deg, #059669 0%, #047857 100%);
		transform: translateY(-3px);
		box-shadow: 0 12px 40px var(--accent-glow);
	}

	.cta-primary:active {
		transform: translateY(-1px);
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

	/* Live Counter */
	.docs-counter {
		text-align: center;
		margin-top: 16px;
		font-size: 0.9rem;
		color: var(--text-secondary);
	}

	.docs-counter strong {
		color: var(--accent);
		font-size: 1.1rem;
	}

	/* UTM Message */
	.utm-message {
		text-align: center;
		margin-top: 12px;
		font-size: 0.9rem;
		color: var(--accent);
		background: rgba(16, 185, 129, 0.08);
		border: 1px solid rgba(16, 185, 129, 0.2);
		border-radius: 8px;
		padding: 8px 16px;
		display: inline-block;
	}

	/* Inline Email Capture */
	.notify-section {
		text-align: center;
		margin-top: 40px;
		padding: 24px;
		background: var(--bg-elevated);
		border: 1px solid var(--border);
		border-radius: 12px;
	}

	.notify-text {
		color: var(--text-secondary);
		margin-bottom: 12px;
		font-size: 0.95rem;
	}

	.notify-form {
		display: flex;
		gap: 8px;
		justify-content: center;
		max-width: 400px;
		margin: 0 auto;
	}

	.notify-input {
		flex: 1;
		padding: 10px 16px;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 8px;
		color: var(--text);
		font-size: 0.9rem;
		outline: none;
		transition: border-color 0.2s;
	}

	.notify-input:focus {
		border-color: var(--accent);
	}

	.notify-input::placeholder {
		color: var(--text-muted);
	}

	.notify-btn {
		padding: 10px 20px;
		background: var(--accent);
		color: #000;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
	}

	.notify-btn:hover:not(:disabled) {
		background: var(--accent-hover);
	}

	.notify-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.notify-success {
		color: var(--accent);
		font-weight: 500;
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

	/* Video Section */
	.video-section {
		padding: 60px 0;
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
		border-radius: 20px;
		padding: 32px 24px;
		text-align: center;
		position: relative;
		transition: all 0.3s;
	}

	.pricing-card:hover {
		transform: translateY(-4px);
		border-color: var(--text-muted);
	}

	.pricing-card.featured {
		border: 2px solid var(--accent);
		transform: scale(1.05);
		box-shadow: 0 0 50px var(--accent-glow);
		z-index: 1;
		background: linear-gradient(180deg, rgba(16, 185, 129, 0.05) 0%, var(--bg-elevated) 100%);
	}

	.pricing-card.featured:hover {
		transform: scale(1.05) translateY(-4px);
		box-shadow: 0 0 70px var(--accent-glow);
	}

	.pricing-icon {
		width: 48px;
		height: 48px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 16px;
	}

	.pricing-icon svg {
		width: 24px;
		height: 24px;
	}

	.pricing-icon.free-icon {
		background: rgba(100, 116, 139, 0.2);
		color: #94a3b8;
	}

	.pricing-icon.featured-icon {
		background: rgba(16, 185, 129, 0.2);
		color: var(--accent);
		animation: pulse-icon 2s ease-in-out infinite;
	}

	.pricing-icon.pro-icon {
		background: rgba(59, 130, 246, 0.2);
		color: #3b82f6;
	}

	.pricing-icon.team-icon {
		background: rgba(139, 92, 246, 0.2);
		color: #8b5cf6;
	}

	@keyframes pulse-icon {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.05); }
	}

	.refund-note {
		margin-top: 16px;
		font-size: 0.85rem;
		color: var(--text-muted);
		display: inline-flex;
		align-items: center;
		gap: 6px;
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

	/* Bulk Purchase Section */
	.bulk-purchase {
		padding: 40px 0;
		background: linear-gradient(180deg, transparent 0%, var(--bg-elevated) 50%, transparent 100%);
	}

	.bulk-content {
		text-align: center;
		max-width: 600px;
		margin: 0 auto;
	}

	.bulk-content h3 {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 24px;
		color: var(--text);
	}

	.bulk-options {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-bottom: 24px;
	}

	.bulk-option {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		flex-wrap: wrap;
	}

	.bulk-deal {
		color: var(--text-secondary);
	}

	.bulk-price {
		font-weight: 700;
		color: var(--accent);
	}

	.bulk-savings {
		color: var(--text-muted);
		font-size: 0.9rem;
	}

	.bulk-cta {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background: var(--bg-elevated);
		color: var(--text);
		padding: 14px 28px;
		border: 1px solid var(--accent);
		border-radius: 10px;
		font-size: 1rem;
		font-weight: 600;
		text-decoration: none;
		transition: all 0.2s;
	}

	.bulk-cta:hover {
		background: var(--accent);
		color: #000;
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
			line-height: 1.2;
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
			min-height: 48px; /* 44px minimum touch target */
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
			flex-wrap: wrap;
			justify-content: center;
		}

		.doc-type {
			min-height: 44px; /* Touch target */
		}

		.doc-icon {
			padding: 6px 10px;
			font-size: 0.75rem;
		}

		/* Pricing adjustments for mobile */
		.pricing-card.featured {
			transform: none; /* Remove scale on mobile */
		}

		.pricing-card button,
		.pricing-card a {
			min-height: 48px; /* Touch target */
			padding: 14px 20px;
		}

		/* Bulk purchase mobile */
		.bulk-option {
			flex-direction: column;
			gap: 4px;
		}

		/* FAQ touch targets */
		.faq-question {
			min-height: 48px;
			padding: 16px 0;
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
// Build trigger: 1768418407

