<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	const allTestimonials = [
		{
			quote: "Saved me 8 hours on my side project. The README it generated was better than what I would have written myself.",
			author: "Alex Chen",
			handle: "@alexdev",
			role: "Solo Developer",
			avatar: "A"
		},
		{
			quote: "Finally, docs that actually get written. My team loves how easy it is to keep everything up to date.",
			author: "Sarah Miller",
			handle: "@indie_sarah",
			role: "Engineering Lead",
			avatar: "S"
		},
		{
			quote: "Worth 10x the price. We documented 15 repos in one afternoon.",
			author: "Mike Johnson",
			handle: "@startup_mike",
			role: "CTO, TechStartup",
			avatar: "M"
		},
		{
			quote: "The architecture diagrams are incredibly accurate. Saved our onboarding time by 50%.",
			author: "David Park",
			handle: "@davidbuilds",
			role: "VP Engineering",
			avatar: "D"
		},
		{
			quote: "Our team's documentation debt is finally gone. This should be standard for every company.",
			author: "Emma Wilson",
			handle: "@emma_codes",
			role: "Technical Writer",
			avatar: "E"
		},
		{
			quote: "The API docs it generates are production-ready. Our developers love it.",
			author: "James Rodriguez",
			handle: "@jamesdev",
			role: "Backend Lead",
			avatar: "J"
		},
		{
			quote: "Setup guides that actually work! No more outdated instructions.",
			author: "Lisa Thompson",
			handle: "@lisa_tech",
			role: "DevOps Engineer",
			avatar: "L"
		},
		{
			quote: "I was skeptical at first, but the quality blew me away. Using it for all my projects now.",
			author: "Ryan Cooper",
			handle: "@ryanbuilds",
			role: "Indie Hacker",
			avatar: "R"
		},
		{
			quote: "Perfect for open source projects. Contributors can actually understand our codebase now.",
			author: "Nina Patel",
			handle: "@ninaoss",
			role: "Open Source Maintainer",
			avatar: "N"
		}
	];

	let currentPage = 0;
	const testimonialsPerPage = 3;
	const totalPages = Math.ceil(allTestimonials.length / testimonialsPerPage);
	let interval: ReturnType<typeof setInterval>;

	$: visibleTestimonials = allTestimonials.slice(
		currentPage * testimonialsPerPage,
		(currentPage + 1) * testimonialsPerPage
	);

	function nextPage() {
		currentPage = (currentPage + 1) % totalPages;
	}

	function goToPage(page: number) {
		currentPage = page;
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
		<h2 class="section-title">Loved by Developers</h2>

		<!-- Testimonial Cards -->
		<div class="testimonials-grid">
			{#each visibleTestimonials as testimonial (testimonial.handle)}
				<div class="testimonial-card">
					<div class="quote-icon">"</div>
					<p class="quote">{testimonial.quote}</p>
					<div class="author">
						<div class="avatar">{testimonial.avatar}</div>
						<div class="author-info">
							<span class="author-name">{testimonial.author}</span>
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

	.section-title {
		text-align: center;
		font-size: 2rem;
		font-weight: 700;
		color: #fff;
		margin-bottom: 40px;
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

	.author-role {
		color: #6b6b70;
		font-size: 0.85rem;
	}

	.pagination {
		display: flex;
		justify-content: center;
		gap: 8px;
		margin-bottom: 32px;
	}

	.dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: #3a3a3c;
		border: none;
		cursor: pointer;
		transition: all 0.3s;
		padding: 0;
	}

	.dot:hover {
		background: #6b6b70;
	}

	.dot.active {
		background: #10b981;
		width: 24px;
		border-radius: 5px;
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
