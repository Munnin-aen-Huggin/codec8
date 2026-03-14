<script lang="ts">
	export let heading: string = 'Generate docs for your repo in 60 seconds';
	export let description: string = 'README, API docs, architecture diagrams, and setup guides — from your actual code.';
</script>

<div class="blog-cta">
	<h3>{heading}</h3>
	<p>{description}</p>
	<a href="/try" class="cta-button">Try Codec8 Free</a>
</div>

<style>
	.blog-cta {
		margin: 2.5rem 0;
		padding: 2rem;
		background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.08));
		border: 1px solid rgba(99, 102, 241, 0.25);
		border-radius: 12px;
		text-align: center;
	}
	h3 {
		font-size: 1.25rem;
		font-weight: 700;
		color: #fff;
		margin: 0 0 0.5rem;
	}
	p {
		font-size: 0.95rem;
		color: rgba(255, 255, 255, 0.6);
		margin: 0 0 1.25rem;
	}
	.cta-button {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		background: linear-gradient(135deg, #6366f1, #8b5cf6);
		color: #fff;
		font-weight: 600;
		font-size: 0.95rem;
		border-radius: 8px;
		text-decoration: none;
		transition: opacity 0.2s;
	}
	.cta-button:hover {
		opacity: 0.9;
	}
</style>
