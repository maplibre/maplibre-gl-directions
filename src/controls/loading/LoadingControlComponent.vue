<template>
  <span v-if="loading">
    <img :src="LoaderGifSrc" class="m-2 w-6 h-6" />
  </span>
</template>

<script setup lang="ts">
  import { ref } from "vue";
  import MapLibreGlDirections from "../../directions/main";
  import LoaderGifSrc from "./loader.svg?url";

  const props = defineProps<{
    directions: MapLibreGlDirections;
  }>();

  props.directions.on("fetchroutesstart", () => {
    loading.value = true;
  });

  props.directions.on("fetchroutesend", () => {
    loading.value = false;
  });

  const loading = ref(false);
</script>
