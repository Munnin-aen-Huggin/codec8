import { getAllPosts } from '$lib/utils/blog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const posts = getAllPosts().map(({ html, content, ...rest }) => rest);
	return { posts };
};
