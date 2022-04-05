<template>
  <aside class="basis-1/3 overflow-hidden shadow-xl">
    <div class="h-full flex flex-col bg-inherit overflow-y-auto">
      <header v-if="!props.noHeader" class="p-10 pb-5 flex justify-between gap-5 sticky top-0 bg-inherit">
        <router-link :to="{ name: 'Menu' }">Back to Menu</router-link>
        <a :href="sourceLink">Source</a>
      </header>

      <article class="p-10 flex flex-col gap-3" :class="{ 'pt-0': !props.noHeader }">
        <h1 class="">
          <slot name="title" />
        </h1>

        <slot name="default" />
      </article>
    </div>
  </aside>
</template>

<script setup lang="ts">
  import { ref } from "vue";
  import { useRoute } from "vue-router";

  const props = defineProps<{
    noHeader?: boolean;
  }>();

  const sourceLink = ref(
    `https://github.com/smellyshovel/maplibre-gl-directions/tree/main/demo/src/${
      useRoute().matched[0].meta["originPath"]
    }}`,
  );
</script>

<style scoped>
  ::-webkit-scrollbar {
    width: 10px;
    @apply bg-transparent;
  }

  ::-webkit-scrollbar-thumb {
    @apply bg-slate-600 hover:bg-slate-500 rounded-md border-2 border-amber-50;
  }
</style>
