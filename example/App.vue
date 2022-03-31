<template>
  <div class="flex flex-col h-full">
    <div class="p-4 flex gap-2">
      <label class="flex gap-2 items-center">
        <input v-model="interactive" type="checkbox" />
        <span>Interactive</span>
      </label>

      <button :disabled="!directions" @click="clearRoutes">Clear Routes</button>
    </div>
    <div ref="mapRef" class="h-full" />
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from "vue";
  import maplibregl from "maplibre-gl";
  import type { Map } from "maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";
  import style from "./assets/map/style.json";
  import MaplibreGlDirections from "../src/main";

  const mapRef = ref();
  const eventuallyMap = new Promise<Map>((res) => {
    watch(mapRef, () => {
      if (mapRef.value) {
        const _map = new maplibregl.Map({
          container: mapRef.value,
          style,
        });

        _map.on("load", () => {
          res(_map);
        });
      }
    });
  });

  const interactive = ref(true);

  watch(interactive, () => {
    directions.value.interactive = interactive.value;
  });

  const directions = ref();

  eventuallyMap.then((map) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;

    directions.value = new MaplibreGlDirections(map, {
      request: {
        access_token:
          "pk.eyJ1Ijoic21lbGx5c2hvdmVsIiwiYSI6ImNsMWI3ZjByczFuYmUzanBmeWMxemQ1MzQifQ.stv4tSZc_8ProkPWVNb31A",
        // alternatives: true,
        // annotations: "congestion",
        // geometries: "polyline6",
        // overview: "full",
      },
    });

    directions.value.interactive = interactive.value;

    // directions.value.on("interactive", ({ interactive }) => {
    //   interactive.value = interactive;
    // });
  });

  function clearRoutes() {
    directions.value.clearRoutes();
  }
</script>
