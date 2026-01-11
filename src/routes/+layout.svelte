<script lang="ts">
  import '../app.css';
  import { auth } from '$lib/stores/auth';
  import Toast from '$lib/components/Toast.svelte';
  import type { LayoutData } from './$types';

  export let data: LayoutData;

  $: if (data.user) {
    auth.setUser(data.user);
  } else {
    auth.setUser(null);
  }
</script>

<Toast />
<slot />
