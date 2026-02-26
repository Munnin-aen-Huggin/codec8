<script lang="ts">
	import '../app.css';
	import { auth } from '$lib/stores/auth';
	import Toast from '$lib/components/Toast.svelte';
	import FeedbackWidget from '$lib/components/FeedbackWidget.svelte';
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	$: if (data.user) {
		auth.setUser(data.user);
	} else {
		auth.setUser(null);
	}
</script>

<svelte:head>
	<meta property="og:site_name" content="Codec8" />
	<meta property="og:type" content="website" />
	<meta property="og:image" content="https://codec8.com/og-image.png" />
	<meta name="twitter:site" content="@code_c8" />
</svelte:head>

<Toast />
{#if data.user}
	<FeedbackWidget />
{/if}
<slot />
