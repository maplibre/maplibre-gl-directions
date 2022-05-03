<script lang="ts">
  import { link } from "svelte-spa-router";
  import { examples } from "./router";
  import AppSidebar from "./components/AppSidebar.svelte";
</script>

<AppSidebar noHeader>
  <span slot="title">Examples</span>

  <ul>
    {#each examples as example}
      <li>
        <a href={example.path} use:link>{example.name}</a>
      </li>
    {/each}
  </ul>
</AppSidebar>

<div class="p-10 flex flex-col gap-10 justify-center items-center rounded-3xl shadow-xl">
  <h1 class="text-center max-w-3xl">Please, choose an example at the sidebar on the left</h1>

  <span class="text-slate-500">or navigate to</span>

  <div class="flex flex-col gap-5 justify-center items-center">
    <a href="https://github.com/maplibre/maplibre-gl-directions" target="_blank">GitHub</a>
    <a href={`${import.meta.env.BASE_URL}/api`} target="_blank">API</a>
  </div>
</div>
