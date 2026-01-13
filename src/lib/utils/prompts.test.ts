import { describe, it, expect } from 'vitest';
import {
	buildReadmePrompt,
	buildApiPrompt,
	buildArchitecturePrompt,
	buildSetupPrompt,
	promptBuilders
} from './prompts';
import type { RepoContext } from './parser';

// Mock RepoContext for testing
const createMockContext = (overrides: Partial<RepoContext> = {}): RepoContext => ({
	repoName: 'test-repo',
	fullName: 'user/test-repo',
	description: 'A test repository',
	language: 'TypeScript',
	framework: 'SvelteKit',
	packageJson: {
		name: 'test-repo',
		version: '1.0.0',
		scripts: {
			dev: 'vite dev',
			build: 'vite build'
		},
		dependencies: {
			svelte: '^4.0.0'
		},
		devDependencies: {
			typescript: '^5.0.0'
		}
	},
	fileTree: 'src/\n  routes/\n    +page.svelte\n  lib/\n    utils.ts',
	keyFiles: [
		{
			path: 'src/lib/utils.ts',
			content: 'export function helper() { return true; }',
			language: 'typescript'
		}
	],
	routeFiles: [
		{
			path: 'src/routes/api/users/+server.ts',
			content: 'export const GET = async () => { return new Response("ok"); }',
			language: 'typescript'
		}
	],
	envExample: 'DATABASE_URL=postgresql://localhost:5432/db\nAPI_KEY=your-api-key',
	...overrides
});

describe('buildReadmePrompt', () => {
	it('should include repo name in output', () => {
		const context = createMockContext({ repoName: 'my-awesome-project' });
		const prompt = buildReadmePrompt(context);
		expect(prompt).toContain('my-awesome-project');
	});

	it('should include description when provided', () => {
		const context = createMockContext({ description: 'A fantastic library' });
		const prompt = buildReadmePrompt(context);
		expect(prompt).toContain('A fantastic library');
	});

	it('should use fallback text when description is null', () => {
		const context = createMockContext({ description: null });
		const prompt = buildReadmePrompt(context);
		expect(prompt).toContain('No description provided');
	});

	it('should include package.json content when provided', () => {
		const context = createMockContext();
		const prompt = buildReadmePrompt(context);
		expect(prompt).toContain('"name": "test-repo"');
		expect(prompt).toContain('"version": "1.0.0"');
	});

	it('should handle null packageJson', () => {
		const context = createMockContext({ packageJson: null });
		const prompt = buildReadmePrompt(context);
		expect(prompt).toContain('Not available');
	});

	it('should include file tree', () => {
		const context = createMockContext({ fileTree: 'src/\n  index.ts\n  utils.ts' });
		const prompt = buildReadmePrompt(context);
		expect(prompt).toContain('src/');
		expect(prompt).toContain('index.ts');
	});

	it('should include key files with proper formatting', () => {
		const context = createMockContext({
			keyFiles: [
				{ path: 'config.ts', content: 'export const config = {};', language: 'typescript' }
			]
		});
		const prompt = buildReadmePrompt(context);
		expect(prompt).toContain('### config.ts');
		expect(prompt).toContain('```typescript');
		expect(prompt).toContain('export const config = {};');
	});

	it('should contain all required README sections', () => {
		const context = createMockContext();
		const prompt = buildReadmePrompt(context);

		// Check for instruction sections
		expect(prompt).toContain('Title and Badges');
		expect(prompt).toContain('Description');
		expect(prompt).toContain('Features');
		expect(prompt).toContain('Tech Stack');
		expect(prompt).toContain('Prerequisites');
		expect(prompt).toContain('Installation');
		expect(prompt).toContain('Usage');
		expect(prompt).toContain('API Reference');
		expect(prompt).toContain('Configuration');
		expect(prompt).toContain('Contributing');
		expect(prompt).toContain('License');
	});

	it('should include framework when provided', () => {
		const context = createMockContext({ framework: 'Next.js' });
		const prompt = buildReadmePrompt(context);
		expect(prompt).toContain('Next.js');
	});

	it('should handle null framework', () => {
		const context = createMockContext({ framework: null });
		const prompt = buildReadmePrompt(context);
		expect(prompt).toContain('**Framework:** Unknown');
	});
});

describe('buildApiPrompt', () => {
	it('should include route files with proper code blocks', () => {
		const context = createMockContext({
			routeFiles: [
				{
					path: 'src/routes/api/users/+server.ts',
					content: 'export const GET = async () => { return json([]); }',
					language: 'typescript'
				}
			]
		});
		const prompt = buildApiPrompt(context);
		expect(prompt).toContain('### src/routes/api/users/+server.ts');
		expect(prompt).toContain('```typescript');
		expect(prompt).toContain('export const GET');
	});

	it('should contain endpoint documentation instructions', () => {
		const context = createMockContext();
		const prompt = buildApiPrompt(context);

		expect(prompt).toContain('HTTP Method and Path');
		expect(prompt).toContain('Request Parameters');
		expect(prompt).toContain('Response format');
		expect(prompt).toContain('error responses');
	});

	it('should handle empty route files gracefully', () => {
		const context = createMockContext({ routeFiles: [] });
		const prompt = buildApiPrompt(context);
		expect(prompt).toContain('Route/API Files');
		// Should still be a valid prompt
		expect(prompt).toContain('Generate professional API documentation');
	});

	it('should include repo name', () => {
		const context = createMockContext({ repoName: 'api-service' });
		const prompt = buildApiPrompt(context);
		expect(prompt).toContain('api-service');
	});

	it('should include additional context files', () => {
		const context = createMockContext({
			keyFiles: [
				{ path: 'types.ts', content: 'export interface User {}', language: 'typescript' }
			]
		});
		const prompt = buildApiPrompt(context);
		expect(prompt).toContain('Additional Context Files');
	});
});

describe('buildArchitecturePrompt', () => {
	it('should contain Mermaid diagram instructions', () => {
		const context = createMockContext();
		const prompt = buildArchitecturePrompt(context);

		expect(prompt).toContain('```mermaid');
		expect(prompt).toContain('flowchart TD');
		expect(prompt).toContain('sequenceDiagram');
		expect(prompt).toContain('erDiagram');
	});

	it('should include dependencies from package.json', () => {
		const context = createMockContext({
			packageJson: {
				dependencies: { express: '^4.18.0' },
				devDependencies: { typescript: '^5.0.0' }
			}
		});
		const prompt = buildArchitecturePrompt(context);
		expect(prompt).toContain('express');
		expect(prompt).toContain('typescript');
	});

	it('should contain architecture section keywords', () => {
		const context = createMockContext();
		const prompt = buildArchitecturePrompt(context);

		expect(prompt).toContain('System Overview');
		expect(prompt).toContain('Architecture Diagram');
		expect(prompt).toContain('Component Breakdown');
		expect(prompt).toContain('Data Flow Diagram');
		expect(prompt).toContain('Directory Structure');
		expect(prompt).toContain('Key Design Decisions');
		expect(prompt).toContain('External Dependencies');
		expect(prompt).toContain('Database Schema');
	});

	it('should handle null packageJson', () => {
		const context = createMockContext({ packageJson: null });
		const prompt = buildArchitecturePrompt(context);
		expect(prompt).toContain('Not available');
	});

	it('should include file tree', () => {
		const context = createMockContext({ fileTree: 'src/\n  components/\n  utils/' });
		const prompt = buildArchitecturePrompt(context);
		expect(prompt).toContain('src/');
		expect(prompt).toContain('components/');
	});
});

describe('buildSetupPrompt', () => {
	it('should include environment variables section', () => {
		const context = createMockContext({
			envExample: 'DATABASE_URL=postgres://localhost\nSECRET_KEY=xxx'
		});
		const prompt = buildSetupPrompt(context);
		expect(prompt).toContain('DATABASE_URL');
		expect(prompt).toContain('SECRET_KEY');
	});

	it('should contain setup instructions', () => {
		const context = createMockContext();
		const prompt = buildSetupPrompt(context);

		expect(prompt).toContain('Prerequisites');
		expect(prompt).toContain('Quick Start');
		expect(prompt).toContain('Environment Configuration');
		expect(prompt).toContain('Database Setup');
		expect(prompt).toContain('Development Workflow');
		expect(prompt).toContain('Building for Production');
		expect(prompt).toContain('Deployment');
		expect(prompt).toContain('Troubleshooting');
	});

	it('should handle missing envExample gracefully', () => {
		const context = createMockContext({ envExample: null });
		const prompt = buildSetupPrompt(context);
		expect(prompt).toContain('No .env.example found');
	});

	it('should include package.json scripts', () => {
		const context = createMockContext({
			packageJson: {
				scripts: {
					dev: 'vite dev',
					build: 'vite build',
					test: 'vitest'
				}
			}
		});
		const prompt = buildSetupPrompt(context);
		expect(prompt).toContain('vite dev');
		expect(prompt).toContain('vite build');
	});

	it('should include repo name and language', () => {
		const context = createMockContext({
			repoName: 'my-app',
			language: 'Python'
		});
		const prompt = buildSetupPrompt(context);
		expect(prompt).toContain('my-app');
		expect(prompt).toContain('Python');
	});
});

describe('promptBuilders', () => {
	it('should map readme to buildReadmePrompt', () => {
		expect(promptBuilders.readme).toBe(buildReadmePrompt);
	});

	it('should map api to buildApiPrompt', () => {
		expect(promptBuilders.api).toBe(buildApiPrompt);
	});

	it('should map architecture to buildArchitecturePrompt', () => {
		expect(promptBuilders.architecture).toBe(buildArchitecturePrompt);
	});

	it('should map setup to buildSetupPrompt', () => {
		expect(promptBuilders.setup).toBe(buildSetupPrompt);
	});

	it('should have all four doc types present', () => {
		const keys = Object.keys(promptBuilders);
		expect(keys).toContain('readme');
		expect(keys).toContain('api');
		expect(keys).toContain('architecture');
		expect(keys).toContain('setup');
		expect(keys).toHaveLength(4);
	});

	it('should have all builders as functions', () => {
		expect(typeof promptBuilders.readme).toBe('function');
		expect(typeof promptBuilders.api).toBe('function');
		expect(typeof promptBuilders.architecture).toBe('function');
		expect(typeof promptBuilders.setup).toBe('function');
	});
});
