<template>
  <app-sidebar>
    <template #title>{{ name }}</template>

    <label class="flex flex-col gap-2">
      <span><strong>Congestions</strong></span>
      <select v-model="annotations">
        <option value="congestion">Stringy</option>
        <option value="congestion_numeric">Numeric</option>
      </select>
    </label>

    <p>This example makes POST requests to the official Mapbox Directions API and enables the following options:</p>

    <ul>
      <li></li>
    </ul>
  </app-sidebar>

  <div ref="mapRef" class="shadow-xl" />
</template>

<script setup lang="ts">
  import { onMounted, ref, watch } from "vue";
  import { useRoute } from "vue-router";
  import AppSidebar from "../components/AppSidebar.vue";
  import maplibregl from "maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";
  import style from "../assets/map/style/style.json?url";
  import MaplibreGlDirections from "@maplibre/maplibre-gl-directions";

  const name = ref(useRoute().matched[0].name);

  const map = ref<maplibregl.Map>();
  const directions = ref<MaplibreGlDirections>();

  const annotations = ref("congestion");
  watch(annotations, () => {
    directions.value?.destroy();
    directions.value.init();
  });

  const mapRef = ref();
  onMounted(() => {
    const _map = new maplibregl.Map({
      container: mapRef.value,
      style,
      center: [-74.1197632, 40.6974034],
      zoom: 11,
    });

    _map.on("load", () => {
      map.value = _map;

      directions.value = new MaplibreGlDirections(map.value, {
        api: "https://api.mapbox.com/directions/v5",
        profile: "mapbox/driving-traffic",
        makePostRequest: true,
        requestOptions: {
          access_token:
            "pk.eyJ1Ijoic21lbGx5c2hvdmVsIiwiYSI6ImNsMWtoMm9najAwcjczb21vdm9hdjQyOXMifQ.oThCjV-a5XLNI0Ly-FEZXQ",
          alternatives: "true",
          annotations: annotations.value,
          overview: "full",
        },
      });

      directions.value.interactive = true;
    });
  });
</script>
