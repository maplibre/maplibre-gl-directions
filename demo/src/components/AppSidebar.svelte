<script lang="ts">
  import { link, location } from "svelte-spa-router";
  import { examples } from "../router";

  export let noHeader = false;

  const meta = examples.find((example) => example.path === $location);
</script>

<aside class="basis-full lg:basis-1/3 overflow-hidden shadow-xl">
  <div class="h-full flex flex-col bg-inherit overflow-x-hidden overflow-y-auto">
    {#if !noHeader}
      <header class="p-5 lg:p-10 pb-2.5 lg:pb-5 flex justify-between gap-2.5 lg:gap-5 sticky top-0 bg-inherit">
        <a href="/" use:link>Back to Menu</a>
        <a href={meta.sourceUrl} target="_blank" rel="noreferrer">Source</a>
      </header>
    {/if}

    <article class="p-5 lg:p-10 flex flex-col gap-1.5 lg:gap-3" class:!pt-0={!noHeader}>
      <h1 class="break-all">
        <slot name="title" />
      </h1>

      <slot />
    </article>
  </div>
</aside>

<style lang="postcss">
  ::-webkit-scrollbar {
    width: 10px;
    @apply bg-transparent;
  }

  ::-webkit-scrollbar-thumb {
    @apply bg-slate-600 hover:bg-slate-500 rounded-md border-2 border-amber-50;
  }
</style>
