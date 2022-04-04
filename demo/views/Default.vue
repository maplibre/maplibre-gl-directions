<template>
  <div class="flex flex-col h-full">
    <div class="p-4 flex justify-between items-center">
      <div class="flex gap-2">
        <label class="flex gap-2 items-center">
          <input v-model="interactive" type="checkbox" />
          <span>Interactive</span>
        </label>

        <button :disabled="!directions" @click="clearRoutes">Clear Routes</button>
      </div>

      <div>
        <router-link to="/custom">Custom</router-link>
      </div>
    </div>

    <div ref="mapRef" class="h-full" />
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from "vue";

  import maplibregl from "maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";
  import type { Map } from "maplibre-gl";
  import style from "../assets/map/style/style.json";

  // make sure you ran `npm link` and `npm link maplibre-gl-direction` if you've got an error here
  import MaplibreGlDirections from "maplibre-gl-directions";

  const mapRef = ref();
  const eventuallyMap = new Promise<Map>((res) => {
    watch(mapRef, () => {
      if (mapRef.value) {
        const _map = new maplibregl.Map({
          container: mapRef.value,
          style,
          center: [-73.8271025, 40.8032906],
          zoom: 10,
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

  const directions = ref<MaplibreGlDirections>();

  eventuallyMap.then((map) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;

    directions.value = new MaplibreGlDirections(map, {
      makePostRequest: true,
      api: "https://api.mapbox.com/directions/v5",
      profile: "mapbox/driving-traffic",
      request: {
        access_token:
          "pk.eyJ1Ijoic21lbGx5c2hvdmVsIiwiYSI6ImNsMWtoMm9najAwcjczb21vdm9hdjQyOXMifQ.oThCjV-a5XLNI0Ly-FEZXQ",
        alternatives: "true",
      },
    });

    directions.value.interactive = interactive.value;

    // directions.value.on("interactive", ({ interactive }) => {
    //   interactive.value = interactive;
    // });
  });

  function clearRoutes() {
    directions.value.clear();
  }
</script>
