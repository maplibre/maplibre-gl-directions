<template>
  <app-sidebar no-header>
    <template #title>Examples</template>

    <ul>
      <li v-for="example in examples" :key="example.name">
        <router-link :to="{ name: example.name }">{{ example.name }}</router-link>
      </li>
    </ul>
  </app-sidebar>

  <div class="p-10 flex flex-col gap-10 justify-center items-center rounded-3xl shadow-xl">
    <h1 class="text-center max-w-3xl">Please, choose an example at the sidebar on the left</h1>

    <span class="text-slate-500">or navigate to</span>

    <div class="flex flex-col gap-5 justify-center items-center">
      <a href="https://github.com/maplibre/maplibre-gl-directions">GitHub</a>
      <a href="/api">API</a>
    </div>
  </div>
</template>

<script setup lang="ts">
  import AppSidebar from "./components/AppSidebar.vue";
  import { examples } from "./main";
</script>
