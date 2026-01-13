import { describe, it, expect } from 'vitest';
import { detectFramework, identifyKeyFiles, identifyRouteFiles, buildFileTree } from './parser';

describe('detectFramework', () => {
	describe('null/empty input', () => {
		it('should return null for null packageJson', () => {
			expect(detectFramework(null)).toBe(null);
		});

		it('should return null for empty dependencies', () => {
			expect(detectFramework({})).toBe(null);
		});

		it('should return null when no known framework detected', () => {
			expect(
				detectFramework({
					dependencies: {
						lodash: '^4.0.0',
						moment: '^2.0.0'
					}
				})
			).toBe(null);
		});
	});

	describe('SvelteKit detection', () => {
		it('should return SvelteKit when @sveltejs/kit present', () => {
			expect(
				detectFramework({
					dependencies: {
						'@sveltejs/kit': '^2.0.0',
						svelte: '^4.0.0'
					}
				})
			).toBe('SvelteKit');
		});

		it('should prioritize SvelteKit over plain Svelte', () => {
			expect(
				detectFramework({
					dependencies: { svelte: '^4.0.0' },
					devDependencies: { '@sveltejs/kit': '^2.0.0' }
				})
			).toBe('SvelteKit');
		});
	});

	describe('Svelte detection', () => {
		it('should return Svelte when only svelte present', () => {
			expect(
				detectFramework({
					dependencies: { svelte: '^4.0.0' }
				})
			).toBe('Svelte');
		});
	});

	describe('Next.js detection', () => {
		it('should return Next.js when next present', () => {
			expect(
				detectFramework({
					dependencies: {
						next: '^14.0.0',
						react: '^18.0.0'
					}
				})
			).toBe('Next.js');
		});

		it('should prioritize Next.js over plain React', () => {
			expect(
				detectFramework({
					dependencies: {
						react: '^18.0.0',
						next: '^14.0.0'
					}
				})
			).toBe('Next.js');
		});
	});

	describe('React detection', () => {
		it('should return React when only react present', () => {
			expect(
				detectFramework({
					dependencies: { react: '^18.0.0' }
				})
			).toBe('React');
		});
	});

	describe('Vue detection', () => {
		it('should return Vue.js when vue present', () => {
			expect(
				detectFramework({
					dependencies: { vue: '^3.0.0' }
				})
			).toBe('Vue.js');
		});
	});

	describe('Nuxt detection', () => {
		it('should return Nuxt when nuxt present', () => {
			expect(
				detectFramework({
					dependencies: { nuxt: '^3.0.0' }
				})
			).toBe('Nuxt');
		});

		it('should prioritize Nuxt over Vue', () => {
			expect(
				detectFramework({
					dependencies: {
						vue: '^3.0.0',
						nuxt: '^3.0.0'
					}
				})
			).toBe('Nuxt');
		});
	});

	describe('Angular detection', () => {
		it('should return Angular when @angular/core present', () => {
			expect(
				detectFramework({
					dependencies: { '@angular/core': '^17.0.0' }
				})
			).toBe('Angular');
		});
	});

	describe('Express detection', () => {
		it('should return Express for express backend', () => {
			expect(
				detectFramework({
					dependencies: { express: '^4.18.0' }
				})
			).toBe('Express');
		});
	});

	describe('other backend frameworks', () => {
		it('should detect Fastify', () => {
			expect(
				detectFramework({
					dependencies: { fastify: '^4.0.0' }
				})
			).toBe('Fastify');
		});

		it('should detect Koa', () => {
			expect(
				detectFramework({
					dependencies: { koa: '^2.0.0' }
				})
			).toBe('Koa');
		});

		it('should detect Hono', () => {
			expect(
				detectFramework({
					dependencies: { hono: '^3.0.0' }
				})
			).toBe('Hono');
		});

		it('should detect NestJS from @nestjs/core', () => {
			expect(
				detectFramework({
					dependencies: { '@nestjs/core': '^10.0.0' }
				})
			).toBe('NestJS');
		});
	});

	describe('devDependencies', () => {
		it('should check devDependencies too', () => {
			expect(
				detectFramework({
					devDependencies: { '@sveltejs/kit': '^2.0.0' }
				})
			).toBe('SvelteKit');
		});
	});
});

describe('identifyKeyFiles', () => {
	describe('root config files', () => {
		it('should identify package.json in root', () => {
			const tree = [{ path: 'package.json', type: 'blob' }];
			expect(identifyKeyFiles(tree)).toContain('package.json');
		});

		it('should identify tsconfig.json', () => {
			const tree = [{ path: 'tsconfig.json', type: 'blob' }];
			expect(identifyKeyFiles(tree)).toContain('tsconfig.json');
		});

		it('should identify vite.config.ts', () => {
			const tree = [{ path: 'vite.config.ts', type: 'blob' }];
			expect(identifyKeyFiles(tree)).toContain('vite.config.ts');
		});

		it('should identify svelte.config.js', () => {
			const tree = [{ path: 'svelte.config.js', type: 'blob' }];
			expect(identifyKeyFiles(tree)).toContain('svelte.config.js');
		});

		it('should identify next.config.js', () => {
			const tree = [{ path: 'next.config.js', type: 'blob' }];
			expect(identifyKeyFiles(tree)).toContain('next.config.js');
		});

		it('should identify next.config.mjs', () => {
			const tree = [{ path: 'next.config.mjs', type: 'blob' }];
			expect(identifyKeyFiles(tree)).toContain('next.config.mjs');
		});
	});

	describe('environment files', () => {
		it('should identify .env.example', () => {
			const tree = [{ path: '.env.example', type: 'blob' }];
			expect(identifyKeyFiles(tree)).toContain('.env.example');
		});

		it('should identify .env.sample', () => {
			const tree = [{ path: '.env.sample', type: 'blob' }];
			expect(identifyKeyFiles(tree)).toContain('.env.sample');
		});
	});

	describe('docker files', () => {
		it('should identify docker-compose.yml', () => {
			const tree = [{ path: 'docker-compose.yml', type: 'blob' }];
			expect(identifyKeyFiles(tree)).toContain('docker-compose.yml');
		});

		it('should identify Dockerfile', () => {
			const tree = [{ path: 'Dockerfile', type: 'blob' }];
			expect(identifyKeyFiles(tree)).toContain('Dockerfile');
		});
	});

	describe('non-JS ecosystems', () => {
		it('should identify Cargo.toml for Rust', () => {
			const tree = [{ path: 'Cargo.toml', type: 'blob' }];
			expect(identifyKeyFiles(tree)).toContain('Cargo.toml');
		});

		it('should identify go.mod for Go', () => {
			const tree = [{ path: 'go.mod', type: 'blob' }];
			expect(identifyKeyFiles(tree)).toContain('go.mod');
		});

		it('should identify requirements.txt for Python', () => {
			const tree = [{ path: 'requirements.txt', type: 'blob' }];
			expect(identifyKeyFiles(tree)).toContain('requirements.txt');
		});

		it('should identify pyproject.toml for Python', () => {
			const tree = [{ path: 'pyproject.toml', type: 'blob' }];
			expect(identifyKeyFiles(tree)).toContain('pyproject.toml');
		});
	});

	describe('type filtering', () => {
		it('should ignore non-blob types (tree items)', () => {
			const tree = [
				{ path: 'package.json', type: 'tree' },
				{ path: 'tsconfig.json', type: 'blob' }
			];
			const result = identifyKeyFiles(tree);
			expect(result).not.toContain('package.json');
			expect(result).toContain('tsconfig.json');
		});
	});

	describe('edge cases', () => {
		it('should return empty array for empty tree', () => {
			expect(identifyKeyFiles([])).toEqual([]);
		});

		it('should identify root-level config files ending in .config.ts', () => {
			const tree = [{ path: 'tailwind.config.ts', type: 'blob' }];
			expect(identifyKeyFiles(tree)).toContain('tailwind.config.ts');
		});

		it('should identify root-level config files ending in .config.js', () => {
			const tree = [{ path: 'postcss.config.js', type: 'blob' }];
			expect(identifyKeyFiles(tree)).toContain('postcss.config.js');
		});

		it('should not include nested config files with generic .config.ts pattern', () => {
			const tree = [{ path: 'src/config/app.config.ts', type: 'blob' }];
			// Should not match since it's not root-level and not in KEY_FILE_PATTERNS
			expect(identifyKeyFiles(tree)).not.toContain('src/config/app.config.ts');
		});
	});
});

describe('identifyRouteFiles', () => {
	describe('SvelteKit routes', () => {
		it('should identify +server.ts routes', () => {
			const tree = [{ path: 'src/routes/api/users/+server.ts', type: 'blob' }];
			expect(identifyRouteFiles(tree)).toContain('src/routes/api/users/+server.ts');
		});

		it('should identify +server.js routes', () => {
			const tree = [{ path: 'src/routes/api/users/+server.js', type: 'blob' }];
			expect(identifyRouteFiles(tree)).toContain('src/routes/api/users/+server.js');
		});

		it('should identify nested SvelteKit routes', () => {
			const tree = [{ path: 'src/routes/api/v1/users/[id]/+server.ts', type: 'blob' }];
			expect(identifyRouteFiles(tree)).toContain('src/routes/api/v1/users/[id]/+server.ts');
		});
	});

	describe('Next.js routes', () => {
		it('should identify pages/api routes', () => {
			const tree = [{ path: 'pages/api/hello.ts', type: 'blob' }];
			expect(identifyRouteFiles(tree)).toContain('pages/api/hello.ts');
		});

		it('should identify pages/api routes with jsx', () => {
			const tree = [{ path: 'pages/api/users.tsx', type: 'blob' }];
			expect(identifyRouteFiles(tree)).toContain('pages/api/users.tsx');
		});

		it('should identify app/api route.ts routes', () => {
			const tree = [{ path: 'app/api/users/route.ts', type: 'blob' }];
			expect(identifyRouteFiles(tree)).toContain('app/api/users/route.ts');
		});

		it('should identify nested app/api routes', () => {
			const tree = [{ path: 'app/api/v1/posts/[id]/route.ts', type: 'blob' }];
			expect(identifyRouteFiles(tree)).toContain('app/api/v1/posts/[id]/route.ts');
		});
	});

	describe('Express-style routes', () => {
		it('should identify routes directory files', () => {
			const tree = [{ path: 'routes/users.ts', type: 'blob' }];
			expect(identifyRouteFiles(tree)).toContain('routes/users.ts');
		});

		it('should identify controllers directory files', () => {
			const tree = [{ path: 'controllers/userController.ts', type: 'blob' }];
			expect(identifyRouteFiles(tree)).toContain('controllers/userController.ts');
		});

		it('should identify api directory files', () => {
			const tree = [{ path: 'api/users.ts', type: 'blob' }];
			expect(identifyRouteFiles(tree)).toContain('api/users.ts');
		});
	});

	describe('type filtering', () => {
		it('should ignore non-matching files', () => {
			const tree = [
				{ path: 'src/components/Button.tsx', type: 'blob' },
				{ path: 'src/utils/helpers.ts', type: 'blob' }
			];
			expect(identifyRouteFiles(tree)).toEqual([]);
		});

		it('should ignore tree type items', () => {
			const tree = [{ path: 'src/routes/api', type: 'tree' }];
			expect(identifyRouteFiles(tree)).toEqual([]);
		});
	});

	describe('edge cases', () => {
		it('should return empty array for empty tree', () => {
			expect(identifyRouteFiles([])).toEqual([]);
		});

		it('should handle mixed route types', () => {
			const tree = [
				{ path: 'src/routes/api/users/+server.ts', type: 'blob' },
				{ path: 'pages/api/legacy.ts', type: 'blob' },
				{ path: 'controllers/auth.ts', type: 'blob' }
			];
			const result = identifyRouteFiles(tree);
			expect(result).toHaveLength(3);
		});
	});
});

describe('buildFileTree', () => {
	describe('basic tree building', () => {
		it('should build correct tree structure with indentation', () => {
			const tree = [
				{ path: 'src/index.ts', type: 'blob' },
				{ path: 'src/utils/helper.ts', type: 'blob' }
			];
			const result = buildFileTree(tree);
			expect(result).toContain('src/');
			expect(result).toContain('  index.ts');
			expect(result).toContain('  utils/');
			expect(result).toContain('    helper.ts');
		});

		it('should sort paths alphabetically', () => {
			const tree = [
				{ path: 'z.ts', type: 'blob' },
				{ path: 'a.ts', type: 'blob' },
				{ path: 'm.ts', type: 'blob' }
			];
			const result = buildFileTree(tree);
			const lines = result.split('\n');
			expect(lines[0]).toBe('a.ts');
			expect(lines[1]).toBe('m.ts');
			expect(lines[2]).toBe('z.ts');
		});
	});

	describe('maxDepth parameter', () => {
		it('should respect maxDepth parameter', () => {
			const tree = [
				{ path: 'a/b/c/d/e/f.ts', type: 'blob' },
				{ path: 'x/y.ts', type: 'blob' }
			];
			const result = buildFileTree(tree, 3);
			expect(result).toContain('x/');
			expect(result).toContain('  y.ts');
			expect(result).not.toContain('f.ts');
		});

		it('should use default maxDepth of 4', () => {
			const tree = [
				{ path: 'a/b/c/d.ts', type: 'blob' }, // depth 4, should show
				{ path: 'a/b/c/d/e.ts', type: 'blob' } // depth 5, should not show
			];
			const result = buildFileTree(tree);
			expect(result).toContain('d.ts');
			expect(result).not.toContain('e.ts');
		});
	});

	describe('directory filtering', () => {
		it('should skip node_modules', () => {
			const tree = [
				{ path: 'node_modules/lodash/index.js', type: 'blob' },
				{ path: 'src/index.ts', type: 'blob' }
			];
			const result = buildFileTree(tree);
			expect(result).not.toContain('node_modules');
			expect(result).toContain('src/');
		});

		it('should skip .git directory', () => {
			const tree = [
				{ path: '.git/config', type: 'blob' },
				{ path: 'src/index.ts', type: 'blob' }
			];
			const result = buildFileTree(tree);
			expect(result).not.toContain('.git');
		});

		it('should skip dist directory', () => {
			const tree = [
				{ path: 'dist/bundle.js', type: 'blob' },
				{ path: 'src/index.ts', type: 'blob' }
			];
			const result = buildFileTree(tree);
			expect(result).not.toContain('dist');
		});

		it('should skip .svelte-kit directory', () => {
			const tree = [
				{ path: '.svelte-kit/output/client.js', type: 'blob' },
				{ path: 'src/index.ts', type: 'blob' }
			];
			const result = buildFileTree(tree);
			expect(result).not.toContain('.svelte-kit');
		});

		it('should skip .next directory', () => {
			const tree = [
				{ path: '.next/server/pages.js', type: 'blob' },
				{ path: 'src/index.ts', type: 'blob' }
			];
			const result = buildFileTree(tree);
			expect(result).not.toContain('.next');
		});

		it('should skip __pycache__ directory', () => {
			const tree = [
				{ path: '__pycache__/module.pyc', type: 'blob' },
				{ path: 'main.py', type: 'blob' }
			];
			const result = buildFileTree(tree);
			expect(result).not.toContain('__pycache__');
		});

		it('should skip venv directory', () => {
			const tree = [
				{ path: 'venv/lib/python3.9/site.py', type: 'blob' },
				{ path: 'main.py', type: 'blob' }
			];
			const result = buildFileTree(tree);
			expect(result).not.toContain('venv');
		});
	});

	describe('hidden file filtering', () => {
		it('should skip hidden files by default', () => {
			const tree = [
				{ path: '.hidden', type: 'blob' },
				{ path: 'visible.ts', type: 'blob' }
			];
			const result = buildFileTree(tree);
			expect(result).not.toContain('.hidden');
			expect(result).toContain('visible.ts');
		});

		it('should allow .env files', () => {
			const tree = [
				{ path: '.env.example', type: 'blob' },
				{ path: '.env.local', type: 'blob' }
			];
			const result = buildFileTree(tree);
			expect(result).toContain('.env.example');
			expect(result).toContain('.env.local');
		});

		it('should allow .github directory', () => {
			const tree = [{ path: '.github/workflows/ci.yml', type: 'blob' }];
			const result = buildFileTree(tree);
			expect(result).toContain('.github/');
		});
	});

	describe('edge cases', () => {
		it('should handle empty tree gracefully', () => {
			expect(buildFileTree([])).toBe('');
		});

		it('should handle single file', () => {
			const tree = [{ path: 'index.ts', type: 'blob' }];
			expect(buildFileTree(tree)).toBe('index.ts');
		});

		it('should add suffix for tree type items', () => {
			const tree = [{ path: 'src', type: 'tree' }];
			const result = buildFileTree(tree);
			expect(result).toContain('src/');
		});
	});
});
