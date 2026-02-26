<script lang="ts">
	import Header from '$lib/components/Header.svelte';
</script>

<svelte:head>
	<title>Terms of Service - Codec8</title>
	<meta name="description" content="Codec8 Terms of Service" />
</svelte:head>

<Header />

<main class="legal-page">
	<div class="container">
		<h1>Terms of Service</h1>
		<p class="updated">Last updated: January 14, 2026</p>

		<section>
			<h2>1. Acceptance of Terms</h2>
			<p>By accessing or using Codec8, you agree to be bound by these Terms of Service. If you do not agree, please do not use our service.</p>
		</section>

		<section>
			<h2>2. Description of Service</h2>
			<p>Codec8 is a software-as-a-service (SaaS) platform that automatically generates documentation for GitHub repositories using artificial intelligence. Our service includes:</p>
			<ul>
				<li>README generation</li>
				<li>API documentation</li>
				<li>Architecture diagrams</li>
				<li>Setup guides</li>
			</ul>
		</section>

		<section>
			<h2>3. Account Registration</h2>
			<p>To use Codec8, you must:</p>
			<ul>
				<li>Have a valid GitHub account</li>
				<li>Provide accurate account information</li>
				<li>Be at least 18 years old or have parental consent</li>
				<li>Keep your account credentials secure</li>
			</ul>
		</section>

		<section>
			<h2>4. Pricing and Payments</h2>
			<p>Codec8 offers the following plans:</p>
			<ul>
				<li><strong>Free Demo:</strong> Limited to README generation for public repos</li>
				<li><strong>Single Repo ($99):</strong> One-time purchase for complete documentation of one repository</li>
				<li><strong>Pro ($149/month):</strong> 30 repositories per month with all features</li>
				<li><strong>Team ($399/month):</strong> 100 repositories per month with team features</li>
			</ul>
			<p>All payments are processed securely through Stripe. Subscriptions can be cancelled at any time.</p>
		</section>

		<section>
			<h2>5. Acceptable Use</h2>
			<p>You agree NOT to:</p>
			<ul>
				<li>Use the service for any illegal purpose</li>
				<li>Attempt to reverse engineer or exploit the service</li>
				<li>Share your account credentials with others</li>
				<li>Use automated tools to abuse the service</li>
				<li>Generate documentation for repositories you don't have rights to</li>
			</ul>
		</section>

		<section>
			<h2>6. Intellectual Property</h2>
			<p><strong>Your Content:</strong> You retain all rights to your code and repositories. The documentation generated belongs to you.</p>
			<p><strong>Our Service:</strong> Codec8 and its underlying technology are owned by us and protected by intellectual property laws.</p>
		</section>

		<section>
			<h2>7. Disclaimer of Warranties</h2>
			<p>Codec8 is provided "as is" without warranties of any kind. We do not guarantee that:</p>
			<ul>
				<li>The service will be uninterrupted or error-free</li>
				<li>Generated documentation will be 100% accurate</li>
				<li>The service will meet all your requirements</li>
			</ul>
			<p>You should review all generated documentation before publishing.</p>
		</section>

		<section>
			<h2>8. Limitation of Liability</h2>
			<p>To the maximum extent permitted by law, Codec8 shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service.</p>
		</section>

		<section>
			<h2>9. Refund Policy</h2>
			<ul>
				<li><strong>Single Repo:</strong> Refunds available within 7 days if documentation was not generated</li>
				<li><strong>Subscriptions:</strong> No refunds for partial months; cancel anytime to stop future charges</li>
			</ul>
		</section>

		<section>
			<h2>10. Changes to Terms</h2>
			<p>We may update these terms from time to time. We will notify you of significant changes via email or through the service.</p>
		</section>

		<section>
			<h2>11. Contact</h2>
			<p>For questions about these terms, contact us at: <a href="mailto:legal@codec8.com">legal@codec8.com</a></p>
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
