import { error } from '@sveltejs/kit';
import { SEO_PAGES } from '$lib/data/seo-pages';

export const prerender = true;

export async function load({ params }) {
	const page = SEO_PAGES.find((p) => p.slug === params.slug);
	if (!page) throw error(404, 'Not found');
	return { page };
}

export function entries() {
	return SEO_PAGES.map((p) => ({ slug: p.slug }));
}
