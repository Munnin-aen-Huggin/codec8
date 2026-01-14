<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	const allTestimonials = [
		{
			quote: "Saved me 8 hours on my side project. The README it generated was better than what I would have written myself.",
			author: "Alex Chen",
			handle: "@alexdev",
			role: "Solo Developer",
			avatar: "A",
			verified: true
		},
		{
			quote: "Finally, docs that actually get written. My team loves how easy it is to keep everything up to date.",
			author: "Sarah Miller",
			handle: "@indie_sarah",
			role: "Engineering Lead",
			avatar: "S",
			verified: true
		},
		{
			quote: "Worth 10x the price. We documented 15 repos in one afternoon.",
			author: "Mike Johnson",
			handle: "@startup_mike",
			role: "CTO, TechStartup",
			avatar: "M",
			verified: true
		},
		{
			quote: "The architecture diagrams are incredibly accurate. Saved our onboarding time by 50%.",
			author: "David Park",
			handle: "@davidbuilds",
			role: "VP Engineering",
			avatar: "D",
			verified: true
		},
		{
			quote: "Our team's documentation debt is finally gone. This should be standard for every company.",
			author: "Emma Wilson",
			handle: "@emma_codes",
			role: "Technical Writer",
			avatar: "E",
			verified: true
		},
		{
			quote: "The API docs it generates are production-ready. Our developers love it.",
			author: "James Rodriguez",
			handle: "@jamesdev",
			role: "Backend Lead",
			avatar: "J",
			verified: true
		},
		{
			quote: "Setup guides that actually work! No more outdated instructions.",
			author: "Lisa Thompson",
			handle: "@lisa_tech",
			role: "DevOps Engineer",
			avatar: "L",
			verified: true
		},
		{
			quote: "I was skeptical at first, but the quality blew me away. Using it for all my projects now.",
			author: "Ryan Cooper",
			handle: "@ryanbuilds",
			role: "Indie Hacker",
			avatar: "R",
			verified: true
		},
		{
			quote: "Perfect for open source projects. Contributors can actually understand our codebase now.",
			author: "Nina Patel",
			handle: "@ninaoss",
			role: "Open Source Maintainer",
			avatar: "N",
			verified: true
		}
	];

	let currentPage = 0;
	const testimonialsPerPage = 3;
	const totalPages = Math.ceil(allTestimonials.length / testimonialsPerPage);
	let interval: ReturnType<typeof setInterval>;
	let transitioning = false;

	$: visibleTestimonials = allTestimonials.slice(
		currentPage * testimonialsPerPage,
		(currentPage + 1) * testimonialsPerPage
	);

	function nextPage() {
		if (transitioning) return;
		transitioning = true;
		currentPage = (currentPage + 1) % totalPages;
		setTimeout(() => transitioning = false, 500);
	}

	function goToPage(page: number) {
		if (transitioning || page === currentPage) return;
		transitioning = true;
		currentPage = page;
		setTimeout(() => transitioning = false, 500);
	}

	onMount(() => {
		interval = setInterval(nextPage, 6000);
	});

	onDestroy(() => {
		if (interval) clearInterval(interval);
	});

	const rating = 4.9;
	const reviewCount = 284;
</script>

<section class="social-proof">
	<div class="container">
		<!-- Section Header -->
		<div class="section-header">
			<div class="header-badge">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
				</svg>
				Trusted by developers
			</div>
			<h2 class="section-title">Loved by <span>Developers</span></h2>
			<p class="section-subtitle">See what developers are saying about CodeDoc AI</p>
		</div>

		<!-- Testimonial Cards -->
		<div class="testimonials-grid" class:transitioning>
			{#each visibleTestimonials as testimonial (testimonial.handle)}
				<div class="testimonial-card">
					<!-- Quote Icon -->
					<div class="quote-icon">
						<svg viewBox="0 0 24 24" fill="currentColor">
							<path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
						</svg>
					</div>
					<p class="quote">{testimonial.quote}</p>
					<div class="author">
						<div class="avatar">{testimonial.avatar}</div>
						<div class="author-info">
							<div class="author-name-row">
								<span class="author-name">{testimonial.author}</span>
								{#if testimonial.verified}
									<svg class="verified-badge" viewBox="0 0 24 24" fill="currentColor">
										<path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
									</svg>
								{/if}
							</div>
							<span class="author-role">{testimonial.role}</span>
						</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Pagination Dots -->
		<div class="pagination">
			{#each Array(totalPages) as _, i}
				<button
					class="dot"
					class:active={i === currentPage}
					on:click={() => goToPage(i)}
					aria-label="Go to testimonials page {i + 1}"
				></button>
			{/each}
		</div>

		<!-- Rating Summary -->
		<div class="rating-summary">
			<div class="rating-card">
				<div class="stars" aria-label="{rating} out of 5 stars">
					{#each Array(5) as _, i}
						<svg class="star" class:filled={i < Math.floor(rating)} viewBox="0 0 24 24" fill="currentColor">
							<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
						</svg>
					{/each}
				</div>
				<div class="rating-info">
					<span class="rating-number">{rating}</span>
					<span class="rating-text">from {reviewCount} developers</span>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.social-proof {
		padding: 80px 0;
		background: linear-gradient(180deg, transparent 0%, rgba(17, 17, 19, 0.5) 50%, transparent 100%);
		position: relative;
		overflow: hidden;
	}

	.social-proof::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 800px;
		height: 800px;
		background: radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%);
		pointer-events: none;
	}

	.container {
		max-width: 1100px;
		margin: 0 auto;
		padding: 0 20px;
		position: relative;
		z-index: 1;
	}

	/* Section Header */
	.section-header {
		text-align: center;
		margin-bottom: 48px;
	}

	.header-badge {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background: rgba(16, 185, 129, 0.1);
		border: 1px solid rgba(16, 185, 129, 0.2);
		color: #10b981;
		padding: 8px 16px;
		border-radius: 100px;
		font-size: 0.85rem;
		font-weight: 500;
		margin-bottom: 16px;
	}

	.header-badge svg {
		width: 16px;
		height: 16px;
	}

	.section-title {
		font-size: 2.5rem;
		font-weight: 800;
		color: #fff;
		margin-bottom: 12px;
		letter-spacing: -0.02em;
	}

	.section-title span {
		background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.section-subtitle {
		color: #a1a1a6;
		font-size: 1.1rem;
	}

	/* Testimonials Grid */
	.testimonials-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 24px;
		margin-bottom: 40px;
		transition: opacity 0.3s ease;
	}

	.testimonials-grid.transitioning {
		opacity: 0.5;
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

	/* Testimonial Card */
	.testimonial-card {
		background: rgba(17, 17, 19, 0.8);
		backdrop-filter: blur(10px);
		border: 1px solid #262628;
		border-radius: 16px;
		padding: 28px;
		position: relative;
		transition: all 0.3s ease;
		display: flex;
		flex-direction: column;
	}

	.testimonial-card:hover {
		border-color: rgba(16, 185, 129, 0.5);
		transform: translateY(-6px);
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 40px rgba(16, 185, 129, 0.1);
	}

	/* Quote Icon */
	.quote-icon {
		width: 32px;
		height: 32px;
		margin-bottom: 16px;
		color: #10b981;
		opacity: 0.4;
	}

	.quote-icon svg {
		width: 100%;
		height: 100%;
	}

	.quote {
		font-size: 1rem;
		color: #e5e5e5;
		line-height: 1.6;
		margin-bottom: 24px;
		flex-grow: 1;
	}

	/* Author Section */
	.author {
		display: flex;
		align-items: center;
		gap: 12px;
		padding-top: 16px;
		border-top: 1px solid #262628;
	}

	.avatar {
		width: 44px;
		height: 44px;
		border-radius: 12px;
		background: linear-gradient(135deg, #10b981 0%, #059669 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		color: #000;
		font-size: 1rem;
		flex-shrink: 0;
	}

	.author-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.author-name-row {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.author-name {
		font-weight: 600;
		color: #fff;
		font-size: 0.95rem;
	}

	.verified-badge {
		width: 16px;
		height: 16px;
		color: #10b981;
	}

	.author-role {
		color: #6b6b70;
		font-size: 0.85rem;
	}

	/* Pagination */
	.pagination {
		display: flex;
		justify-content: center;
		gap: 10px;
		margin-bottom: 40px;
	}

	.dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: #3a3a3c;
		border: none;
		cursor: pointer;
		transition: all 0.3s;
		padding: 0;
	}

	.dot:hover {
		background: #6b6b70;
		transform: scale(1.1);
	}

	.dot.active {
		background: #10b981;
		width: 32px;
		border-radius: 6px;
		box-shadow: 0 0 12px rgba(16, 185, 129, 0.5);
	}

	/* Rating Summary */
	.rating-summary {
		display: flex;
		justify-content: center;
	}

	.rating-card {
		display: flex;
		align-items: center;
		gap: 16px;
		background: rgba(17, 17, 19, 0.6);
		backdrop-filter: blur(10px);
		border: 1px solid #262628;
		border-radius: 12px;
		padding: 16px 24px;
	}

	.stars {
		display: flex;
		gap: 4px;
	}

	.star {
		width: 20px;
		height: 20px;
		color: #3a3a3c;
		transition: all 0.2s;
	}

	.star.filled {
		color: #fbbf24;
		filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.4));
	}

	.rating-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.rating-number {
		font-size: 1.25rem;
		font-weight: 700;
		color: #fff;
	}

	.rating-text {
		color: #6b6b70;
		font-size: 0.85rem;
	}

	/* Mobile Responsive */
	@media (max-width: 640px) {
		.section-title {
			font-size: 1.75rem;
		}

		.testimonial-card {
			padding: 20px;
		}

		.rating-card {
			flex-direction: column;
			text-align: center;
			padding: 20px;
		}

		.rating-info {
			align-items: center;
		}

		.dot {
			min-width: 44px;
			min-height: 44px;
		}

		.dot.active {
			min-width: 44px;
		}
	}
</style>
