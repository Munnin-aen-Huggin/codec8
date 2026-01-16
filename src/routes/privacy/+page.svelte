<script lang="ts">
	import Header from '$lib/components/Header.svelte';
</script>

<svelte:head>
	<title>Privacy Policy - CodeDoc AI</title>
	<meta name="description" content="CodeDoc AI Privacy Policy - How we handle your data" />
</svelte:head>

<Header />

<main class="legal-page">
	<div class="container">
		<h1>Privacy Policy</h1>
		<p class="updated">Last updated: January 14, 2026</p>

		<section>
			<h2>1. Information We Collect</h2>
			<p>When you use CodeDoc AI, we collect:</p>
			<ul>
				<li><strong>Account Information:</strong> Email address and GitHub username when you sign in with GitHub OAuth</li>
				<li><strong>Repository Data:</strong> Public repository metadata and code content that you explicitly connect for documentation generation</li>
				<li><strong>Usage Data:</strong> Anonymous analytics about how you use our service</li>
				<li><strong>Payment Information:</strong> Processed securely by Stripe - we never store your card details</li>
			</ul>
		</section>

		<section>
			<h2>2. How We Use Your Information</h2>
			<ul>
				<li>Generate documentation for your repositories using AI</li>
				<li>Process payments and manage your subscription</li>
				<li>Send important service updates and notifications</li>
				<li>Improve our service based on usage patterns</li>
			</ul>
		</section>

		<section>
			<h2>3. Data Storage and Security</h2>
			<p>Your data is stored securely using:</p>
			<ul>
				<li><strong>Supabase:</strong> For user accounts and generated documentation</li>
				<li><strong>Stripe:</strong> For payment processing (PCI compliant)</li>
				<li><strong>Vercel:</strong> For application hosting</li>
			</ul>
			<p>We use industry-standard encryption and security practices to protect your data.</p>
		</section>

		<section>
			<h2>4. Third-Party Services</h2>
			<p>We use the following third-party services:</p>
			<ul>
				<li><strong>GitHub:</strong> For authentication and repository access</li>
				<li><strong>Anthropic:</strong> For AI-powered documentation generation</li>
				<li><strong>Stripe:</strong> For payment processing</li>
			</ul>
		</section>

		<section>
			<h2>5. Your Rights</h2>
			<p>You have the right to:</p>
			<ul>
				<li>Access your personal data</li>
				<li>Delete your account and associated data</li>
				<li>Export your generated documentation</li>
				<li>Opt out of marketing communications</li>
			</ul>
		</section>

		<section>
			<h2>6. Data Retention</h2>
			<p>We retain your data for as long as your account is active. When you delete your account, we remove your personal data within 30 days.</p>
		</section>

		<section>
			<h2>7. Contact Us</h2>
			<p>For privacy-related questions, contact us at: <a href="mailto:privacy@codedoc.ai">privacy@codedoc.ai</a></p>
		</section>
	</div>
</main>

<style>
	.legal-page {
		min-height: 100vh;
		background: #09090b;
		color: #fafafa;
		padding: 2rem 1rem 4rem;
	}

	.container {
		max-width: 800px;
		margin: 0 auto;
	}

	h1 {
		font-size: 2.5rem;
		font-weight: 700;
		margin-bottom: 0.5rem;
	}

	.updated {
		color: #71717a;
		margin-bottom: 3rem;
	}

	section {
		margin-bottom: 2.5rem;
	}

	h2 {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 1rem;
		color: #10b981;
	}

	p {
		color: #a1a1aa;
		line-height: 1.7;
		margin-bottom: 1rem;
	}

	ul {
		color: #a1a1aa;
		padding-left: 1.5rem;
		margin-bottom: 1rem;
	}

	li {
		margin-bottom: 0.5rem;
		line-height: 1.6;
	}

	strong {
		color: #fafafa;
	}

	a {
		color: #10b981;
		text-decoration: underline;
	}

	a:hover {
		color: #34d399;
	}
</style>
