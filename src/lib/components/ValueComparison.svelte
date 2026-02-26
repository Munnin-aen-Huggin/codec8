<script lang="ts">
	export let ctaHref: string = '/auth/login?intent=purchase&product=single';
</script>

<section class="value-comparison">
	<div class="container">
		<div class="section-header">
			<h2>Why $99 is a no-brainer</h2>
		</div>

		<div class="comparison-grid">
			<!-- The Old Way -->
			<div class="comparison-card old-way">
				<h3 class="card-title">THE OLD WAY</h3>
				<ul class="steps">
					<li>Hire technical writer</li>
					<li>$50-100/hour × 6-8 hrs</li>
				</ul>
				<div class="price-line">
					<span class="price">$400-800</span>
				</div>
				<ul class="downsides">
					<li>
						<span class="icon">−</span>
						Weeks of back-and-forth
					</li>
					<li>
						<span class="icon">−</span>
						Outdated by next PR
					</li>
					<li>
						<span class="icon">−</span>
						Pay again for updates
					</li>
				</ul>
			</div>

			<!-- With Codec8 -->
			<div class="comparison-card codec8-way">
				<h3 class="card-title">WITH CODEC8</h3>
				<ul class="steps">
					<li>Paste URL</li>
					<li>Wait 60 seconds</li>
					<li>Done</li>
				</ul>
				<div class="price-line">
					<span class="price">$99</span>
					<span class="price-note">one-time</span>
				</div>
				<ul class="benefits">
					<li>
						<span class="icon">+</span>
						Instant results
					</li>
					<li>
						<span class="icon">+</span>
						Always up-to-date
					</li>
					<li>
						<span class="icon">+</span>
						Regenerate: $19
					</li>
				</ul>
			</div>
		</div>

		<!-- CTA -->
		<div class="cta-wrapper">
			<a href={ctaHref} class="cta-button">
				Get Complete Docs — $99
			</a>
		</div>
	</div>
</section>

<style>
	.value-comparison {
		padding: 80px 0;
	}

	.container {
		max-width: 900px;
		margin: 0 auto;
		padding: 0 20px;
	}

	.section-header {
		text-align: center;
		margin-bottom: 48px;
	}

	.section-header h2 {
		font-size: 2rem;
		font-weight: 700;
		color: #fff;
	}

	.comparison-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 24px;
		margin-bottom: 40px;
	}

	@media (max-width: 700px) {
		.comparison-grid {
			grid-template-columns: 1fr;
		}
	}

	.comparison-card {
		background: #111113;
		border: 1px solid #262628;
		border-radius: 16px;
		padding: 32px;
	}

	.comparison-card.old-way {
		border-color: rgba(239, 68, 68, 0.3);
	}

	.comparison-card.codec8-way {
		border-color: #10b981;
		background: rgba(16, 185, 129, 0.05);
		box-shadow: 0 0 40px rgba(16, 185, 129, 0.1);
	}

	.card-title {
		font-size: 0.85rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		margin-bottom: 24px;
		text-align: center;
	}

	.old-way .card-title {
		color: #ef4444;
	}

	.codec8-way .card-title {
		color: #10b981;
	}

	.steps {
		list-style: none;
		padding: 0;
		margin: 0 0 24px 0;
	}

	.steps li {
		color: #a1a1a6;
		font-size: 1rem;
		padding: 8px 0;
		text-align: center;
	}

	.codec8-way .steps li {
		color: #fff;
	}

	.price-line {
		text-align: center;
		padding: 16px 0;
		margin-bottom: 24px;
		border-top: 1px solid #262628;
		border-bottom: 1px solid #262628;
	}

	.price {
		font-size: 2rem;
		font-weight: 800;
	}

	.old-way .price {
		color: #ef4444;
		text-decoration: line-through;
		opacity: 0.8;
	}

	.codec8-way .price {
		color: #10b981;
	}

	.price-note {
		display: block;
		font-size: 0.9rem;
		color: #6b6b70;
		margin-top: 4px;
	}

	.downsides,
	.benefits {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.downsides li,
	.benefits li {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 0;
		font-size: 0.95rem;
	}

	.downsides li {
		color: #6b6b70;
	}

	.downsides .icon {
		color: #ef4444;
		font-weight: 700;
		font-size: 1.2rem;
	}

	.benefits li {
		color: #fff;
	}

	.benefits .icon {
		color: #10b981;
		font-weight: 700;
		font-size: 1.2rem;
	}

	.cta-wrapper {
		text-align: center;
	}

	.cta-button {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background: #10b981;
		color: #000;
		padding: 16px 32px;
		border-radius: 10px;
		font-size: 1.1rem;
		font-weight: 700;
		text-decoration: none;
		transition: all 0.2s;
	}

	.cta-button:hover {
		background: #059669;
		transform: translateY(-2px);
		box-shadow: 0 8px 30px rgba(16, 185, 129, 0.3);
	}
</style>
