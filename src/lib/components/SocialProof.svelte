<script lang="ts">
	const testimonials = [
		{
			quote: "Saved me 8 hours on my side project",
			author: "Alex Chen",
			handle: "@alexdev",
			avatar: "A"
		},
		{
			quote: "Finally, docs that actually get written",
			author: "Sarah Miller",
			handle: "@indie_sarah",
			avatar: "S"
		},
		{
			quote: "Worth 10x the price",
			author: "Mike Johnson",
			handle: "@startup_mike",
			avatar: "M"
		}
	];

	const rating = 4.9;
	const reviewCount = 127;
</script>

<section class="social-proof">
	<div class="container">
		<!-- Testimonial Cards -->
		<div class="testimonials-grid">
			{#each testimonials as testimonial}
				<div class="testimonial-card">
					<div class="quote-icon">"</div>
					<p class="quote">{testimonial.quote}</p>
					<div class="author">
						<div class="avatar">{testimonial.avatar}</div>
						<div class="author-info">
							<span class="author-name">{testimonial.author}</span>
							<span class="author-handle">{testimonial.handle}</span>
						</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Rating Summary -->
		<div class="rating-summary">
			<div class="stars" aria-label="{rating} out of 5 stars">
				{#each Array(5) as _, i}
					<span class="star" class:filled={i < Math.floor(rating)}>★</span>
				{/each}
			</div>
			<span class="rating-text">
				<strong>{rating}/5</strong> from {reviewCount} developers
			</span>
		</div>
	</div>
</section>

<style>
	.social-proof {
		padding: 60px 0;
		background: linear-gradient(180deg, transparent 0%, rgba(17, 17, 19, 0.5) 50%, transparent 100%);
	}

	.container {
		max-width: 1100px;
		margin: 0 auto;
		padding: 0 20px;
	}

	.testimonials-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 24px;
		margin-bottom: 40px;
	}

	@media (max-width: 900px) {
		.testimonials-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 600px) {
		.testimonials-grid {
			grid-template-columns: 1fr;
		}
	}

	.testimonial-card {
		background: #111113;
		border: 1px solid #262628;
		border-radius: 12px;
		padding: 24px;
		position: relative;
		transition: all 0.3s ease;
	}

	.testimonial-card:hover {
		border-color: #10b981;
		transform: translateY(-4px);
		box-shadow: 0 8px 30px rgba(16, 185, 129, 0.15);
	}

	.quote-icon {
		position: absolute;
		top: 12px;
		right: 16px;
		font-size: 3rem;
		color: #10b981;
		opacity: 0.2;
		font-family: Georgia, serif;
		line-height: 1;
	}

	.quote {
		font-size: 1.1rem;
		color: #fff;
		line-height: 1.5;
		margin-bottom: 20px;
		position: relative;
		z-index: 1;
	}

	.author {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: linear-gradient(135deg, #10b981 0%, #059669 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		color: #000;
		font-size: 1rem;
	}

	.author-info {
		display: flex;
		flex-direction: column;
	}

	.author-name {
		font-weight: 600;
		color: #fff;
		font-size: 0.95rem;
	}

	.author-handle {
		color: #6b6b70;
		font-size: 0.85rem;
	}

	.rating-summary {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		flex-wrap: wrap;
	}

	.stars {
		display: flex;
		gap: 2px;
	}

	.star {
		font-size: 1.5rem;
		color: #3a3a3c;
	}

	.star.filled {
		color: #fbbf24;
	}

	.rating-text {
		color: #a1a1a6;
		font-size: 1rem;
	}

	.rating-text strong {
		color: #fff;
	}
</style>
