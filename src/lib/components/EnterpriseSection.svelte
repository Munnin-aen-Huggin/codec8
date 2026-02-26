<script lang="ts">
	export let calendlyUrl: string = 'https://calendly.com/codec8/demo';
</script>

<section class="enterprise-section">
	<div class="container">
		<div class="enterprise-content">
			<div class="enterprise-badge">ENTERPRISE</div>
			<h2>Need docs for your whole team?</h2>
			<p class="enterprise-subtitle">
				Let us handle your documentation at scale. Custom solutions for teams of all sizes.
			</p>

			<div class="benefits-grid">
				<div class="benefit">
					<span class="benefit-icon">📦</span>
					<div class="benefit-text">
						<strong>Bulk pricing</strong>
						<span>Save 40%+ on 10+ repos</span>
					</div>
				</div>
				<div class="benefit">
					<span class="benefit-icon">🎨</span>
					<div class="benefit-text">
						<strong>Custom templates</strong>
						<span>Match your style guide</span>
					</div>
				</div>
				<div class="benefit">
					<span class="benefit-icon">🔐</span>
					<div class="benefit-text">
						<strong>SSO & team management</strong>
						<span>Enterprise-grade security</span>
					</div>
				</div>
				<div class="benefit">
					<span class="benefit-icon">🎯</span>
					<div class="benefit-text">
						<strong>Dedicated support</strong>
						<span>Priority response times</span>
					</div>
				</div>
			</div>

			<div class="cta-wrapper">
				<a href={calendlyUrl} target="_blank" rel="noopener noreferrer" class="enterprise-cta">
					<span class="cta-icon">📅</span>
					Book a Demo Call
				</a>
				<p class="cta-note">15-minute call to discuss your needs</p>
			</div>
		</div>
	</div>
</section>

<style>
	.enterprise-section {
		padding: 80px 0;
		background: linear-gradient(180deg, transparent 0%, rgba(16, 185, 129, 0.03) 50%, transparent 100%);
		position: relative;
	}

	.enterprise-section::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.3), transparent);
	}

	.container {
		max-width: 900px;
		margin: 0 auto;
		padding: 0 20px;
	}

	.enterprise-content {
		text-align: center;
	}

	.enterprise-badge {
		display: inline-block;
		background: rgba(16, 185, 129, 0.1);
		border: 1px solid rgba(16, 185, 129, 0.3);
		color: #10b981;
		padding: 6px 16px;
		border-radius: 100px;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		margin-bottom: 20px;
	}

	h2 {
		font-size: 2rem;
		font-weight: 700;
		color: #fff;
		margin-bottom: 12px;
	}

	.enterprise-subtitle {
		color: #a1a1a6;
		font-size: 1.1rem;
		max-width: 500px;
		margin: 0 auto 40px;
	}

	.benefits-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 24px;
		max-width: 700px;
		margin: 0 auto 40px;
	}

	@media (max-width: 600px) {
		.benefits-grid {
			grid-template-columns: 1fr;
		}
	}

	.benefit {
		display: flex;
		align-items: flex-start;
		gap: 14px;
		background: #111113;
		border: 1px solid #262628;
		border-radius: 12px;
		padding: 20px;
		text-align: left;
		transition: all 0.3s ease;
	}

	.benefit:hover {
		border-color: rgba(16, 185, 129, 0.4);
		transform: translateY(-2px);
	}

	.benefit-icon {
		font-size: 1.5rem;
		flex-shrink: 0;
	}

	.benefit-text {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.benefit-text strong {
		color: #fff;
		font-size: 0.95rem;
		font-weight: 600;
	}

	.benefit-text span {
		color: #6b6b70;
		font-size: 0.85rem;
	}

	.cta-wrapper {
		text-align: center;
	}

	.enterprise-cta {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		background: transparent;
		color: #fff;
		border: 2px solid #10b981;
		padding: 16px 32px;
		border-radius: 10px;
		font-size: 1.1rem;
		font-weight: 700;
		text-decoration: none;
		transition: all 0.2s;
	}

	.enterprise-cta:hover {
		background: #10b981;
		color: #000;
		transform: translateY(-2px);
		box-shadow: 0 8px 30px rgba(16, 185, 129, 0.25);
	}

	.cta-icon {
		font-size: 1.2rem;
	}

	.cta-note {
		color: #6b6b70;
		font-size: 0.9rem;
		margin-top: 12px;
	}

	@media (max-width: 640px) {
		h2 {
			font-size: 1.5rem;
		}

		.enterprise-subtitle {
			font-size: 1rem;
		}
	}
</style>
