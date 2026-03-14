import { error } from '@sveltejs/kit';
import { getAllPosts, getPostBySlug, generateTableOfContents } from '$lib/utils/blog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const post = getPostBySlug(params.slug);
	if (!post) throw error(404, 'Post not found');

	const toc = generateTableOfContents(post.html);

	// Get related posts (same tags, excluding current)
	const allPosts = getAllPosts();
	const related = allPosts
		.filter((p) => p.slug !== post.slug && p.tags.some((t) => post.tags.includes(t)))
		.slice(0, 3)
		.map(({ html, content, ...rest }) => rest);

	return { post, toc, related };
};
