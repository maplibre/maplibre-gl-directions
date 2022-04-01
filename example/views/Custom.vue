<template>
  <div class="flex flex-col h-full">
    <div class="p-4 flex justify-between items-center">
      <div class="flex gap-2">
        <label class="flex gap-2 items-center">
          <input v-model="straightLinesMode" type="checkbox" />
          <span>Straight Lines Mode</span>
        </label>

        <button :disabled="!directions" @click="clearRoutes">Clear Routes</button>
      </div>

      <div>
        <router-link to="/">Default</router-link>
      </div>
    </div>

    <div ref="mapRef" class="h-full" />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, onUnmounted, ref, watch } from "vue";
  import maplibregl from "maplibre-gl";
  import type { Map } from "maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";
  import style from "../assets/map/style.json";
  import CustomMaplibreGlDirections from "../custom-maplibre-gl-directions/main";
  import { layersFactory } from "../../src/main";

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

  const straightLinesMode = ref(false);

  watch(straightLinesMode, async () => {
    await eventuallyMap;
    directions.value.straightLinesMode = straightLinesMode.value;
  });

  let controlDownHandler: (event: KeyboardEvent) => void;
  let controlUpHandler: (event: KeyboardEvent) => void;

  onMounted(() => {
    document.addEventListener(
      "keydown",
      (controlDownHandler = (event) => {
        if (event.key === "Control") straightLinesMode.value = true;
      }),
    );

    document.addEventListener(
      "keyup",
      (controlDownHandler = (event) => {
        if (event.key === "Control") straightLinesMode.value = false;
      }),
    );
  });

  onUnmounted(() => {
    document.removeEventListener("keydown", controlDownHandler);
    document.removeEventListener("keyup", controlUpHandler);
  });

  const layers = layersFactory();

  layers[9].paint["circle-color"] = layers[10].paint["circle-color"] = [
    "case",
    ["boolean", ["get", "straightLinesMode"], false],
    ["case", ["boolean", ["get", "highlight"], false], "#e8b331", "#f1cc5a"],
    ["case", ["boolean", ["get", "highlight"], false], "#6d26d7", "#7b33e7"],
  ];

  const directions = ref();

  eventuallyMap.then((map) => {
    directions.value = new CustomMaplibreGlDirections(map, {
      request: {
        access_token:
          "pk.eyJ1Ijoic21lbGx5c2hvdmVsIiwiYSI6ImNsMWI3ZjByczFuYmUzanBmeWMxemQ1MzQifQ.stv4tSZc_8ProkPWVNb31A",
      },
      makePostRequest: true,
      layers,
    });

    directions.value.interactive = true;
  });

  function clearRoutes() {
    directions.value.clearRoutes();
  }
</script>
