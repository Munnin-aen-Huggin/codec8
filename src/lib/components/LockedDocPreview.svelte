<script lang="ts">
	export let docType: 'api' | 'architecture' | 'setup';

	const docConfig = {
		api: {
			title: 'API Documentation',
			preview: 'Auto-detected endpoints, request/response examples, authentication docs, OpenAPI spec generation...',
			color: 'text-blue-400',
			iconPath: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
		},
		architecture: {
			title: 'Architecture Diagram',
			preview: 'Component relationships, data flow visualization, Mermaid.js diagrams, system overview...',
			color: 'text-purple-400',
			iconPath: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z'
		},
		setup: {
			title: 'Setup Guide',
			preview: 'Environment configuration, dependency installation, deployment steps, troubleshooting...',
			color: 'text-orange-400',
			iconPath: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z'
		}
	};

	$: config = docConfig[docType];
</script>

<a
	href="/auth/login?intent=trial&tier=pro"
	class="group block p-6 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-emerald-500/50 hover:bg-zinc-900 transition-all relative overflow-hidden"
>
	<!-- Blurred overlay -->
	<div class="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/80 to-transparent z-10 pointer-events-none"></div>

	<div class="relative z-20">
		<!-- Header -->
		<div class="flex items-center gap-3 mb-3">
			<svg class="w-6 h-6 {config.color}" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={config.iconPath} />
			</svg>
			<h3 class="font-semibold text-white flex-1">{config.title}</h3>
			<svg class="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
			</svg>
		</div>

		<!-- Blurred preview text -->
		<p class="text-zinc-500 text-sm blur-[2px] select-none mb-4 line-clamp-2">
			{config.preview}
		</p>

		<!-- CTA -->
		<div class="flex items-center gap-2 text-emerald-400 text-sm font-medium group-hover:text-emerald-300 transition-colors">
			<span>Unlock with free trial</span>
			<svg class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
			</svg>
		</div>
	</div>
</a>
