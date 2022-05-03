<script lang="ts">
  import Router from "svelte-spa-router";
  import { routes } from "./router";
</script>

<main class="p-10 flex w-full gap-10">
  <Router {routes} />
</main>
