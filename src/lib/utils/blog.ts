import { marked } from 'marked';

export interface BlogPost {
	slug: string;
	title: string;
	description: string;
	date: string;
	author: string;
	tags: string[];
	readingTime: number;
	published: boolean;
	content: string;
	html: string;
}

export interface TOCEntry {
	id: string;
	text: string;
	level: number;
}

export function parseFrontmatter(raw: string): { metadata: Record<string, unknown>; content: string } {
	const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
	if (!match) return { metadata: {}, content: raw };

	const yamlBlock = match[1];
	const content = match[2].trim();
	const metadata: Record<string, unknown> = {};

	for (const line of yamlBlock.split('\n')) {
		const colonIdx = line.indexOf(':');
		if (colonIdx === -1) continue;
		const key = line.slice(0, colonIdx).trim();
		let value: unknown = line.slice(colonIdx + 1).trim();

		// Remove surrounding quotes
		if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
			value = (value as string).slice(1, -1);
		}

		// Parse arrays: [item1, item2]
		if (typeof value === 'string' && (value as string).startsWith('[') && (value as string).endsWith(']')) {
			value = (value as string)
				.slice(1, -1)
				.split(',')
				.map((s) => s.trim().replace(/^["']|["']$/g, ''));
		}

		// Parse booleans
		if (value === 'true') value = true;
		if (value === 'false') value = false;

		metadata[key] = value;
	}

	return { metadata, content };
}

export function calculateReadingTime(content: string): number {
	const words = content.split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.ceil(words / 200));
}

export function generateTableOfContents(html: string): TOCEntry[] {
	const entries: TOCEntry[] = [];
	const regex = /<h([23])\s+id="([^"]*)"[^>]*>([\s\S]*?)<\/h[23]>/gi;
	let match;

	while ((match = regex.exec(html)) !== null) {
		entries.push({
			level: parseInt(match[1]),
			id: match[2],
			text: match[3].replace(/<[^>]+>/g, '').trim()
		});
	}

	return entries;
}

function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/<[^>]+>/g, '')
		.replace(/[^\w\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.trim();
}

export function getAllPosts(): BlogPost[] {
	const modules = import.meta.glob('/src/content/blog/*.md', { as: 'raw', eager: true });
	const posts: BlogPost[] = [];

	for (const [path, raw] of Object.entries(modules)) {
		const slug = path.split('/').pop()!.replace('.md', '');
		const { metadata, content } = parseFrontmatter(raw as string);

		if (metadata.published === false) continue;

		// Configure marked to add IDs to headings
		const renderer = new marked.Renderer();
		renderer.heading = function ({ text, depth }: { text: string; depth: number }) {
			const id = slugify(text);
			return `<h${depth} id="${id}">${text}</h${depth}>`;
		};

		const html = marked.parse(content, { renderer }) as string;
		const readingTime = calculateReadingTime(content);

		posts.push({
			slug,
			title: (metadata.title as string) || slug,
			description: (metadata.description as string) || '',
			date: (metadata.date as string) || '',
			author: (metadata.author as string) || 'Codec8 Team',
			tags: (metadata.tags as string[]) || [],
			readingTime,
			published: metadata.published !== false,
			content,
			html
		});
	}

	return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | undefined {
	return getAllPosts().find((p) => p.slug === slug);
}
