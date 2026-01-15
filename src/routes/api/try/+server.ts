/**
 * Demo API Endpoint - Try Without Signup
 *
 * Generates README documentation for public GitHub repositories
 * without requiring authentication. Limited to 1 demo per IP (ever).
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hashIP, isBlocked, checkDemoLimit, incrementDemoUsage } from '$lib/server/ratelimit';
import { isSuspiciousUA, getClientIP } from '$lib/server/botdetect';
import { trackEvent, trackTimedEvent, EVENTS } from '$lib/server/analytics';
import Anthropic from '@anthropic-ai/sdk';
import { ANTHROPIC_API_KEY } from '$env/static/private';

// Initialize Anthropic client
const anthropic = new Anthropic({
	apiKey: ANTHROPIC_API_KEY
});

// GitHub API base URL
const GITHUB_API_URL = 'https://api.github.com';

/**
 * Parse and validate GitHub URL
 * Returns owner and repo if valid, null otherwise
 */
function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
	if (!url || typeof url !== 'string') {
		return null;
	}

	// Clean the URL
	let cleanUrl = url.trim();

	// Handle various GitHub URL formats
	// https://github.com/owner/repo
	// http://github.com/owner/repo
	// github.com/owner/repo
	// github.com/owner/repo.git
	// https://github.com/owner/repo/tree/main/...

	// Remove trailing .git
	cleanUrl = cleanUrl.replace(/\.git$/, '');

	// Remove anything after the repo name (branches, files, etc)
	const pathMatch = cleanUrl.match(
		/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/
	);

	if (!pathMatch) {
		return null;
	}

	const owner = pathMatch[1];
	const repo = pathMatch[2];

	// Validate owner and repo names
	if (!owner || !repo || owner.length > 39 || repo.length > 100) {
		return null;
	}

	// GitHub usernames/org names cannot start with a hyphen
	if (owner.startsWith('-') || repo.startsWith('-')) {
		return null;
	}

	return { owner, repo };
}

/**
 * Get the next midnight UTC for rate limit reset message
 */
function getNextMidnightUTC(): string {
	const tomorrow = new Date();
	tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
	tomorrow.setUTCHours(0, 0, 0, 0);
	return tomorrow.toISOString();
}

/**
 * Fetch repository info from GitHub (unauthenticated)
 */
async function fetchRepoInfo(
	owner: string,
	repo: string
): Promise<{
	exists: boolean;
	isPrivate: boolean;
	description: string | null;
	language: string | null;
	defaultBranch: string;
} | null> {
	try {
		const response = await fetch(`${GITHUB_API_URL}/repos/${owner}/${repo}`, {
			headers: {
				Accept: 'application/vnd.github.v3+json',
				'User-Agent': 'CodeDoc-AI'
			}
		});

		if (!response.ok) {
			if (response.status === 404) {
				return { exists: false, isPrivate: false, description: null, language: null, defaultBranch: 'main' };
			}
			return null;
		}

		const data = await response.json();
		return {
			exists: true,
			isPrivate: data.private || false,
			description: data.description || null,
			language: data.language || null,
			defaultBranch: data.default_branch || 'main'
		};
	} catch {
		return null;
	}
}

/**
 * Fetch repository contents (root directory listing)
 */
async function fetchRepoContents(
	owner: string,
	repo: string,
	path: string = ''
): Promise<Array<{ name: string; type: string; path: string }> | null> {
	try {
		const response = await fetch(`${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${path}`, {
			headers: {
				Accept: 'application/vnd.github.v3+json',
				'User-Agent': 'CodeDoc-AI'
			}
		});

		if (!response.ok) {
			return null;
		}

		const data = await response.json();
		if (!Array.isArray(data)) {
			return null;
		}

		return data.map((item: { name: string; type: string; path: string }) => ({
			name: item.name,
			type: item.type,
			path: item.path
		}));
	} catch {
		return null;
	}
}

/**
 * Fetch file content from GitHub
 */
async function fetchFileContent(owner: string, repo: string, path: string): Promise<string | null> {
	try {
		const response = await fetch(`${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${path}`, {
			headers: {
				Accept: 'application/vnd.github.v3+json',
				'User-Agent': 'CodeDoc-AI'
			}
		});

		if (!response.ok) {
			return null;
		}

		const data = await response.json();
		if (data.content && data.encoding === 'base64') {
			return Buffer.from(data.content, 'base64').toString('utf-8');
		}
		return null;
	} catch {
		return null;
	}
}

/**
 * Build limited repo context for demo generation
 * Target: ~4000 tokens of context
 */
async function buildDemoContext(
	owner: string,
	repo: string,
	description: string | null,
	language: string | null
): Promise<string> {
	const contextParts: string[] = [];
	let totalLength = 0;
	const maxLength = 12000; // Roughly 4000 tokens (3 chars per token average)

	// Add basic info
	contextParts.push(`Repository: ${owner}/${repo}`);
	if (description) {
		contextParts.push(`Description: ${description}`);
	}
	if (language) {
		contextParts.push(`Primary Language: ${language}`);
	}
	contextParts.push('');

	// Fetch root directory listing
	const rootContents = await fetchRepoContents(owner, repo);
	if (rootContents) {
		const fileList = rootContents
			.map((item) => `${item.type === 'dir' ? item.name + '/' : item.name}`)
			.join('\n');
		contextParts.push('## Root Directory:\n```\n' + fileList + '\n```\n');
		totalLength += fileList.length;
	}

	// Fetch README.md if exists
	const readme = await fetchFileContent(owner, repo, 'README.md');
	if (readme && totalLength + readme.length < maxLength) {
		const truncatedReadme = readme.substring(0, 3000);
		contextParts.push('## Existing README.md:\n```\n' + truncatedReadme + '\n```\n');
		totalLength += truncatedReadme.length;
	}

	// Fetch manifest file (package.json, requirements.txt, etc.)
	const manifestFiles = [
		'package.json',
		'requirements.txt',
		'Cargo.toml',
		'go.mod',
		'pyproject.toml',
		'composer.json'
	];

	for (const manifest of manifestFiles) {
		if (totalLength >= maxLength) break;

		const content = await fetchFileContent(owner, repo, manifest);
		if (content) {
			const truncated = content.substring(0, 2000);
			contextParts.push(`## ${manifest}:\n\`\`\`\n${truncated}\n\`\`\`\n`);
			totalLength += truncated.length;
			break; // Only include first manifest found
		}
	}

	// Try to fetch a few source files
	if (totalLength < maxLength && rootContents) {
		const sourceDirs = rootContents.filter(
			(item) => item.type === 'dir' && ['src', 'lib', 'app', 'packages'].includes(item.name)
		);

		for (const dir of sourceDirs.slice(0, 1)) {
			if (totalLength >= maxLength) break;

			const dirContents = await fetchRepoContents(owner, repo, dir.path);
			if (dirContents) {
				const sourceFiles = dirContents
					.filter(
						(item) =>
							item.type === 'file' &&
							(item.name.endsWith('.ts') ||
								item.name.endsWith('.js') ||
								item.name.endsWith('.py') ||
								item.name.endsWith('.rs') ||
								item.name.endsWith('.go'))
					)
					.slice(0, 3);

				for (const file of sourceFiles) {
					if (totalLength >= maxLength) break;

					const content = await fetchFileContent(owner, repo, file.path);
					if (content) {
						const truncated = content.substring(0, 1500);
						contextParts.push(`## ${file.path}:\n\`\`\`\n${truncated}\n\`\`\`\n`);
						totalLength += truncated.length;
					}
				}
			}
		}
	}

	return contextParts.join('\n');
}

/**
 * Generate README using Claude
 */
async function generateReadme(
	owner: string,
	repo: string,
	context: string
): Promise<{ success: boolean; readme?: string; error?: string }> {
	try {
		const prompt = `You are an expert technical writer. Generate a professional, comprehensive README.md for the following GitHub repository.

${context}

## Instructions
Generate a well-structured README.md that includes:

1. **Title and Description** - Clear project name and compelling description
2. **Features** - Key features as bullet points (infer from code/structure)
3. **Installation** - Step-by-step installation instructions
4. **Usage** - Basic usage examples
5. **Tech Stack** - Technologies used (infer from dependencies)
6. **Contributing** - Brief contributing guidelines
7. **License** - MIT license (standard default)

Requirements:
- Format as valid Markdown
- Be concise but thorough
- Infer details from the code context provided
- Do NOT include any explanatory text outside the README content
- Start directly with the project title (# Project Name)`;

		const message = await anthropic.messages.create({
			model: 'claude-sonnet-4-20250514',
			max_tokens: 2000,
			messages: [
				{
					role: 'user',
					content: prompt
				}
			]
		});

		// Extract text content from response
		const textContent = message.content.find((block) => block.type === 'text');
		if (!textContent || textContent.type !== 'text') {
			return { success: false, error: 'No text content in response' };
		}

		return { success: true, readme: textContent.text };
	} catch (error) {
		console.error('Claude API error:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred'
		};
	}
}

export const POST: RequestHandler = async ({ request }) => {
	const startTime = Date.now();
	const anonymousId = request.headers.get('x-anonymous-id') || '';

	try {
		// STEP 1: Parse request body
		let body: { githubUrl?: string; fingerprint?: string };
		try {
			body = await request.json();
		} catch {
			return json({ error: 'invalid_json', message: 'Invalid JSON body' }, { status: 400 });
		}

		const { githubUrl, fingerprint } = body;

		// STEP 2: Validate GitHub URL format
		if (!githubUrl) {
			return json(
				{ error: 'missing_url', message: 'GitHub URL is required' },
				{ status: 400 }
			);
		}

		const parsed = parseGitHubUrl(githubUrl);
		if (!parsed) {
			return json(
				{
					error: 'invalid_url',
					message: 'Invalid GitHub URL. Expected format: https://github.com/owner/repo'
				},
				{ status: 400 }
			);
		}

		const { owner, repo } = parsed;

		// STEP 3: Anti-abuse checks
		const clientIP = getClientIP(request);
		const ipHash = hashIP(clientIP);
		const userAgent = request.headers.get('user-agent');

		// Check User-Agent for bots
		if (isSuspiciousUA(userAgent)) {
			return json(
				{ error: 'invalid_request', message: 'Invalid request' },
				{ status: 400 }
			);
		}

		// Check blocked list
		const blocked = await isBlocked(ipHash, fingerprint);
		if (blocked) {
			return json(
				{ error: 'blocked', message: 'Access restricted' },
				{ status: 403 }
			);
		}

		// STEP 4: Rate limiting (1 demo per IP ever)
		const { allowed } = await checkDemoLimit(ipHash);
		if (!allowed) {
			// Track rate limit hit
			await trackEvent(EVENTS.DEMO_LIMIT_REACHED, { repo_url: githubUrl }, undefined, anonymousId);
			return json(
				{
					error: 'limit_reached',
					message: 'You\'ve used your free demo. Get full access with all 4 doc types for just $99.',
					upgradeUrl: '/#pricing'
				},
				{ status: 429 }
			);
		}

		// STEP 5: Validate repository exists and is public
		const repoInfo = await fetchRepoInfo(owner, repo);
		if (!repoInfo) {
			// Track GitHub API error
			await trackEvent(EVENTS.DEMO_FAILED, { error_type: 'github_error', repo_url: githubUrl }, undefined, anonymousId);
			return json(
				{ error: 'github_error', message: 'Could not access GitHub. Please try again.' },
				{ status: 500 }
			);
		}

		if (!repoInfo.exists) {
			return json(
				{ error: 'repo_not_found', message: 'Repository not found. Please check the URL.' },
				{ status: 400 }
			);
		}

		if (repoInfo.isPrivate) {
			return json(
				{
					error: 'private_repo',
					message: 'Private repositories require authentication. Sign in to continue.'
				},
				{ status: 400 }
			);
		}

		// STEP 6: Fetch repo context (limited for cost control)
		const context = await buildDemoContext(owner, repo, repoInfo.description, repoInfo.language);

		// STEP 7: Generate README with Claude
		const result = await generateReadme(owner, repo, context);
		if (!result.success || !result.readme) {
			console.error('README generation failed:', result.error);
			// Track generation failure
			await trackEvent(EVENTS.DEMO_FAILED, { error_type: 'generation_failed', repo_url: githubUrl }, undefined, anonymousId);
			return json(
				{ error: 'generation_failed', message: 'Generation failed, please try again.' },
				{ status: 500 }
			);
		}

		// STEP 8: Record usage
		await incrementDemoUsage(ipHash, {
			repoUrl: githubUrl,
			userAgent: userAgent || '',
			fingerprint,
			isSuspicious: false
		});

		// Track successful demo completion with timing
		await trackTimedEvent(EVENTS.DEMO_COMPLETED, startTime, {
			repo_url: githubUrl,
			repo_owner: owner,
			repo_name: repo
		}, undefined, anonymousId);

		// STEP 9: Return result
		return json({
			readme: result.readme,
			repoName: `${owner}/${repo}`,
			generationsRemaining: 0
		});
	} catch (error) {
		console.error('Unexpected error in demo endpoint:', error);
		return json(
			{ error: 'server_error', message: 'An unexpected error occurred. Please try again.' },
			{ status: 500 }
		);
	}
};
