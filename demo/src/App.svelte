<script lang="ts">
  import Router from "svelte-spa-router";
  import { routes } from "./router";
</script>

<main class="p-5 lg:p-10 flex flex-col lg:flex-row landscape:flex-row w-full gap-5 lg:gap-10">
  <Router {routes} />
</main>
