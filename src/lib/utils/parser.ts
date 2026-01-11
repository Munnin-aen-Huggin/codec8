/**
 * Code Parsing Utilities for Repository Analysis
 *
 * Fetches and analyzes repository contents to build context
 * for AI documentation generation.
 */

import { fetchRepoTree, fetchFileContent } from '$lib/server/github';

/**
 * Represents a file with its content for context building
 */
export interface FileContext {
	path: string;
	content: string;
	language?: string;
}

/**
 * Complete repository context for documentation generation
 */
export interface RepoContext {
	repoName: string;
	fullName: string;
	description: string | null;
	language: string | null;
	framework: string | null;
	packageJson: PackageJson | null;
	fileTree: string;
	keyFiles: FileContext[];
	routeFiles: FileContext[];
	envExample: string | null;
}

/**
 * Simplified package.json structure
 */
interface PackageJson {
	name?: string;
	version?: string;
	description?: string;
	scripts?: Record<string, string>;
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
	main?: string;
	type?: string;
}

/**
 * Key files to look for in repositories
 */
const KEY_FILE_PATTERNS = [
	'package.json',
	'tsconfig.json',
	'vite.config.ts',
	'vite.config.js',
	'svelte.config.js',
	'next.config.js',
	'next.config.mjs',
	'nuxt.config.ts',
	'angular.json',
	'Cargo.toml',
	'go.mod',
	'requirements.txt',
	'pyproject.toml',
	'Gemfile',
	'composer.json',
	'.env.example',
	'.env.sample',
	'docker-compose.yml',
	'Dockerfile'
];

/**
 * Route file patterns for API documentation
 */
const ROUTE_PATTERNS = [
	/^src\/routes\/.*\+server\.(ts|js)$/,
	/^src\/routes\/api\/.*\.(ts|js)$/,
	/^pages\/api\/.*\.(ts|js|tsx|jsx)$/,
	/^app\/api\/.*\/route\.(ts|js)$/,
	/^routes\/.*\.(ts|js)$/,
	/^controllers\/.*\.(ts|js)$/,
	/^api\/.*\.(ts|js|py)$/
];

/**
 * File extensions to language mapping
 */
const EXT_TO_LANGUAGE: Record<string, string> = {
	'.ts': 'typescript',
	'.tsx': 'typescript',
	'.js': 'javascript',
	'.jsx': 'javascript',
	'.py': 'python',
	'.rs': 'rust',
	'.go': 'go',
	'.rb': 'ruby',
	'.java': 'java',
	'.php': 'php',
	'.swift': 'swift',
	'.kt': 'kotlin',
	'.json': 'json',
	'.yaml': 'yaml',
	'.yml': 'yaml',
	'.toml': 'toml',
	'.md': 'markdown',
	'.svelte': 'svelte',
	'.vue': 'vue'
};

/**
 * Get language from file path
 */
function getLanguage(path: string): string | undefined {
	const ext = path.substring(path.lastIndexOf('.'));
	return EXT_TO_LANGUAGE[ext];
}

/**
 * Detect framework from package.json dependencies
 */
export function detectFramework(packageJson: PackageJson | null): string | null {
	if (!packageJson) return null;

	const deps = {
		...packageJson.dependencies,
		...packageJson.devDependencies
	};

	// Check in order of specificity
	if (deps['@sveltejs/kit']) return 'SvelteKit';
	if (deps['svelte']) return 'Svelte';
	if (deps['next']) return 'Next.js';
	if (deps['nuxt']) return 'Nuxt';
	if (deps['@angular/core']) return 'Angular';
	if (deps['vue']) return 'Vue.js';
	if (deps['react']) return 'React';
	if (deps['express']) return 'Express';
	if (deps['fastify']) return 'Fastify';
	if (deps['koa']) return 'Koa';
	if (deps['hono']) return 'Hono';
	if (deps['nestjs'] || deps['@nestjs/core']) return 'NestJS';

	return null;
}

/**
 * Identify key files from file tree
 */
export function identifyKeyFiles(
	tree: { path: string; type: string }[]
): string[] {
	const keyFiles: string[] = [];

	for (const item of tree) {
		if (item.type !== 'blob') continue;

		const fileName = item.path.split('/').pop() || '';

		// Check if it's a key file
		if (KEY_FILE_PATTERNS.includes(fileName)) {
			keyFiles.push(item.path);
		}

		// Check for root-level important files
		if (item.path.split('/').length === 1) {
			if (
				fileName.endsWith('.config.js') ||
				fileName.endsWith('.config.ts') ||
				fileName.endsWith('.config.mjs')
			) {
				keyFiles.push(item.path);
			}
		}
	}

	return keyFiles;
}

/**
 * Identify route files for API documentation
 */
export function identifyRouteFiles(
	tree: { path: string; type: string }[]
): string[] {
	const routeFiles: string[] = [];

	for (const item of tree) {
		if (item.type !== 'blob') continue;

		for (const pattern of ROUTE_PATTERNS) {
			if (pattern.test(item.path)) {
				routeFiles.push(item.path);
				break;
			}
		}
	}

	return routeFiles;
}

/**
 * Build a visual file tree string from tree data
 */
export function buildFileTree(
	tree: { path: string; type: string }[],
	maxDepth: number = 4
): string {
	const lines: string[] = [];
	const seen = new Set<string>();

	// Sort by path for consistent output
	const sorted = [...tree].sort((a, b) => a.path.localeCompare(b.path));

	for (const item of sorted) {
		const parts = item.path.split('/');

		// Skip if too deep
		if (parts.length > maxDepth) continue;

		// Skip hidden files/directories (except .env.example)
		if (
			parts.some(
				(p) =>
					p.startsWith('.') &&
					!p.startsWith('.env') &&
					p !== '.github'
			)
		) {
			continue;
		}

		// Skip common non-essential directories
		if (
			parts.some((p) =>
				['node_modules', 'dist', 'build', '.git', '.svelte-kit', '.next', '__pycache__', 'venv', '.venv'].includes(p)
			)
		) {
			continue;
		}

		// Add intermediate directories
		for (let i = 0; i < parts.length - 1; i++) {
			const dirPath = parts.slice(0, i + 1).join('/');
			if (!seen.has(dirPath)) {
				seen.add(dirPath);
				const indent = '  '.repeat(i);
				lines.push(`${indent}${parts[i]}/`);
			}
		}

		// Add the file/directory
		if (!seen.has(item.path)) {
			seen.add(item.path);
			const indent = '  '.repeat(parts.length - 1);
			const suffix = item.type === 'tree' ? '/' : '';
			lines.push(`${indent}${parts[parts.length - 1]}${suffix}`);
		}
	}

	return lines.join('\n');
}

/**
 * Fetch file content with size limit
 */
async function fetchFileWithLimit(
	token: string,
	owner: string,
	repo: string,
	path: string,
	maxSize: number = 50000
): Promise<string | null> {
	try {
		const content = await fetchFileContent(token, owner, repo, path);
		// Truncate if too large
		if (content.length > maxSize) {
			return content.substring(0, maxSize) + '\n\n... (truncated)';
		}
		return content;
	} catch {
		return null;
	}
}

/**
 * Fetch complete repository context for documentation generation
 */
export async function fetchRepoContext(
	token: string,
	repoFullName: string,
	repoDescription: string | null,
	repoLanguage: string | null,
	defaultBranch: string = 'main'
): Promise<RepoContext> {
	const [owner, repo] = repoFullName.split('/');

	// Fetch the complete file tree
	let tree: { path: string; type: string }[] = [];
	try {
		tree = await fetchRepoTree(token, owner, repo, defaultBranch);
	} catch (error) {
		// Try 'master' if 'main' fails
		if (defaultBranch === 'main') {
			try {
				tree = await fetchRepoTree(token, owner, repo, 'master');
			} catch {
				console.error('Failed to fetch repo tree:', error);
			}
		}
	}

	// Identify important files
	const keyFilePaths = identifyKeyFiles(tree);
	const routeFilePaths = identifyRouteFiles(tree);

	// Fetch package.json first (needed for framework detection)
	let packageJson: PackageJson | null = null;
	const packageJsonPath = keyFilePaths.find((p) => p.endsWith('package.json'));
	if (packageJsonPath) {
		const content = await fetchFileWithLimit(token, owner, repo, packageJsonPath);
		if (content) {
			try {
				packageJson = JSON.parse(content);
			} catch {
				console.error('Failed to parse package.json');
			}
		}
	}

	// Detect framework
	const framework = detectFramework(packageJson);

	// Fetch key files (limit to prevent context overflow)
	const keyFiles: FileContext[] = [];
	const keyFilesToFetch = keyFilePaths.filter((p) => !p.endsWith('package.json')).slice(0, 5);

	for (const path of keyFilesToFetch) {
		const content = await fetchFileWithLimit(token, owner, repo, path, 20000);
		if (content) {
			keyFiles.push({
				path,
				content,
				language: getLanguage(path)
			});
		}
	}

	// Fetch route files (limit to prevent context overflow)
	const routeFiles: FileContext[] = [];
	const routeFilesToFetch = routeFilePaths.slice(0, 10);

	for (const path of routeFilesToFetch) {
		const content = await fetchFileWithLimit(token, owner, repo, path, 15000);
		if (content) {
			routeFiles.push({
				path,
				content,
				language: getLanguage(path)
			});
		}
	}

	// Try to fetch .env.example
	let envExample: string | null = null;
	const envExamplePath = keyFilePaths.find(
		(p) => p.includes('.env.example') || p.includes('.env.sample')
	);
	if (envExamplePath) {
		envExample = await fetchFileWithLimit(token, owner, repo, envExamplePath, 5000);
	}

	// Build file tree visualization
	const fileTree = buildFileTree(tree);

	return {
		repoName: repo,
		fullName: repoFullName,
		description: repoDescription,
		language: repoLanguage,
		framework,
		packageJson,
		fileTree,
		keyFiles,
		routeFiles,
		envExample
	};
}
