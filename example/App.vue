<template>
  <div ref="mapRef" class="h-full" />
</template>

<script setup lang="ts">
  import { ref, watch } from "vue";
  import maplibregl from "maplibre-gl";
  import type { Map } from "maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";
  import style from "./assets/map/style.json";
  // import as module but configure vite config to resolve module from dist
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

  eventuallyMap.then((map) => {
    // map.on("click", (e) => {
    //   console.log(e.lngLat);
    // });
    const directions = new MaplibreGlDirections(map);
    directions.interactive = true;

    // setTimeout(() => {
    //   directions.interactive = false;
    // }, 6000);
    // map.addControl(new MaplibreGlDirectionsControl());
  });
</script>
