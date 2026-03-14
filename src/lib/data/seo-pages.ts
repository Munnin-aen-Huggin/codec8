export interface SeoPage {
	slug: string;
	name: string;
	type: 'language' | 'framework';
	parent?: string;
	headline: string;
	description: string;
	pain_point: string;
	example_repos: string[];
	features: string[];
	faqs: { q: string; a: string }[];
}

export const SEO_PAGES: SeoPage[] = [
	// ─── Languages ───────────────────────────────────────────────────────────────

	{
		slug: 'python',
		name: 'Python',
		type: 'language',
		headline: 'Auto-generate professional Python documentation in 60 seconds',
		description:
			'Stop writing Python docs by hand. Codec8 reads your modules, classes, and type hints to generate README, API reference, and setup guides automatically.',
		pain_point:
			'Python projects accumulate docstrings that never make it into a README. You have great type hints and function signatures but no structured API reference that outsiders can actually read.',
		example_repos: [
			'tiangolo/fastapi',
			'psf/requests',
			'pallets/flask'
		],
		features: [
			'Parses Python type hints and docstrings into structured API reference docs',
			'Generates pip/poetry/conda install instructions from pyproject.toml or requirements.txt',
			'Creates Mermaid class diagrams from your module hierarchy',
			'Detects virtual environment setup, .env requirements, and testing frameworks (pytest, unittest)'
		],
		faqs: [
			{
				q: 'Does Codec8 support Python 2 projects?',
				a: 'Yes. Codec8 documents both Python 2 and Python 3 projects. For Python 2 codebases it extracts docstrings and infers types from usage patterns since PEP 484 annotations are absent.'
			},
			{
				q: 'Can it document private packages not on PyPI?',
				a: 'Absolutely. Codec8 reads your source code directly from GitHub. It does not need a published package — it analyzes your repo structure, __init__.py files, and source directly.'
			},
			{
				q: 'How does it handle Django vs Flask vs FastAPI projects?',
				a: 'Codec8 detects your web framework from your dependencies and adapts the documentation structure accordingly — Django projects get model docs and URL pattern summaries, FastAPI projects get OpenAPI-style endpoint docs.'
			}
		]
	},

	{
		slug: 'javascript',
		name: 'JavaScript',
		type: 'language',
		headline: 'JavaScript documentation generator — from messy JS to clean docs',
		description:
			'Generate JavaScript README files, API docs, and module guides automatically. Codec8 handles CommonJS, ESM, and everything in between.',
		pain_point:
			'JavaScript projects often have no strict type information to anchor documentation on. You end up with a README that was accurate six months ago and an API that only you understand.',
		example_repos: [
			'expressjs/express',
			'lodash/lodash',
			'axios/axios'
		],
		features: [
			'Extracts JSDoc comments and infers argument types from usage patterns',
			'Documents both CommonJS (require) and ESM (import/export) module shapes',
			'Generates npm install commands, scripts table, and peer dependency warnings',
			'Produces callback vs Promise vs async/await usage examples from your actual code'
		],
		faqs: [
			{
				q: 'Does it work with plain JavaScript without JSDoc comments?',
				a: 'Yes. Codec8 infers documentation from function signatures, variable names, and usage patterns even when JSDoc is absent. Adding JSDoc does produce richer output.'
			},
			{
				q: 'Can it document browser-only libraries as well as Node packages?',
				a: 'Yes. Codec8 detects browser vs Node.js context from your package.json, webpack/rollup config, and code patterns, and adjusts the setup guide accordingly.'
			},
			{
				q: 'What about minified or bundled output files?',
				a: 'Codec8 reads your source files, not your dist output. Point it to your source repo and it will generate docs from the readable source code, not the bundle.'
			}
		]
	},

	{
		slug: 'typescript',
		name: 'TypeScript',
		type: 'language',
		headline: 'TypeScript documentation generator — turn your types into readable docs',
		description:
			'Codec8 transforms TypeScript interfaces, generics, and decorators into beautiful API documentation. Your tsconfig is already half the documentation — let us finish it.',
		pain_point:
			'TypeScript projects have gold-standard type information that should generate documentation automatically — but most teams still write docs by hand, letting them drift out of sync with the actual types.',
		example_repos: [
			'microsoft/TypeScript',
			'typeorm/typeorm',
			'nestjs/nest'
		],
		features: [
			'Renders TypeScript interfaces, enums, and generic types into human-readable API tables',
			'Extracts TSDoc (@param, @returns, @example) and converts to structured docs',
			'Documents decorators used in NestJS, Angular, and TypeORM projects',
			'Detects strict mode, path aliases, and monorepo workspace structure from tsconfig.json'
		],
		faqs: [
			{
				q: 'Does it document .d.ts declaration files?',
				a: 'Yes. Codec8 reads both .ts source files and .d.ts declaration files. For libraries that ship declarations, it can generate docs directly from the type definitions.'
			},
			{
				q: 'How does it handle complex generic types?',
				a: 'Codec8 simplifies deeply nested generics into readable plain-English descriptions while still showing the exact type signature, so documentation is useful for both beginners and advanced users.'
			},
			{
				q: 'Can it document a TypeScript monorepo with multiple packages?',
				a: 'Yes. Codec8 detects npm/yarn/pnpm workspaces and generates per-package documentation plus a top-level monorepo overview showing how packages relate to each other.'
			}
		]
	},

	{
		slug: 'go',
		name: 'Go',
		type: 'language',
		headline: 'Go documentation generator — godoc-quality docs without the manual work',
		description:
			'Generate Go README, package documentation, and architecture diagrams automatically. Codec8 respects Go conventions and produces docs that look like they were written by the pkg.go.dev team.',
		pain_point:
			'Go has godoc built in, but godoc only covers exported symbols and requires you to be online. You still need a human-readable README, architecture overview, and contributor guide that go beyond what godoc can produce.',
		example_repos: [
			'gin-gonic/gin',
			'golang-migrate/migrate',
			'go-chi/chi'
		],
		features: [
			'Reads Go doc comments (// Package ...) and generates package-level and function-level documentation',
			'Creates Mermaid diagrams showing package dependency graph and interface relationships',
			'Generates go get / go install instructions with correct module path from go.mod',
			'Documents goroutine concurrency patterns and channel usage found in your code'
		],
		faqs: [
			{
				q: 'Does it work with Go modules introduced in Go 1.11+?',
				a: 'Yes. Codec8 reads your go.mod and go.sum to determine module paths, dependencies, and minimum Go version, incorporating this into setup instructions.'
			},
			{
				q: 'Can it document CGO projects?',
				a: 'Codec8 handles pure Go projects and CGO projects. For CGO it documents the C dependencies required, platform constraints, and build tag requirements.'
			},
			{
				q: 'Does it document unexported (lowercase) functions?',
				a: 'By default, Codec8 focuses on exported symbols to match Go convention. Internal/unexported functions are documented in a separate "Architecture" section for contributors.'
			}
		]
	},

	{
		slug: 'rust',
		name: 'Rust',
		type: 'language',
		headline: 'Rust documentation generator — docs.rs quality without the manual effort',
		description:
			'Generate Rust crate documentation, README files, and architecture overviews automatically. Codec8 reads your rustdoc comments and Cargo.toml to produce production-ready docs.',
		pain_point:
			'Rust projects have rustdoc and docs.rs, but building a compelling README with usage examples, feature flags explained, and architecture context still takes hours of manual writing that most developers skip.',
		example_repos: [
			'tokio-rs/tokio',
			'serde-rs/serde',
			'clap-rs/clap'
		],
		features: [
			'Extracts /// doc comments and #[doc] attributes into structured API reference',
			'Documents Cargo feature flags with enable/disable instructions and what each flag unlocks',
			'Generates cargo add and Cargo.toml snippet for each crate dependency configuration',
			'Creates trait implementation trees and lifetime relationship diagrams for complex APIs'
		],
		faqs: [
			{
				q: 'Does it handle Rust workspaces with multiple crates?',
				a: 'Yes. Codec8 reads the workspace Cargo.toml and generates documentation for each member crate, plus an overview showing how they relate and which crate to depend on for what.'
			},
			{
				q: 'Can it document unsafe code sections?',
				a: 'Yes. Codec8 flags and documents unsafe blocks with special attention, explaining the safety invariants expected by the caller when such context is available in comments.'
			},
			{
				q: 'What async runtimes does it support documenting?',
				a: 'Codec8 detects tokio, async-std, and smol from your Cargo.toml and generates async usage examples appropriate for the runtime your crate targets.'
			}
		]
	},

	{
		slug: 'java',
		name: 'Java',
		type: 'language',
		headline: 'Java documentation generator — JavaDoc without writing a single tag',
		description:
			'Auto-generate Java project README, class hierarchy diagrams, and API reference from your source code. Codec8 handles Maven, Gradle, and Spring projects alike.',
		pain_point:
			'Java projects have Javadoc, but most teams either skip writing tags entirely or write them inconsistently. The result is documentation that covers 20% of the public API and misleads readers about the rest.',
		example_repos: [
			'spring-projects/spring-boot',
			'google/guava',
			'square/retrofit'
		],
		features: [
			'Reads existing Javadoc tags (@param, @return, @throws) and infers missing documentation from code',
			'Generates Maven pom.xml and Gradle dependency snippets for easy integration',
			'Produces UML-style class and interface hierarchy diagrams as Mermaid charts',
			'Documents Spring annotations (@RestController, @Service, @Entity) into human-readable endpoint and model reference'
		],
		faqs: [
			{
				q: 'Does it support both Maven and Gradle build systems?',
				a: 'Yes. Codec8 reads pom.xml for Maven projects and build.gradle or build.gradle.kts for Gradle projects, generating appropriate dependency and build instructions.'
			},
			{
				q: 'Can it document legacy Java 8 projects with no modern annotations?',
				a: 'Yes. Codec8 works with any Java version. For older codebases without annotations it relies more heavily on naming conventions, class hierarchies, and any existing Javadoc.'
			},
			{
				q: 'How does it handle multi-module Maven projects?',
				a: 'Codec8 reads the parent pom.xml and each module, generating per-module documentation and a top-level project guide explaining what each module does and how they fit together.'
			}
		]
	},

	{
		slug: 'ruby',
		name: 'Ruby',
		type: 'language',
		headline: 'Ruby documentation generator — RDoc-quality docs from your actual code',
		description:
			'Generate Ruby gem and Rails app documentation automatically. Codec8 reads your classes, modules, and YARD comments to produce clean developer-facing docs.',
		pain_point:
			'Ruby projects often live or die by their README, but writing a compelling gem README with usage examples, configuration options, and contribution guide takes most of a day — time that should go to shipping features.',
		example_repos: [
			'rails/rails',
			'heartcombo/devise',
			'sidekiq/sidekiq'
		],
		features: [
			'Extracts YARD and RDoc comments into structured method and class documentation',
			'Generates Gemfile and gemspec installation snippets with correct dependency syntax',
			'Documents Ruby modules and mixins showing which classes include each module',
			'Produces rake task reference and console usage examples from your Rakefile'
		],
		faqs: [
			{
				q: 'Does it work for gems published to RubyGems as well as private gems?',
				a: 'Yes. Codec8 reads from your GitHub source repo regardless of whether the gem is published. It does not need access to RubyGems.org.'
			},
			{
				q: 'Can it document Rails applications as well as plain Ruby libraries?',
				a: 'Yes. For Rails apps, Codec8 produces route reference, model relationship docs, and setup guides including database migration and credential setup steps.'
			},
			{
				q: 'Does it support Sorbet or RBS type annotations?',
				a: 'Yes. When Sorbet sigs or RBS type files are present, Codec8 incorporates type information into the generated API reference for richer documentation.'
			}
		]
	},

	{
		slug: 'php',
		name: 'PHP',
		type: 'language',
		headline: 'PHP documentation generator — PHPDoc without the tedious manual work',
		description:
			'Auto-generate PHP project and library documentation from your source code. Codec8 reads your PHPDoc blocks, Composer config, and class structure to build complete docs.',
		pain_point:
			'PHP libraries that lack documentation get ignored by developers who have too many alternatives. Writing PHPDoc for every class and method, then assembling it into a readable README, takes days most teams never have.',
		example_repos: [
			'laravel/framework',
			'symfony/symfony',
			'guzzle/guzzle'
		],
		features: [
			'Reads PHPDoc @param, @return, and @throws blocks and generates structured API documentation',
			'Produces composer require and composer.json configuration examples for your package',
			'Documents PHP interfaces and abstract classes showing all concrete implementations',
			'Detects PHP version constraints, extensions required, and generates compatibility matrix'
		],
		faqs: [
			{
				q: 'Does it support PHP 7.x and PHP 8.x projects?',
				a: 'Yes. Codec8 handles PHP 7 and PHP 8 projects. For PHP 8 projects it incorporates named arguments, union types, attributes, and enums into the generated documentation.'
			},
			{
				q: 'Can it document Composer packages not yet submitted to Packagist?',
				a: 'Yes. Codec8 reads from your GitHub repository directly and does not require a published Packagist package. It reads your composer.json for package metadata.'
			},
			{
				q: 'How does it handle PSR standards compliance documentation?',
				a: "Codec8 detects which PSR interfaces your classes implement (PSR-3, PSR-7, PSR-15, etc.) and documents them explicitly, which is often the first thing library consumers look for."
			}
		]
	},

	{
		slug: 'csharp',
		name: 'C#',
		type: 'language',
		headline: 'C# documentation generator — XML docs and architecture diagrams automatically',
		description:
			'Generate C# library and ASP.NET application documentation from your source code. Codec8 reads XML doc comments, .csproj files, and class hierarchies to build complete docs.',
		pain_point:
			'C# projects have excellent XML doc comment support, but assembling those comments into a readable README plus architecture overview still requires significant manual effort that most .NET developers skip.',
		example_repos: [
			'dotnet/aspnetcore',
			'neuecc/MessagePack-CSharp',
			'JamesNK/Newtonsoft.Json'
		],
		features: [
			'Parses XML doc comments (///) into structured API reference with parameter and return type tables',
			'Generates NuGet package installation commands and .csproj PackageReference snippets',
			'Documents interfaces, abstract classes, and their implementations in class hierarchy diagrams',
			'Detects ASP.NET Core controllers and generates HTTP endpoint reference documentation'
		],
		faqs: [
			{
				q: 'Does it work with .NET Framework projects as well as .NET Core/.NET 5+?',
				a: 'Yes. Codec8 reads both .csproj (SDK-style) and legacy project formats. It detects the target framework from the project file and adjusts installation instructions accordingly.'
			},
			{
				q: 'Can it document NuGet packages before they are published?',
				a: 'Absolutely. Codec8 reads from your GitHub source, not NuGet. It generates documentation that you can include in your NuGet package or GitHub repository independently.'
			},
			{
				q: 'How does it handle nullable reference types enabled in C# 8+?',
				a: 'Codec8 reads your nullable context settings and incorporates nullability annotations into the API documentation, clearly marking parameters and returns as nullable or non-nullable.'
			}
		]
	},

	{
		slug: 'swift',
		name: 'Swift',
		type: 'language',
		headline: 'Swift documentation generator — DocC-quality docs from any Swift package',
		description:
			'Auto-generate Swift package and iOS library documentation. Codec8 reads your Swift doc comments, Package.swift, and protocol hierarchies to produce clean, structured docs.',
		pain_point:
			'Swift packages on GitHub compete for adoption based almost entirely on their README quality. Most packages have great code but sparse documentation, losing users to better-documented alternatives.',
		example_repos: [
			'Alamofire/Alamofire',
			'apple/swift-nio',
			'pointfreeco/swift-composable-architecture'
		],
		features: [
			'Extracts /// Swift documentation comments and generates DocC-compatible structured API docs',
			'Produces Swift Package Manager and CocoaPods installation instructions from Package.swift',
			'Documents Swift protocols, extensions, and their conformances in relationship diagrams',
			'Generates platform compatibility matrix (iOS, macOS, watchOS, tvOS) from deployment targets'
		],
		faqs: [
			{
				q: 'Does it support both Swift Package Manager and CocoaPods?',
				a: 'Yes. Codec8 detects Package.swift for SPM projects and Podspec files for CocoaPods, generating the correct installation instructions for each integration method.'
			},
			{
				q: 'Can it document SwiftUI view hierarchies?',
				a: 'Yes. For SwiftUI projects, Codec8 documents View structs, their parameters, and preview setups, plus generates visual component hierarchy descriptions.'
			},
			{
				q: 'Does it handle Swift concurrency (async/await, actors)?',
				a: 'Yes. Codec8 recognizes async functions, actor types, and Sendable conformances introduced in Swift 5.5+ and documents their concurrency characteristics explicitly.'
			}
		]
	},

	{
		slug: 'kotlin',
		name: 'Kotlin',
		type: 'language',
		headline: 'Kotlin documentation generator — KDoc without writing every annotation',
		description:
			'Generate Kotlin library, Android, and multiplatform project documentation automatically. Codec8 reads KDoc comments, Gradle files, and your class structure to build complete docs.',
		pain_point:
			'Kotlin libraries tend to have expressive, concise code that is hard to understand without documentation. The gap between what the code does and what the README explains is often enormous.',
		example_repos: [
			'square/okhttp',
			'InsertKoinIO/koin',
			'Kotlin/kotlinx.coroutines'
		],
		features: [
			'Parses KDoc comments and Kotlin type system features (data classes, sealed classes, extensions) into API docs',
			'Generates Gradle Kotlin DSL and Groovy DSL dependency snippets for both build systems',
			'Documents coroutine-based APIs with Flow, suspend function, and dispatcher context notes',
			'Detects Kotlin Multiplatform targets and generates per-platform setup instructions'
		],
		faqs: [
			{
				q: 'Does it work for Android projects using Kotlin?',
				a: 'Yes. For Android projects, Codec8 generates documentation including Gradle configuration, ProGuard rules, permissions required, and integration setup steps.'
			},
			{
				q: 'Can it document Kotlin Multiplatform Mobile (KMM) projects?',
				a: 'Yes. Codec8 reads expect/actual declarations and documents the shared API alongside platform-specific implementations for both Android and iOS targets.'
			},
			{
				q: 'How does it handle Kotlin DSL builder patterns?',
				a: 'Codec8 detects builder DSL patterns common in Kotlin and generates configuration examples showing how to use the DSL, not just a dry listing of available properties.'
			}
		]
	},

	{
		slug: 'cpp',
		name: 'C++',
		type: 'language',
		headline: 'C++ documentation generator — Doxygen-quality docs without writing XML',
		description:
			'Auto-generate C++ library documentation from your headers and source files. Codec8 reads Doxygen comments, CMakeLists.txt, and class hierarchies to produce clean developer docs.',
		pain_point:
			'C++ projects often have world-class performance and terrible documentation. Doxygen exists but produces output that looks like it was designed in 1999. Writing a modern README plus API reference is a multi-day project most teams skip.',
		example_repos: [
			'gabime/spdlog',
			'nlohmann/json',
			'abseil/abseil-cpp'
		],
		features: [
			'Reads Doxygen-style and plain comments from header files to generate structured API documentation',
			'Produces CMake FetchContent, vcpkg, and Conan installation snippets for your library',
			'Generates class hierarchy and template specialization diagrams as Mermaid charts',
			'Documents namespaces, template parameters, and SFINAE constraints in readable English'
		],
		faqs: [
			{
				q: 'Does it work with CMake, Meson, and Bazel build systems?',
				a: 'Yes. Codec8 reads CMakeLists.txt, meson.build, and BUILD/WORKSPACE files to determine project structure and generate appropriate build and integration instructions.'
			},
			{
				q: 'Can it document header-only libraries?',
				a: 'Header-only libraries are ideal for Codec8 — all the public API is in the headers with no implementation to separate. It generates complete API reference from your .hpp files.'
			},
			{
				q: 'How does it handle C++17/20/23 features like concepts and modules?',
				a: 'Codec8 recognizes C++20 concepts and requires clauses and documents them in a way that makes the constraints clear to users, rather than showing raw template metaprogramming.'
			}
		]
	},

	// ─── Frameworks ──────────────────────────────────────────────────────────────

	{
		slug: 'react',
		name: 'React',
		type: 'framework',
		parent: 'javascript',
		headline: 'React documentation generator — component API docs without the manual work',
		description:
			'Auto-generate React component documentation, prop tables, and storybook-style API reference from your source code. Works with JavaScript and TypeScript React projects.',
		pain_point:
			'React component libraries live and die by their documentation. Writing prop tables, usage examples, and composition guides for every component manually is the task that always gets cut before launch.',
		example_repos: [
			'shadcn-ui/ui',
			'radix-ui/primitives',
			'chakra-ui/chakra-ui'
		],
		features: [
			'Extracts PropTypes and TypeScript interface props into component API tables with types and defaults',
			'Documents React hooks with parameter descriptions, return value types, and usage examples',
			'Generates component composition diagrams showing which components use which',
			'Detects Context providers and documents the data shape they expose to consumers'
		],
		faqs: [
			{
				q: 'Does it work with class components as well as function components?',
				a: 'Yes. Codec8 documents both class components (with lifecycle methods) and function components (with hooks). It clearly distinguishes between them in the generated docs.'
			},
			{
				q: 'Can it document a React component library published to npm?',
				a: 'Yes. Codec8 reads from your GitHub source and generates documentation suitable for your library\'s README, GitHub Pages docs site, or npm package description.'
			},
			{
				q: 'How does it handle styled-components and CSS Modules?',
				a: 'Codec8 recognizes styled-components, CSS Modules, and Tailwind class patterns. It documents visual variants and style props where they are exposed through the component API.'
			}
		]
	},

	{
		slug: 'nextjs',
		name: 'Next.js',
		type: 'framework',
		parent: 'javascript',
		headline: 'Next.js documentation generator — App Router, Pages Router, and API routes covered',
		description:
			'Generate Next.js project documentation automatically. Codec8 documents your pages, API routes, data fetching patterns, and deployment config in one pass.',
		pain_point:
			'Next.js projects mix frontend pages, API routes, middleware, and static assets in a single repo. Documenting how all of these pieces fit together — especially across the App Router migration — is a nightmare to do manually.',
		example_repos: [
			'vercel/next.js',
			'shadcn-ui/taxonomy',
			'steven-tey/precedent'
		],
		features: [
			'Documents App Router and Pages Router layouts, page components, and route segments',
			'Generates API route reference listing HTTP methods, request/response shapes, and auth requirements',
			'Documents Next.js data fetching (getStaticProps, getServerSideProps, Server Components) patterns',
			'Detects next.config.js settings and documents environment variables, rewrites, and middleware'
		],
		faqs: [
			{
				q: 'Does it support both the App Router (Next.js 13+) and the Pages Router?',
				a: 'Yes. Codec8 detects which router you are using from your project structure and generates documentation tailored to either pattern, including correct data fetching docs for each.'
			},
			{
				q: 'Can it document a Next.js project deployed on platforms other than Vercel?',
				a: 'Yes. The documentation Codec8 generates is platform-agnostic. It documents your codebase\'s structure and behavior regardless of where you deploy.'
			},
			{
				q: 'How does it document Next.js API routes that use third-party auth like NextAuth.js?',
				a: 'Codec8 detects NextAuth.js and similar auth libraries and documents the protected routes, session shapes, and provider configuration in the generated setup guide.'
			}
		]
	},

	{
		slug: 'vue',
		name: 'Vue',
		type: 'framework',
		parent: 'javascript',
		headline: 'Vue documentation generator — Options API, Composition API, and everything in between',
		description:
			'Auto-generate Vue.js component documentation, store reference, and project setup guides. Works with Vue 2 and Vue 3, Options API and Composition API.',
		pain_point:
			'Vue component libraries in particular suffer from undocumented props and emit events. A component that accepts 12 props with no documentation becomes a frustrating black box for every developer who tries to use it.',
		example_repos: [
			'vuejs/core',
			'vueuse/vueuse',
			'element-plus/element-plus'
		],
		features: [
			'Documents Vue SFC props, emits, slots, and expose() using both Options and Composition API patterns',
			'Generates Pinia store reference with state shape, actions, and getters documented',
			'Documents Vue Router configuration — routes, guards, and meta fields',
			'Detects Vue 2 vs Vue 3 and generates correct API reference for the version in use'
		],
		faqs: [
			{
				q: 'Does it work with Vue 2 projects that have not migrated to Vue 3?',
				a: 'Yes. Codec8 fully supports Vue 2 projects including Options API components, Vuex stores, and Vue Router 3. It generates documentation appropriate for Vue 2 consumers.'
			},
			{
				q: 'Can it document a Vue component library published to npm?',
				a: 'Yes. Codec8 generates a complete component API reference suitable for your library\'s documentation site, including installation, registration, and per-component usage examples.'
			},
			{
				q: 'How does it handle script setup syntax introduced in Vue 3.2?',
				a: 'Codec8 fully parses <script setup> syntax including defineProps, defineEmits, defineExpose, and the new defineModel macro, generating complete component API documentation.'
			}
		]
	},

	{
		slug: 'nuxt',
		name: 'Nuxt',
		type: 'framework',
		parent: 'javascript',
		headline: 'Nuxt documentation generator — auto-imports, modules, and server routes all covered',
		description:
			'Generate Nuxt 3 application documentation automatically. Codec8 handles composables, server API routes, Nuxt modules, and app configuration in one pass.',
		pain_point:
			'Nuxt 3 auto-imports make the codebase feel magical to insiders but completely opaque to new developers. Without documentation explaining what composables exist and what each server route does, onboarding takes days.',
		example_repos: [
			'nuxt/nuxt',
			'nuxt-hub/core',
			'sidebase/nuxt-auth'
		],
		features: [
			'Documents auto-imported composables with parameters, return values, and usage examples',
			'Generates server API route reference from your server/api/ directory with request/response shapes',
			'Documents installed Nuxt modules and their configuration options in nuxt.config.ts',
			'Generates deployment guide for Vercel, Netlify, and Cloudflare Pages from your target setting'
		],
		faqs: [
			{
				q: 'Does it support Nuxt 2 (with @nuxtjs modules) as well as Nuxt 3?',
				a: 'Yes. Codec8 detects Nuxt version from your package.json and generates documentation appropriate for either version, including the correct module registration syntax.'
			},
			{
				q: 'Can it document Nuxt Content or Nuxt UI components?',
				a: 'Yes. Codec8 detects popular Nuxt modules like @nuxt/content, @nuxt/ui, and @nuxtjs/i18n and documents how they are configured and used in your specific project.'
			},
			{
				q: 'How does it handle Nuxt layers?',
				a: 'Codec8 reads your layer configuration and documents which layers extend your app, what each layer provides, and how the final merged configuration works together.'
			}
		]
	},

	{
		slug: 'svelte',
		name: 'Svelte',
		type: 'framework',
		parent: 'javascript',
		headline: 'Svelte documentation generator — components, stores, and transitions documented',
		description:
			'Auto-generate Svelte component documentation from your .svelte files. Codec8 reads props, events, slots, and store usage to produce clean API docs for Svelte libraries.',
		pain_point:
			'Svelte component libraries lack the ecosystem of auto-documentation tools that React enjoys. Writing comprehensive prop documentation, slot descriptions, and event listings for every component is still a fully manual task.',
		example_repos: [
			'sveltejs/svelte',
			'huntabyte/shadcn-svelte',
			'skeletonlabs/skeleton'
		],
		features: [
			'Documents .svelte component props, events (on:), and named slots from component source',
			'Generates Svelte writable/readable store reference with the shape of stored state',
			'Documents Svelte transitions and animations used in components with parameter documentation',
			'Detects whether the project targets Svelte 4 or Svelte 5 (runes) and documents accordingly'
		],
		faqs: [
			{
				q: 'Does it support Svelte 5 runes syntax ($state, $derived, $effect)?',
				a: 'Yes. Codec8 detects Svelte 5 rune usage and generates documentation using the new mental model, clearly distinguishing rune-based state from legacy store-based patterns.'
			},
			{
				q: 'Can it document a published Svelte component library?',
				a: 'Yes. For component libraries, Codec8 generates a complete component catalog with prop tables, event listings, slot documentation, and usage examples ready for your docs site.'
			},
			{
				q: 'How does it handle Svelte stores that are shared across components?',
				a: 'Codec8 traces store usage across components and documents the data flow — which components read from which stores and which components update them — in the architecture section.'
			}
		]
	},

	{
		slug: 'sveltekit',
		name: 'SvelteKit',
		type: 'framework',
		parent: 'javascript',
		headline: 'SvelteKit documentation generator — routes, load functions, and actions all covered',
		description:
			'Generate SvelteKit application documentation automatically. Codec8 maps your route structure, load functions, form actions, and server endpoints into a complete project reference.',
		pain_point:
			'SvelteKit\'s file-based routing creates a project structure that is elegant to work in but confusing to new contributors. Without documented load functions, form actions, and route params, every new team member needs a guided tour.',
		example_repos: [
			'sveltejs/kit',
			'animotionjs/animotion',
			'delay/sveltekit-superforms'
		],
		features: [
			'Maps every +page.server.ts load function and documents what data it fetches and returns',
			'Documents form actions with input validation schemas, success responses, and error states',
			'Generates API endpoint reference from +server.ts files with request/response documentation',
			'Documents layout hierarchy and which layouts apply to which routes'
		],
		faqs: [
			{
				q: 'Does it document both server-side and client-side load functions?',
				a: 'Yes. Codec8 documents +page.server.ts, +page.ts, +layout.server.ts, and +layout.ts load functions, clearly indicating which run on the server vs the client.'
			},
			{
				q: 'Can it document SvelteKit projects using adapter-static for static site generation?',
				a: 'Yes. Codec8 detects your adapter from svelte.config.js and adjusts the deployment documentation accordingly — adapter-static, adapter-vercel, adapter-node, etc.'
			},
			{
				q: 'How does it handle SvelteKit projects with Supabase or Prisma for data?',
				a: 'Codec8 detects database libraries from your imports and documents the data models, schema, and database setup steps in the setup guide alongside the SvelteKit configuration.'
			}
		]
	},

	{
		slug: 'angular',
		name: 'Angular',
		type: 'framework',
		parent: 'typescript',
		headline: 'Angular documentation generator — modules, components, and services documented',
		description:
			'Auto-generate Angular application and library documentation. Codec8 reads your decorators, modules, services, and pipes to produce complete developer-facing documentation.',
		pain_point:
			'Angular applications have elaborate module hierarchies and dependency injection trees that are almost impossible to understand without documentation. New developers spend weeks reverse-engineering architecture that should be documented in an afternoon.',
		example_repos: [
			'angular/angular',
			'angular/material',
			'ngrx/platform'
		],
		features: [
			'Documents @Component, @Directive, @Pipe, and @Injectable decorators with their properties',
			'Generates NgModule dependency graph showing which modules import what',
			'Documents Angular services, their providers, and the data they manage',
			'Detects RxJS Observable patterns and documents async data flows through your app'
		],
		faqs: [
			{
				q: 'Does it support both Angular standalone components (Angular 15+) and NgModule-based architecture?',
				a: 'Yes. Codec8 detects whether components use standalone: true or belong to NgModules and generates appropriate documentation for each architectural pattern.'
			},
			{
				q: 'Can it document Angular libraries in an Nx or Angular CLI monorepo?',
				a: 'Yes. Codec8 reads the Angular workspace configuration (angular.json or project.json) and generates per-project documentation plus a monorepo overview.'
			},
			{
				q: 'How does it handle NgRx state management documentation?',
				a: 'Codec8 detects NgRx and documents your actions, reducers, selectors, and effects — showing how state flows through your application in the architecture section.'
			}
		]
	},

	{
		slug: 'django',
		name: 'Django',
		type: 'framework',
		parent: 'python',
		headline: 'Django documentation generator — models, views, and URLs documented automatically',
		description:
			'Auto-generate Django project documentation including model schemas, URL patterns, admin configuration, and setup guides. Works for apps, packages, and full projects.',
		pain_point:
			'Django projects often grow to hundreds of models and dozens of apps with no documentation beyond the code itself. Writing a setup guide alone — covering settings, migrations, environment variables, and dependencies — takes hours.',
		example_repos: [
			'django/django',
			'encode/django-rest-framework',
			'wagtail/wagtail'
		],
		features: [
			'Reads Django models and generates database schema documentation with field types and constraints',
			'Documents URL patterns with view names, accepted methods, and expected parameters',
			'Generates complete setup guide from settings.py — database, cache, email, and static files',
			'Documents Django REST Framework serializers and ViewSets as API endpoint reference'
		],
		faqs: [
			{
				q: 'Does it work with Django REST Framework and GraphQL (graphene-django)?',
				a: 'Yes. For DRF projects, Codec8 generates REST API documentation from serializers and views. For graphene-django, it documents the GraphQL schema and query types.'
			},
			{
				q: 'Can it document Django packages (reusable apps) as well as full projects?',
				a: 'Yes. For reusable apps, Codec8 generates package-focused documentation including installation, settings configuration, and migration instructions for library consumers.'
			},
			{
				q: 'How does it handle multi-tenant Django projects?',
				a: 'Codec8 detects django-tenants or similar packages and documents the tenant model, schema routing, and per-tenant configuration in a dedicated architecture section.'
			}
		]
	},

	{
		slug: 'fastapi',
		name: 'FastAPI',
		type: 'framework',
		parent: 'python',
		headline: 'FastAPI documentation generator — endpoint docs beyond what Swagger gives you',
		description:
			'Generate FastAPI project README, setup guides, and human-readable API documentation. Codec8 complements your OpenAPI spec with architecture context and developer onboarding docs.',
		pain_point:
			'FastAPI auto-generates Swagger UI, but Swagger is not the documentation your users need. They need a README explaining what the API does, a setup guide for local development, and architecture context that no schema can provide.',
		example_repos: [
			'tiangolo/fastapi',
			'full-stack-fastapi-template/full-stack-fastapi-template',
			'zhanymkanov/fastapi-best-practices'
		],
		features: [
			'Documents Pydantic request and response models with field descriptions and validation rules',
			'Generates endpoint reference beyond Swagger — with auth requirements and error responses explained',
			'Produces Docker Compose setup guide from your compose file and .env requirements',
			'Documents FastAPI dependency injection chains so contributors understand your auth and DB layers'
		],
		faqs: [
			{
				q: 'Does Codec8 replace FastAPI\'s built-in Swagger/ReDoc documentation?',
				a: 'No — it complements it. FastAPI\'s Swagger covers your schema. Codec8 generates the README, setup guide, architecture overview, and contextual docs that Swagger cannot produce.'
			},
			{
				q: 'Can it document async (async def) endpoints and sync (def) endpoints?',
				a: 'Yes. Codec8 documents both sync and async FastAPI endpoints. For async endpoints it also notes concurrency characteristics and any background task usage.'
			},
			{
				q: 'How does it handle FastAPI projects with multiple routers across many files?',
				a: 'Codec8 follows your APIRouter includes and generates a unified endpoint reference, organized by router prefix, even when routes are spread across dozens of files.'
			}
		]
	},

	{
		slug: 'flask',
		name: 'Flask',
		type: 'framework',
		parent: 'python',
		headline: 'Flask documentation generator — blueprints, routes, and extensions documented',
		description:
			'Auto-generate Flask application and extension documentation. Codec8 maps your blueprints, routes, and Flask extension configuration into complete developer docs.',
		pain_point:
			'Flask\'s minimal structure means every project organizes itself differently. Without documentation, a new developer has no idea where routes live, how blueprints are organized, or what extensions are required just to run the app locally.',
		example_repos: [
			'pallets/flask',
			'flask-restful/flask-restful',
			'miguelgrinberg/flasky'
		],
		features: [
			'Maps Flask blueprints and documents each route with HTTP methods, parameters, and return values',
			'Documents Flask extensions (SQLAlchemy, Login, JWT, Migrate) and their configuration',
			'Generates complete local setup guide from app factory pattern and config objects',
			'Produces database model documentation from SQLAlchemy model classes'
		],
		faqs: [
			{
				q: 'Does it support Flask application factories (create_app pattern)?',
				a: 'Yes. Codec8 detects the application factory pattern and documents how the app is configured, which blueprints are registered, and how to run different configurations (dev/prod/test).'
			},
			{
				q: 'Can it document Flask-RESTX or Flask-RESTful REST APIs?',
				a: 'Yes. For Flask-RESTX and Flask-RESTful projects, Codec8 generates REST API documentation from your Resource classes, documenting each endpoint\'s methods and schemas.'
			},
			{
				q: 'How does it handle Flask apps with both Jinja2 templates and REST endpoints?',
				a: 'Codec8 documents both types. Template routes get view documentation. API routes get endpoint documentation. The README explains the dual nature of the application clearly.'
			}
		]
	},

	{
		slug: 'express',
		name: 'Express',
		type: 'framework',
		parent: 'javascript',
		headline: 'Express documentation generator — routes, middleware, and API docs automated',
		description:
			'Auto-generate Express.js API documentation from your route files, middleware stack, and handler functions. Works with JavaScript and TypeScript Express projects.',
		pain_point:
			'Express applications grow organically — routes spread across files, middleware stacks grow complicated, and no one writes the API documentation. The result is an API that only the original developer understands.',
		example_repos: [
			'expressjs/express',
			'goldbergyoni/nodebestpractices',
			'hagopj13/node-express-boilerplate'
		],
		features: [
			'Maps Express router files and generates complete REST API reference with methods and paths',
			'Documents middleware stack — auth, validation, rate limiting, logging — in execution order',
			'Generates request/response schema documentation from Joi, Zod, or express-validator rules',
			'Produces environment variable reference from your .env.example or dotenv configuration'
		],
		faqs: [
			{
				q: 'Does it work with Express projects that use TypeScript?',
				a: 'Yes. For TypeScript Express projects, Codec8 reads type annotations on request handlers and generates typed API documentation with request/response interface definitions.'
			},
			{
				q: 'Can it document Express projects using Mongoose or Sequelize?',
				a: 'Yes. Codec8 reads your Mongoose schemas or Sequelize model definitions and includes database model documentation alongside the REST API reference.'
			},
			{
				q: 'How does it handle Express middleware that chains across multiple routers?',
				a: 'Codec8 traces middleware registration from your app.use calls and documents the complete middleware chain for each route group, showing what runs before each handler.'
			}
		]
	},

	{
		slug: 'nestjs',
		name: 'NestJS',
		type: 'framework',
		parent: 'typescript',
		headline: 'NestJS documentation generator — modules, controllers, and providers documented',
		description:
			'Auto-generate NestJS application documentation. Codec8 reads your decorators, module structure, DTOs, and guards to produce complete API and architecture documentation.',
		pain_point:
			'NestJS\'s decorator-heavy architecture is powerful but opaque. Without documentation, understanding which modules are loaded, which guards protect which routes, and what each DTO validates requires reading every file in the project.',
		example_repos: [
			'nestjs/nest',
			'nestjs/swagger',
			'brocoders/nestjs-boilerplate'
		],
		features: [
			'Documents @Controller routes with @Get/@Post/@Put/@Delete methods, DTOs, and guards',
			'Generates NestJS module dependency graph showing imports, providers, and exports',
			'Documents @Injectable services with their dependencies and methods',
			'Produces Swagger/OpenAPI documentation supplement with auth guards and role requirements noted'
		],
		faqs: [
			{
				q: 'Does it work with NestJS microservices as well as REST APIs?',
				a: 'Yes. For microservice projects, Codec8 documents the transport layer (TCP, Redis, NATS, Kafka), message patterns, and event handlers alongside regular REST endpoints.'
			},
			{
				q: 'Can it document NestJS GraphQL modules using @nestjs/graphql?',
				a: 'Yes. Codec8 detects @Resolver, @Query, @Mutation, and @Subscription decorators and generates GraphQL schema documentation alongside any REST endpoints in the same project.'
			},
			{
				q: 'How does it handle NestJS projects using Prisma or TypeORM?',
				a: 'Codec8 reads your Prisma schema or TypeORM entities and generates database model documentation that links directly to the service layer that uses each model.'
			}
		]
	},

	{
		slug: 'rails',
		name: 'Ruby on Rails',
		type: 'framework',
		parent: 'ruby',
		headline: 'Rails documentation generator — models, controllers, and routes all documented',
		description:
			'Auto-generate Ruby on Rails application documentation. Codec8 reads your models, routes, controllers, and Gemfile to produce complete project and API documentation.',
		pain_point:
			'Rails apps follow convention over configuration, but "convention" is only useful if you know the conventions. New developers joining a Rails project still need documentation explaining the domain model, non-standard patterns, and deployment setup.',
		example_repos: [
			'rails/rails',
			'houndci/hound',
			'discourse/discourse'
		],
		features: [
			'Documents ActiveRecord models with associations, validations, scopes, and database columns',
			'Generates API route reference from rake routes output structure with controller#action mapping',
			'Documents Devise or custom authentication setup and which controllers require sign-in',
			'Produces complete development setup guide — bundle install, database setup, credentials, seeds'
		],
		faqs: [
			{
				q: 'Does it work for Rails API-only applications as well as full-stack Rails?',
				a: 'Yes. For API-only Rails apps (--api flag), Codec8 focuses on endpoint documentation, serializer schemas, and authentication. For full-stack apps it also documents view templates and helpers.'
			},
			{
				q: 'Can it document Rails engines as well as full applications?',
				a: 'Yes. Codec8 handles Rails engines and generates documentation appropriate for engine consumers — how to mount the engine, configure it, and use its public API.'
			},
			{
				q: 'How does it handle ActiveJob, ActionMailer, and ActionCable documentation?',
				a: 'Codec8 documents all Rails framework layers — jobs with their perform arguments, mailers with template variables, and ActionCable channels with their subscription events.'
			}
		]
	},

	{
		slug: 'laravel',
		name: 'Laravel',
		type: 'framework',
		parent: 'php',
		headline: 'Laravel documentation generator — Eloquent models, routes, and jobs documented',
		description:
			'Auto-generate Laravel application documentation. Codec8 reads your Eloquent models, controllers, routes, and artisan commands to produce complete project documentation.',
		pain_point:
			'Laravel\'s expressive syntax makes it quick to build features but challenging to document. Eloquent relationships, policy-based authorization, and queued jobs are invisible to new team members without thorough documentation.',
		example_repos: [
			'laravel/laravel',
			'laravel/jetstream',
			'spatie/laravel-permission'
		],
		features: [
			'Documents Eloquent models with relationships (hasMany, belongsTo, etc.), casts, and scopes',
			'Generates route reference from routes/api.php and routes/web.php with middleware groups noted',
			'Documents Laravel jobs, events, listeners, and queues with payload and dispatch examples',
			'Produces complete .env setup guide from .env.example with explanations for each variable'
		],
		faqs: [
			{
				q: 'Does it work with Laravel Livewire and Inertia.js projects?',
				a: 'Yes. For Livewire projects, Codec8 documents component properties, methods, and events. For Inertia.js projects, it documents props passed from controllers to frontend components.'
			},
			{
				q: 'Can it document Laravel packages (Composer libraries)?',
				a: 'Yes. For Laravel packages, Codec8 generates installation and configuration documentation including service provider registration, facade usage, and config publishing.'
			},
			{
				q: 'How does it handle Laravel Sanctum or Passport API authentication documentation?',
				a: 'Codec8 detects your auth package and documents the token issuance flow, protected route configuration, and example API request headers in the authentication section.'
			}
		]
	},

	{
		slug: 'spring',
		name: 'Spring Boot',
		type: 'framework',
		parent: 'java',
		headline: 'Spring Boot documentation generator — REST controllers, beans, and config documented',
		description:
			'Auto-generate Spring Boot application documentation. Codec8 reads your controllers, service beans, repositories, and application.properties to produce complete developer docs.',
		pain_point:
			'Spring Boot applications have sprawling auto-configuration that makes them powerful but difficult to explain to someone new. Writing documentation that explains what beans exist, what each endpoint does, and how to run the app locally takes days.',
		example_repos: [
			'spring-projects/spring-boot',
			'codecentric/spring-boot-admin',
			'jhipster/jhipster'
		],
		features: [
			'Documents @RestController and @Controller endpoints with request mappings and response types',
			'Generates Spring Bean dependency graph showing @Autowired relationships between components',
			'Documents application.properties and application.yml configuration keys with descriptions',
			'Reads Spring Security configuration and documents which endpoints require which roles/authorities'
		],
		faqs: [
			{
				q: 'Does it support Spring WebFlux reactive projects as well as Spring MVC?',
				a: 'Yes. Codec8 detects Spring WebFlux usage and documents reactive endpoints, Flux/Mono return types, and reactive data access layers differently from blocking MVC equivalents.'
			},
			{
				q: 'Can it document Spring Boot projects using JPA/Hibernate or Spring Data MongoDB?',
				a: 'Yes. Codec8 reads JPA @Entity classes or Spring Data MongoDB @Document classes and generates database model documentation alongside the REST API reference.'
			},
			{
				q: 'How does it handle Spring Boot multi-module Maven or Gradle projects?',
				a: 'Codec8 reads the parent build file and each module, generating per-module documentation and a top-level architecture overview that explains the purpose of each Spring Boot module.'
			}
		]
	}
];

export const LANGUAGE_PAGES = SEO_PAGES.filter((p) => p.type === 'language');
export const FRAMEWORK_PAGES = SEO_PAGES.filter((p) => p.type === 'framework');

export function getRelatedPages(page: SeoPage): SeoPage[] {
	if (page.type === 'language') {
		// Return frameworks that have this language as parent
		return SEO_PAGES.filter((p) => p.parent === page.slug).slice(0, 4);
	} else {
		// Return sibling frameworks and the parent language
		const siblings = SEO_PAGES.filter(
			(p) => p.parent === page.parent && p.slug !== page.slug
		).slice(0, 3);
		const parent = SEO_PAGES.find((p) => p.slug === page.parent);
		return parent ? [parent, ...siblings] : siblings;
	}
}
