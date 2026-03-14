import { SEO_PAGES, LANGUAGE_PAGES, FRAMEWORK_PAGES } from '$lib/data/seo-pages';

export const prerender = true;

export async function load() {
	return {
		languages: LANGUAGE_PAGES,
		frameworks: FRAMEWORK_PAGES,
		total: SEO_PAGES.length
	};
}
