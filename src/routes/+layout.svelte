<script lang="ts">
  import '../app.css';
  import { auth } from '$lib/stores/auth';
  import type { LayoutData } from './$types';

  export let data: LayoutData;

  $: if (data.user) {
    auth.setUser(data.user);
  } else {
    auth.setUser(null);
  }
</script>

<slot />
