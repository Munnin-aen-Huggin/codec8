import { getAllPosts } from '$lib/utils/blog';
import { SEO_PAGES } from '$lib/data/seo-pages';
import type { RequestHandler } from './$types';

export const prerender = true;

const SITE = 'https://codec8.com';

const staticPages = [
	{ path: '/', priority: '1.0', changefreq: 'weekly' },
	{ path: '/try', priority: '0.8', changefreq: 'weekly' },
	{ path: '/blog', priority: '0.8', changefreq: 'daily' },
	{ path: '/generate-docs', priority: '0.9', changefreq: 'monthly' },
	{ path: '/beta', priority: '0.6', changefreq: 'monthly' },
	{ path: '/terms', priority: '0.3', changefreq: 'yearly' },
	{ path: '/privacy', priority: '0.3', changefreq: 'yearly' }
];

export const GET: RequestHandler = async () => {
	const posts = getAllPosts();

	const urls = [
		...staticPages.map(
			(p) => `  <url>
    <loc>${SITE}${p.path}</loc>
    <priority>${p.priority}</priority>
    <changefreq>${p.changefreq}</changefreq>
  </url>`
		),
		...SEO_PAGES.map(
			(p) => `  <url>
    <loc>${SITE}/generate-docs/${p.slug}</loc>
    <priority>0.8</priority>
    <changefreq>monthly</changefreq>
  </url>`
		),
		...posts.map(
			(post) => `  <url>
    <loc>${SITE}/blog/${post.slug}</loc>
    <lastmod>${post.date}</lastmod>
    <priority>0.7</priority>
    <changefreq>monthly</changefreq>
  </url>`
		)
	];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=3600'
		}
	});
};
