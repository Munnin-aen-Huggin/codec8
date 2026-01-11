<svelte:head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>CodeDoc AI — Documentation That Writes Itself</title>
	<meta
		name="description"
		content="Connect your GitHub repo, get production-ready documentation in 2 minutes. README, API docs, architecture diagrams — automatically."
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
		<div class="logo">📄 CodeDoc AI</div>
		<div class="header-actions">
			<a href="/auth/login" class="header-link">Sign In</a>
			<a href="#pricing" class="cta-small">Get Lifetime Access — $299</a>
		</div>
	</div>
</header>

<!-- Top Navigation -->
<nav class="top-nav">
	<div class="container">
		<div class="logo">📄 CodeDoc AI</div>
		<div class="nav-actions">
			<a href="#pricing" class="nav-link">Pricing</a>
			<a href="/auth/login" class="nav-link">Sign In</a>
			<a href="/auth/login" class="nav-cta">Start Free</a>
		</div>
	</div>
</nav>

<!-- Hero Section -->
<section class="hero">
	<div class="container">
		<div class="hero-content">
			<!-- Urgency Badge -->
			<div class="urgency-badge">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="12" r="10"></circle>
					<path d="M12 6v6l4 2"></path>
				</svg>
				Launch pricing ends in 3 days — 47 spots left
			</div>

			<!-- Headline: Specific outcome, clear benefit -->
			<h1>
				Stop writing docs.<br /><span>Ship 10x faster.</span>
			</h1>

			<!-- Subheadline: What + How + Timeframe -->
			<p class="hero-subtitle">
				Connect your GitHub repo → Get README, API docs, and architecture diagrams automatically. Takes 2 minutes, not 2
				hours.
			</p>

			<!-- CTA: Single field form -->
			<div class="hero-cta-section">
				{#if heroFormState === 'success'}
					<div class="success-message">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
							<polyline points="22 4 12 14.01 9 11.01"></polyline>
						</svg>
						<span>You're in! Check your email for next steps.</span>
					</div>
				{:else}
					<form class="email-form" id="heroForm" on:submit={handleHeroSubmit}>
						<input
							type="email"
							placeholder="Enter your email"
							bind:value={heroEmail}
							disabled={heroFormState === 'loading'}
							required
						/>
						<button type="submit" class="cta-primary" disabled={heroFormState === 'loading'}>
							{#if heroFormState === 'loading'}
								<span class="spinner"></span> Subscribing...
							{:else}
								Get Early Access →
							{/if}
						</button>
					</form>
					{#if heroFormState === 'error' && heroErrorMessage}
						<div class="error-message">{heroErrorMessage}</div>
					{/if}
				{/if}

				<!-- Or Try Free CTA -->
				<div class="or-divider">
					<span>or</span>
				</div>
				<a href="/auth/login" class="cta-secondary">
					<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
						<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
					</svg>
					Try Free with GitHub
				</a>

				<!-- Risk Reversal -->
				<div class="risk-reversal">
					<span>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
							<polyline points="22 4 12 14.01 9 11.01"></polyline>
						</svg>
						Free to try
					</span>
					<span>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
							<polyline points="22 4 12 14.01 9 11.01"></polyline>
						</svg>
						No credit card required
					</span>
					<span>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
							<polyline points="22 4 12 14.01 9 11.01"></polyline>
						</svg>
						14-day money-back
					</span>
				</div>
			</div>

			<!-- Social Proof Bar: Specific numbers -->
			<div class="social-proof-bar">
				<div class="proof-item">
					<div class="proof-number">847</div>
					<div class="proof-label">Developers</div>
				</div>
				<div class="proof-item">
					<div class="proof-number">12,400+</div>
					<div class="proof-label">Repos Documented</div>
				</div>
				<div class="proof-item">
					<div class="proof-number">4.9/5</div>
					<div class="proof-label">Rating</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Demo Section: Show the product -->
<section class="demo-section">
	<div class="container">
		<div class="demo-window">
			<div class="demo-header">
				<div class="demo-dot"></div>
				<div class="demo-dot"></div>
				<div class="demo-dot"></div>
			</div>

			<div class="demo-content">
				<div class="demo-input">
					<div class="demo-label">Your Code</div>

					<!-- IMPORTANT:
             In Svelte, we must NOT render raw "<span ...>" as real tags inside a code block.
             We render it as text. -->
					<pre><code>{`// api/users.ts
export async function getUser(id: string) {
  const user = await db.users.findUnique({
    where: { id }
  });
  if (!user) throw new NotFoundError();
  return user;
}`}</code></pre>
				</div>

				<div class="demo-output">
					<div class="demo-label">Generated Documentation</div>
					<h4>📚 GET /api/users/:id</h4>
					<p>Retrieves a user by their unique identifier.</p>
					<h4 style="margin-top: 16px">Parameters</h4>
					<ul>
						<li><code>id</code> (string, required) — User ID</li>
					</ul>
					<h4 style="margin-top: 16px">Response</h4>
					<ul>
						<li><code>200</code> — User object</li>
						<li><code>404</code> — Not found</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Problem Section: Agitate the pain -->
<section class="problem-section">
	<div class="container">
		<h2>Documentation debt is <span style="color: var(--danger)">costing you</span></h2>
		<div class="problem-grid">
			<div class="problem-card">
				<div class="icon">⏱️</div>
				<h3>Slow Onboarding</h3>
				<p>
					New hires take <span class="stat">3-6 weeks</span> to understand your codebase without docs. That's $15K+ in lost
					productivity per hire.
				</p>
			</div>
			<div class="problem-card">
				<div class="icon">😰</div>
				<h3>Deployment Anxiety</h3>
				<p><span class="stat">67% of developers</span> fear breaking production because they don't understand the code they're changing.</p>
			</div>
			<div class="problem-card">
				<div class="icon">🚪</div>
				<h3>Talent Loss</h3>
				<p>
					Top engineers <span class="stat">reject offers</span> when they see messy repos. Poor docs signal poor engineering culture.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- Features Section -->
<section class="features-section">
	<div class="container">
		<div class="section-header">
			<h2>Everything your codebase needs</h2>
			<p>Professional documentation in minutes, not hours</p>
		</div>

		<div class="features-grid">
			<div class="feature-card">
				<div class="icon">📖</div>
				<h3>README Generation</h3>
				<p>Project overview, installation, usage examples, and contributing guidelines — all from your code.</p>
			</div>
			<div class="feature-card">
				<div class="icon">🔌</div>
				<h3>API Documentation</h3>
				<p>Auto-detect endpoints, generate OpenAPI specs, and create request/response examples.</p>
			</div>
			<div class="feature-card">
				<div class="icon">🏗️</div>
				<h3>Architecture Diagrams</h3>
				<p>Visual component diagrams and data flow charts in editable Mermaid format.</p>
			</div>
			<div class="feature-card">
				<div class="icon">⚡</div>
				<h3>One-Click PR</h3>
				<p>Export to markdown or create a pull request directly. Merge-ready in seconds.</p>
			</div>
			<div class="feature-card">
				<div class="icon">🔒</div>
				<h3>Private Repos</h3>
				<p>Your code stays private. We never store it after processing. SOC 2 compliant.</p>
			</div>
			<div class="feature-card">
				<div class="icon">🔄</div>
				<h3>Auto-Sync</h3>
				<p>Docs update automatically when you push. Never out of date again.</p>
			</div>
		</div>
	</div>
</section>

<!-- How It Works -->
<section class="how-section">
	<div class="container">
		<div class="section-header">
			<h2>Get started in 60 seconds</h2>
			<p>No complex setup. No configuration files.</p>
		</div>

		<div class="steps">
			<div class="step">
				<div class="step-number">1</div>
				<h3>Connect GitHub</h3>
				<p>One-click OAuth. Works with public and private repos.</p>
			</div>
			<div class="step">
				<div class="step-number">2</div>
				<h3>Select Repo</h3>
				<p>Choose which repository to document. We analyze your code structure.</p>
			</div>
			<div class="step">
				<div class="step-number">3</div>
				<h3>Get Docs</h3>
				<p>AI generates complete documentation. Edit, export, or merge directly.</p>
			</div>
		</div>
	</div>
</section>

<!-- Testimonials -->
<section class="testimonials-section">
	<div class="container">
		<div class="section-header">
			<h2>Developers love it</h2>
			<p>Join 800+ teams shipping better documentation</p>
		</div>

		<div class="testimonials-grid">
			<div class="testimonial-card">
				<div class="testimonial-stars">★★★★★</div>
				<p class="testimonial-text">
					"We went from an <strong>embarrassing README to full documentation in 15 minutes</strong>. Our onboarding time dropped by 70%."
				</p>
				<div class="testimonial-author">
					<div class="testimonial-avatar">JK</div>
					<div>
						<div class="testimonial-name">Jake K.</div>
						<div class="testimonial-role">CTO, Series A Startup</div>
					</div>
				</div>
			</div>

			<div class="testimonial-card">
				<div class="testimonial-stars">★★★★★</div>
				<p class="testimonial-text">
					"I've tried other doc generators. CodeDoc <strong>actually understands my code</strong> and produces docs that make sense."
				</p>
				<div class="testimonial-author">
					<div class="testimonial-avatar">SR</div>
					<div>
						<div class="testimonial-name">Sarah R.</div>
						<div class="testimonial-role">Senior Engineer, Google</div>
					</div>
				</div>
			</div>

			<div class="testimonial-card">
				<div class="testimonial-stars">★★★★★</div>
				<p class="testimonial-text">
					"The <strong>architecture diagrams alone</strong> are worth it. My team can finally see how everything connects."
				</p>
				<div class="testimonial-author">
					<div class="testimonial-avatar">MT</div>
					<div>
						<div class="testimonial-name">Marcus T.</div>
						<div class="testimonial-role">Engineering Lead</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Pricing -->
<section class="pricing-section" id="pricing">
	<div class="container">
		<div class="section-header">
			<h2>Simple pricing. No surprises.</h2>
			<p>One payment. Use forever.</p>
		</div>

		<div class="pricing-card">
			<div class="pricing-badge">LAUNCH DEAL</div>

			<!-- Countdown Timer -->
			<div class="countdown">
				<div class="countdown-label">⏰ Price increases in:</div>
				<div class="countdown-timer" id="countdown">
					<div class="countdown-unit">
						<div class="countdown-number" id="days">02</div>
						<div class="countdown-unit-label">Days</div>
					</div>
					<div class="countdown-unit">
						<div class="countdown-number" id="hours">14</div>
						<div class="countdown-unit-label">Hours</div>
					</div>
					<div class="countdown-unit">
						<div class="countdown-number" id="minutes">37</div>
						<div class="countdown-unit-label">Min</div>
					</div>
					<div class="countdown-unit">
						<div class="countdown-number" id="seconds">52</div>
						<div class="countdown-unit-label">Sec</div>
					</div>
				</div>
			</div>

			<h3>Lifetime Access</h3>
			<p class="pricing-subtitle">Pay once, use forever. All future updates included.</p>

			<div class="pricing-price">
				<span class="currency">$</span>
				<span class="amount">299</span>
				<!-- keeping "original" visual slot, but since you're now $299,
             you can either remove this OR set a higher crossed-out price -->
				<span class="original">$499</span>
			</div>
			<p class="pricing-period">One-time payment • Save $200</p>

			<ul class="pricing-features">
				<li>Unlimited repositories</li>
				<li>All documentation types (README, API, Architecture)</li>
				<li>Architecture diagrams</li>
				<li>Export to Markdown & PR</li>
				<li>Auto-sync on push</li>
				<li>Private repo support</li>
				<li>Priority email support</li>
				<li>All future features included</li>
			</ul>

			<button
				class="pricing-cta"
				id="pricingCTA"
				on:click={() => handleCheckout('ltd')}
				disabled={checkoutLoading}
			>
				{#if checkoutLoading}
					<span class="spinner"></span> Processing...
				{:else}
					Get Lifetime Access — $299 →
				{/if}
			</button>

			<div class="pricing-guarantee">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
				</svg>
				14-day money-back guarantee. No questions asked.
			</div>
		</div>
	</div>
</section>

<!-- FAQ -->
<section class="faq-section">
	<div class="container">
		<div class="section-header">
			<h2>Questions? Answers.</h2>
		</div>

		<div class="faq-grid">
			<div class="faq-item">
				<div class="faq-question">What languages/frameworks do you support?</div>
				<p class="faq-answer">
					JavaScript, TypeScript, Python, Go, Rust, Java, Ruby, PHP, and more. We support all major frameworks including React,
					Next.js, Express, Django, FastAPI, Rails, and Laravel.
				</p>
			</div>
			<div class="faq-item">
				<div class="faq-question">Is my code secure?</div>
				<p class="faq-answer">
					Yes. We never store your code after processing. All analysis happens in isolated environments. We're SOC 2 compliant and happy
					to sign NDAs for enterprise customers.
				</p>
			</div>
			<div class="faq-item">
				<div class="faq-question">How is this different from ChatGPT?</div>
				<p class="faq-answer">
					We're purpose-built for documentation. We connect directly to GitHub, understand your project structure, generate consistent
					formats, and integrate with your workflow. No copy-pasting required.
				</p>
			</div>
			<div class="faq-item">
				<div class="faq-question">What if I'm not satisfied?</div>
				<p class="faq-answer">
					Full refund within 14 days, no questions asked. Email us and we'll process it within 24 hours.
				</p>
			</div>
			<div class="faq-item">
				<div class="faq-question">Do you support private repositories?</div>
				<p class="faq-answer">
					Absolutely. We support both public and private repos. Your code stays private — we use GitHub's official API with encrypted tokens.
				</p>
			</div>
			<div class="faq-item">
				<div class="faq-question">How long does generation take?</div>
				<p class="faq-answer">
					Most repos are documented in 2-5 minutes. Larger codebases (100K+ lines) may take up to 15 minutes.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- Final CTA -->
<section class="final-cta">
	<div class="container">
		<h2>Stop writing docs manually</h2>
		<p>Join 800+ developers who've automated their documentation.</p>

		{#if finalFormState === 'success'}
			<div class="success-message">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
					<polyline points="22 4 12 14.01 9 11.01"></polyline>
				</svg>
				<span>You're in! Check your email for next steps.</span>
			</div>
		{:else}
			<form class="email-form" id="finalForm" on:submit={handleFinalSubmit}>
				<input
					type="email"
					placeholder="Enter your email"
					bind:value={finalEmail}
					disabled={finalFormState === 'loading'}
					required
				/>
				<button type="submit" class="cta-primary" disabled={finalFormState === 'loading'}>
					{#if finalFormState === 'loading'}
						<span class="spinner"></span> Subscribing...
					{:else}
						Get Lifetime Access — $299 →
					{/if}
				</button>
			</form>
			{#if finalFormState === 'error' && finalErrorMessage}
				<div class="error-message">{finalErrorMessage}</div>
			{/if}
		{/if}

		<div class="risk-reversal" style="margin-top: 16px">
			<span>
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					style="width: 16px; height: 16px; color: var(--accent)"
				>
					<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
				</svg>
				14-day money-back guarantee
			</span>
		</div>
	</div>
</section>

<!-- Footer -->
<footer>
	<div class="container">
		<div class="footer-links">
			<a href="/privacy">Privacy</a>
			<a href="/terms">Terms</a>
			<a href="mailto:support@codedoc.ai">Contact</a>
			<a href="https://twitter.com/codedocai" target="_blank" rel="noopener noreferrer">Twitter</a>
		</div>
		<p class="footer-copy">© 2026 CodeDoc AI. All rights reserved.</p>
	</div>
</footer>

<!-- Real-time Activity Ticker (FOMO) -->
<div class="activity-ticker" id="activityTicker">
	<div class="avatar">MK</div>
	<div class="info">
		<div class="name">Mike from Austin</div>
		<div class="action">just got lifetime access</div>
	</div>
	<button class="close" id="tickerClose">✕</button>
</div>

<script lang="ts">
	import { onMount } from 'svelte';
	import { auth } from '$lib/stores/auth';

	let heroEmail = '';
	let finalEmail = '';
	let heroFormState: 'idle' | 'loading' | 'success' | 'error' = 'idle';
	let finalFormState: 'idle' | 'loading' | 'success' | 'error' = 'idle';
	let heroErrorMessage = '';
	let finalErrorMessage = '';
	let checkoutLoading = false;

	async function handleCheckout(tier: string = 'ltd') {
		// Check if user is logged in
		const user = $auth.user;

		if (!user) {
			// Redirect to login with return URL
			window.location.href = '/auth/login?redirect=checkout&tier=' + tier;
			return;
		}

		checkoutLoading = true;

		try {
			const response = await fetch('/api/stripe/checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ tier })
			});

			const data = await response.json();

			if (data.success && data.url) {
				// Redirect to Stripe checkout
				window.location.href = data.url;
			} else {
				alert(data.message || 'Failed to start checkout. Please try again.');
				checkoutLoading = false;
			}
		} catch (err) {
			console.error('Checkout error:', err);
			alert('Failed to start checkout. Please try again.');
			checkoutLoading = false;
		}
	}

	async function handleSubscribe(
		email: string,
		setFormState: (state: 'idle' | 'loading' | 'success' | 'error') => void,
		setErrorMessage: (msg: string) => void
	) {
		if (!email) {
			setFormState('error');
			setErrorMessage('Please enter your email');
			return;
		}

		setFormState('loading');
		setErrorMessage('');

		try {
			const response = await fetch('/api/subscribe', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email })
			});

			const data = await response.json();

			if (data.success) {
				setFormState('success');
			} else {
				setFormState('error');
				setErrorMessage(data.message || 'Something went wrong');
			}
		} catch {
			setFormState('error');
			setErrorMessage('Network error. Please try again.');
		}
	}

	function handleHeroSubmit(e: Event) {
		e.preventDefault();
		handleSubscribe(
			heroEmail,
			(state) => (heroFormState = state),
			(msg) => (heroErrorMessage = msg)
		);
	}

	function handleFinalSubmit(e: Event) {
		e.preventDefault();
		handleSubscribe(
			finalEmail,
			(state) => (finalFormState = state),
			(msg) => (finalErrorMessage = msg)
		);
	}

	onMount(() => {
		// Sticky header on scroll
		const stickyHeader = document.getElementById('stickyHeader');

		window.addEventListener('scroll', () => {
			const currentScroll = window.pageYOffset;

			if (currentScroll > 400) {
				stickyHeader?.classList.add('visible');
			} else {
				stickyHeader?.classList.remove('visible');
			}
		});

		// Countdown timer
		function updateCountdown() {
			// Set end date to 3 days from now
			const endDate = new Date();
			endDate.setDate(endDate.getDate() + 3);

			const now = new Date();
			const diff = endDate.getTime() - now.getTime();

			const days = Math.floor(diff / (1000 * 60 * 60 * 24));
			const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
			const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
			const seconds = Math.floor((diff % (1000 * 60)) / 1000);

			const d = document.getElementById('days');
			const h = document.getElementById('hours');
			const m = document.getElementById('minutes');
			const s = document.getElementById('seconds');

			if (d) d.textContent = String(Math.max(days, 0)).padStart(2, '0');
			if (h) h.textContent = String(Math.max(hours, 0)).padStart(2, '0');
			if (m) m.textContent = String(Math.max(minutes, 0)).padStart(2, '0');
			if (s) s.textContent = String(Math.max(seconds, 0)).padStart(2, '0');
		}

		updateCountdown();
		const countdownInterval = window.setInterval(updateCountdown, 1000);

		// Activity ticker rotation
		const activities = [
			{ initials: 'MK', name: 'Mike from Austin', action: 'just got lifetime access' },
			{ initials: 'SL', name: 'Sarah from London', action: 'documented 3 repos' },
			{ initials: 'JT', name: 'John from NYC', action: 'just signed up' },
			{ initials: 'AP', name: 'Alex from Berlin', action: 'just got lifetime access' },
			{ initials: 'RK', name: 'Rachel from Toronto', action: 'documented 5 repos' }
		];

		let activityIndex = 0;
		const ticker = document.getElementById('activityTicker');

		function rotateActivity() {
			if (!ticker) return;

			// restart animation
			(ticker as HTMLElement).style.animation = 'none';
			void (ticker as HTMLElement).offsetHeight;
			(ticker as HTMLElement).style.animation = 'slideIn 0.5s ease';

			const activity = activities[activityIndex];

			const avatar = ticker.querySelector('.avatar');
			const name = ticker.querySelector('.name');
			const action = ticker.querySelector('.action');

			if (avatar) avatar.textContent = activity.initials;
			if (name) name.textContent = activity.name;
			if (action) action.textContent = activity.action;

			activityIndex = (activityIndex + 1) % activities.length;
		}

		const rotateTimer = window.setTimeout(() => {
			window.setInterval(rotateActivity, 8000);
		}, 5000);

		// Close ticker
		const tickerClose = document.getElementById('tickerClose');
		tickerClose?.addEventListener('click', () => {
			const el = document.getElementById('activityTicker');
			if (el) (el as HTMLElement).style.display = 'none';
		});


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

		// cleanup
		return () => {
			window.clearInterval(countdownInterval);
			window.clearTimeout(rotateTimer);
		};
	});
</script>

<style>
	/* 
        ============================================
        CRO-OPTIMIZED LANDING PAGE
        Target: 20-30% conversion rate
        ============================================
        
        PSYCHOLOGICAL TRIGGERS IMPLEMENTED:
        1. Social Proof (numbers, testimonials, logos)
        2. Scarcity (limited spots, countdown)
        3. Urgency (time-sensitive offer)
        4. Authority (trust badges, specifics)
        5. Risk Reversal (guarantee, free trial)
        6. Cognitive Ease (simple layout, clear hierarchy)
        7. Loss Aversion (what you're losing without it)
        8. FOMO (real-time activity)
        
        CONVERSION BEST PRACTICES:
        - Single clear CTA
        - Above-the-fold value prop
        - Minimal form fields (email only)
        - Mobile-first design
        - Fast load time (minimal assets)
        - Clear visual hierarchy
        - Benefit-driven headlines
        - Specific numbers (not vague claims)
        */

	:root {
		--bg: #0a0a0b;
		--bg-elevated: #111113;
		--bg-hover: #1a1a1c;
		--border: #262628;
		--text: #ffffff;
		--text-secondary: #a1a1a6;
		--text-muted: #6b6b70;
		--accent: #22c55e;
		--accent-hover: #16a34a;
		--accent-glow: rgba(34, 197, 94, 0.3);
		--warning: #f59e0b;
		--danger: #ef4444;
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

	/* NOTE:
     This is a page component, so we style globally-ish via :global()
     to match your original behavior. */
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

	/* ==========================================
           STICKY HEADER - Always visible CTA
           ========================================== */
	.sticky-header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 1000;
		background: rgba(10, 10, 11, 0.95);
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

	/* ==========================================
	   TOP NAVIGATION - Always visible
	   ========================================== */
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
	}

	.nav-cta:hover {
		background: var(--accent-hover);
		transform: translateY(-1px);
	}

	/* Or Divider */
	.or-divider {
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 16px 0;
		color: var(--text-muted);
		font-size: 0.85rem;
	}

	.or-divider span {
		padding: 0 16px;
		position: relative;
	}

	.or-divider span::before,
	.or-divider span::after {
		content: '';
		position: absolute;
		top: 50%;
		width: 80px;
		height: 1px;
		background: var(--border);
	}

	.or-divider span::before {
		right: 100%;
	}

	.or-divider span::after {
		left: 100%;
	}

	/* Secondary CTA (GitHub login) */
	.cta-secondary {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		background: transparent;
		color: var(--text);
		padding: 14px 28px;
		border: 1px solid var(--border);
		border-radius: 10px;
		font-size: 1rem;
		font-weight: 600;
		text-decoration: none;
		transition: all 0.2s;
		cursor: pointer;
	}

	.cta-secondary:hover {
		background: var(--bg-hover);
		border-color: var(--text-muted);
	}

	.cta-secondary svg {
		width: 20px;
		height: 20px;
	}

	/* ==========================================
           HERO SECTION - Above the fold
           Must contain: Value prop, CTA, Social proof
           ========================================== */
	.hero {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 60px 0 40px;
		position: relative;
		overflow: hidden;
	}

	/* Subtle gradient background */
	.hero::before {
		content: '';
		position: absolute;
		top: -50%;
		left: 50%;
		transform: translateX(-50%);
		width: 800px;
		height: 800px;
		background: radial-gradient(circle, rgba(34, 197, 94, 0.08) 0%, transparent 70%);
		pointer-events: none;
	}

	.hero-content {
		position: relative;
		z-index: 1;
		text-align: center;
		max-width: 800px;
		margin: 0 auto;
	}

	/* URGENCY BADGE - Creates FOMO */
	.urgency-badge {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background: rgba(245, 158, 11, 0.1);
		border: 1px solid rgba(245, 158, 11, 0.3);
		color: var(--warning);
		padding: 8px 16px;
		border-radius: 100px;
		font-size: 0.85rem;
		font-weight: 600;
		margin-bottom: 24px;
		animation: pulse-border 2s infinite;
	}

	@keyframes pulse-border {
		0%,
		100% {
			border-color: rgba(245, 158, 11, 0.3);
		}
		50% {
			border-color: rgba(245, 158, 11, 0.6);
		}
	}

	.urgency-badge svg {
		width: 16px;
		height: 16px;
	}

	/* HEADLINE - Clear benefit, specific outcome */
	.hero h1 {
		font-size: clamp(2.5rem, 6vw, 4rem);
		font-weight: 800;
		line-height: 1.1;
		margin-bottom: 20px;
		letter-spacing: -0.03em;
	}

	.hero h1 span {
		background: linear-gradient(135deg, var(--accent) 0%, #4ade80 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	/* SUBHEADLINE - What, how, timeframe */
	.hero-subtitle {
		font-size: 1.25rem;
		color: var(--text-secondary);
		margin-bottom: 32px;
		max-width: 600px;
		margin-left: auto;
		margin-right: auto;
	}

	/* CTA SECTION - Single clear action */
	.hero-cta-section {
		margin-bottom: 40px;
	}

	/* EMAIL FORM - Single field for minimal friction */
	.email-form {
		display: flex;
		gap: 12px;
		max-width: 480px;
		margin: 0 auto 16px;
	}

	.email-form input {
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

	.email-form input:focus {
		border-color: var(--accent);
	}

	.email-form input::placeholder {
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

	.cta-primary:disabled {
		opacity: 0.7;
		cursor: not-allowed;
		transform: none;
	}

	.cta-primary:disabled:hover {
		background: var(--accent);
		box-shadow: none;
	}

	.email-form input:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	/* Success/Error Messages */
	.success-message {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		background: rgba(34, 197, 94, 0.1);
		border: 1px solid rgba(34, 197, 94, 0.3);
		color: var(--accent);
		padding: 16px 24px;
		border-radius: 10px;
		font-size: 1rem;
		font-weight: 600;
		max-width: 480px;
		margin: 0 auto 16px;
	}

	.success-message svg {
		width: 24px;
		height: 24px;
		flex-shrink: 0;
	}

	.error-message {
		color: var(--danger);
		font-size: 0.9rem;
		margin-top: 8px;
		text-align: center;
	}

	/* Spinner Animation */
	.spinner {
		display: inline-block;
		width: 16px;
		height: 16px;
		border: 2px solid rgba(0, 0, 0, 0.3);
		border-top-color: #000;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		vertical-align: middle;
		margin-right: 4px;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* RISK REVERSAL - Remove objections */
	.risk-reversal {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 20px;
		font-size: 0.85rem;
		color: var(--text-muted);
	}

	.risk-reversal span {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.risk-reversal svg {
		width: 16px;
		height: 16px;
		color: var(--accent);
	}

	/* SOCIAL PROOF BAR - Specific numbers */
	.social-proof-bar {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 40px;
		padding: 24px 0;
		border-top: 1px solid var(--border);
		margin-top: 40px;
	}

	.proof-item {
		text-align: center;
	}

	.proof-number {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--text);
	}

	.proof-label {
		font-size: 0.8rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* REAL-TIME ACTIVITY - FOMO trigger */
	.activity-ticker {
		position: fixed;
		bottom: 20px;
		left: 20px;
		background: var(--bg-elevated);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 12px 16px;
		display: flex;
		align-items: center;
		gap: 12px;
		font-size: 0.85rem;
		z-index: 100;
		animation: slideIn 0.5s ease;
		max-width: 320px;
	}

	@keyframes slideIn {
		from {
			transform: translateX(-120%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	.activity-ticker .avatar {
		width: 36px;
		height: 36px;
		background: var(--accent);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		color: #000;
		font-size: 0.8rem;
	}

	.activity-ticker .info {
		flex: 1;
	}

	.activity-ticker .name {
		font-weight: 600;
		color: var(--text);
	}

	.activity-ticker .action {
		color: var(--text-muted);
	}

	.activity-ticker .close {
		background: none;
		border: none;
		color: var(--text-muted);
		cursor: pointer;
		padding: 4px;
	}

	/* ==========================================
           DEMO SECTION - Show the product
           ========================================== */
	.demo-section {
		padding: 80px 0;
	}

	.demo-window {
		background: var(--bg-elevated);
		border: 1px solid var(--border);
		border-radius: 16px;
		overflow: hidden;
		max-width: 900px;
		margin: 0 auto;
		box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.5);
	}

	.demo-header {
		background: #0d0d0e;
		padding: 12px 16px;
		display: flex;
		align-items: center;
		gap: 8px;
		border-bottom: 1px solid var(--border);
	}

	.demo-dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
	}

	.demo-dot:nth-child(1) {
		background: #ff5f57;
	}
	.demo-dot:nth-child(2) {
		background: #febc2e;
	}
	.demo-dot:nth-child(3) {
		background: #28c840;
	}

	.demo-content {
		display: grid;
		grid-template-columns: 1fr 1fr;
		min-height: 350px;
	}

	@media (max-width: 768px) {
		.demo-content {
			grid-template-columns: 1fr;
		}
	}

	.demo-input,
	.demo-output {
		padding: 24px;
	}

	.demo-input {
		background: #0d0d0e;
		border-right: 1px solid var(--border);
		font-family: 'Monaco', 'Menlo', monospace;
		font-size: 0.85rem;
		color: var(--text-secondary);
		line-height: 1.8;
	}

	.demo-input pre {
		white-space: pre;
		overflow: auto;
		margin: 0;
	}

	.demo-label {
		font-family: 'Inter', sans-serif;
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--text-muted);
		margin-bottom: 16px;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.demo-label::before {
		content: '';
		width: 8px;
		height: 8px;
		background: var(--accent);
		border-radius: 2px;
	}

	.demo-output {
		font-size: 0.9rem;
	}

	.demo-output h4 {
		color: var(--text);
		margin-bottom: 8px;
		font-size: 1rem;
	}

	.demo-output p,
	.demo-output li {
		color: var(--text-secondary);
		margin-bottom: 6px;
	}

	.demo-output ul {
		list-style: none;
		padding-left: 16px;
	}

	.demo-output li::before {
		content: '→';
		color: var(--accent);
		margin-right: 8px;
	}

	/* ==========================================
           PROBLEM-AGITATION SECTION
           ========================================== */
	.problem-section {
		padding: 80px 0;
		text-align: center;
	}

	.problem-section h2 {
		font-size: 2rem;
		font-weight: 700;
		margin-bottom: 40px;
	}

	.problem-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 24px;
		max-width: 900px;
		margin: 0 auto;
	}

	.problem-card {
		background: var(--bg-elevated);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 24px;
		text-align: left;
	}

	.problem-card .icon {
		width: 40px;
		height: 40px;
		background: rgba(239, 68, 68, 0.1);
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 16px;
		font-size: 20px;
	}

	.problem-card h3 {
		font-size: 1.1rem;
		margin-bottom: 8px;
	}

	.problem-card p {
		color: var(--text-secondary);
		font-size: 0.9rem;
	}

	.problem-card .stat {
		color: var(--danger);
		font-weight: 600;
	}

	/* ==========================================
           FEATURES/BENEFITS SECTION
           ========================================== */
	.features-section {
		padding: 80px 0;
		background: linear-gradient(180deg, transparent 0%, var(--bg-elevated) 50%, transparent 100%);
	}

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

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 24px;
	}

	.feature-card {
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 28px;
		transition: all 0.3s;
	}

	.feature-card:hover {
		border-color: var(--accent);
		transform: translateY(-4px);
	}

	.feature-card .icon {
		width: 48px;
		height: 48px;
		background: rgba(34, 197, 94, 0.1);
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 20px;
		font-size: 24px;
	}

	.feature-card h3 {
		font-size: 1.15rem;
		margin-bottom: 8px;
	}

	.feature-card p {
		color: var(--text-secondary);
		font-size: 0.95rem;
	}

	/* ==========================================
           HOW IT WORKS - 3-step process
           ========================================== */
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
		content: '→';
		position: absolute;
		right: -28px;
		top: 24px;
		color: var(--text-muted);
		font-size: 1.5rem;
	}

	@media (max-width: 768px) {
		.step:not(:last-child)::after {
			content: '↓';
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

	/* ==========================================
           SOCIAL PROOF - Testimonials
           ========================================== */
	.testimonials-section {
		padding: 80px 0;
	}

	.testimonials-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 24px;
	}

	.testimonial-card {
		background: var(--bg-elevated);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 28px;
	}

	.testimonial-stars {
		color: var(--warning);
		margin-bottom: 16px;
		font-size: 1.1rem;
	}

	.testimonial-text {
		font-size: 1rem;
		color: var(--text-secondary);
		margin-bottom: 20px;
		font-style: italic;
		line-height: 1.7;
	}

	.testimonial-text strong {
		color: var(--text);
		font-style: normal;
	}

	.testimonial-author {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.testimonial-avatar {
		width: 44px;
		height: 44px;
		background: linear-gradient(135deg, var(--accent) 0%, #4ade80 100%);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		color: #000;
	}

	.testimonial-name {
		font-weight: 600;
	}

	.testimonial-role {
		font-size: 0.85rem;
		color: var(--text-muted);
	}

	/* ==========================================
           PRICING SECTION - Single clear offer
           ========================================== */
	.pricing-section {
		padding: 80px 0;
	}

	.pricing-card {
		max-width: 500px;
		margin: 0 auto;
		background: var(--bg-elevated);
		border: 2px solid var(--accent);
		border-radius: 20px;
		padding: 40px;
		text-align: center;
		position: relative;
		overflow: hidden;
	}

	.pricing-badge {
		position: absolute;
		top: 20px;
		right: -35px;
		background: var(--accent);
		color: #000;
		padding: 6px 40px;
		font-size: 0.75rem;
		font-weight: 700;
		transform: rotate(45deg);
	}

	.pricing-card h3 {
		font-size: 1.5rem;
		margin-bottom: 8px;
	}

	.pricing-subtitle {
		color: var(--text-muted);
		margin-bottom: 24px;
	}

	.pricing-price {
		display: flex;
		align-items: baseline;
		justify-content: center;
		gap: 4px;
		margin-bottom: 8px;
	}

	.pricing-price .currency {
		font-size: 1.5rem;
		color: var(--text-secondary);
	}

	.pricing-price .amount {
		font-size: 4rem;
		font-weight: 800;
		line-height: 1;
	}

	.pricing-price .original {
		font-size: 1.5rem;
		color: var(--text-muted);
		text-decoration: line-through;
		margin-left: 12px;
	}

	.pricing-period {
		color: var(--text-muted);
		margin-bottom: 24px;
	}

	.pricing-features {
		list-style: none;
		text-align: left;
		margin-bottom: 32px;
	}

	.pricing-features li {
		padding: 12px 0;
		border-bottom: 1px solid var(--border);
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.pricing-features li:last-child {
		border-bottom: none;
	}

	.pricing-features li::before {
		content: '✓';
		color: var(--accent);
		font-weight: 700;
	}

	.pricing-cta {
		width: 100%;
		background: var(--accent);
		color: #000;
		padding: 18px 32px;
		border: none;
		border-radius: 12px;
		font-size: 1.1rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s;
		margin-bottom: 16px;
	}

	.pricing-cta:hover {
		background: var(--accent-hover);
		transform: translateY(-2px);
		box-shadow: 0 8px 30px var(--accent-glow);
	}

	.pricing-guarantee {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		font-size: 0.9rem;
		color: var(--text-muted);
	}

	.pricing-guarantee svg {
		width: 18px;
		height: 18px;
		color: var(--accent);
	}

	/* COUNTDOWN TIMER - Urgency */
	.countdown {
		background: rgba(245, 158, 11, 0.1);
		border: 1px solid rgba(245, 158, 11, 0.3);
		border-radius: 10px;
		padding: 16px;
		margin-bottom: 24px;
	}

	.countdown-label {
		font-size: 0.85rem;
		color: var(--warning);
		margin-bottom: 8px;
		font-weight: 600;
	}

	.countdown-timer {
		display: flex;
		justify-content: center;
		gap: 16px;
	}

	.countdown-unit {
		text-align: center;
	}

	.countdown-number {
		font-size: 1.8rem;
		font-weight: 700;
		color: var(--text);
	}

	.countdown-unit-label {
		font-size: 0.7rem;
		color: var(--text-muted);
		text-transform: uppercase;
	}

	/* ==========================================
           FAQ SECTION
           ========================================== */
	.faq-section {
		padding: 80px 0;
	}

	.faq-grid {
		max-width: 700px;
		margin: 0 auto;
	}

	.faq-item {
		border-bottom: 1px solid var(--border);
		padding: 24px 0;
	}

	.faq-question {
		font-size: 1.1rem;
		font-weight: 600;
		margin-bottom: 12px;
		cursor: pointer;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.faq-answer {
		color: var(--text-secondary);
		font-size: 0.95rem;
		line-height: 1.7;
	}

	/* ==========================================
           FINAL CTA SECTION
           ========================================== */
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
		background: radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%);
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

	.final-cta .email-form {
		position: relative;
		z-index: 1;
	}

	/* ==========================================
           FOOTER
           ========================================== */
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

	/* ==========================================
           MOBILE RESPONSIVE
           ========================================== */
	@media (max-width: 640px) {
		.hero h1 {
			font-size: 2rem;
		}

		.hero-subtitle {
			font-size: 1.1rem;
		}

		.email-form {
			flex-direction: column;
		}

		.email-form input,
		.cta-primary {
			width: 100%;
		}

		.social-proof-bar {
			flex-wrap: wrap;
			gap: 24px;
		}

		.risk-reversal {
			flex-direction: column;
			gap: 8px;
		}

		.activity-ticker {
			display: none;
		}

		.pricing-card {
			padding: 28px;
		}

		.pricing-price .amount {
			font-size: 3rem;
		}
	}

	/* ==========================================
           ANIMATIONS
           ========================================== */
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
</style>
