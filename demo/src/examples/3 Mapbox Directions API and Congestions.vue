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

    <p>This example makes POST requests to the official Mapbox Directions API with the following options:</p>

    <ul>
      <li>
        <strong>annotations={{ annotations }}</strong>
      </li>
      <li>overview=full</li>
      <li>alternatives=true</li>
    </ul>
  </app-sidebar>

  <div ref="mapRef" :key="annotations" class="shadow-xl" />
</template>

<script setup lang="ts">
  import { ref, watch } from "vue";
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

  const mapRef = ref();
  watch(mapRef, () => {
    if (mapRef.value) {
      const _map = new maplibregl.Map({
        container: mapRef.value,
        style,
        center: [-74.1197632, 40.6974034],
        zoom: 11,
        customAttribution:
          "<a href='https://docs.mapbox.com/help/getting-started/directions/' target='_blank'>&copy; Mapbox Directions</a>",
      });

      _map.on("load", () => {
        map.value = _map;

        directions.value = new MaplibreGlDirections(map.value, {
          api: "https://api.mapbox.com/directions/v5",
          profile: "mapbox/driving-traffic",
          makePostRequest: true,
          requestOptions: {
            access_token:
              "pk.eyJ1Ijoic21lbGx5c2hvdmVsIiwiYSI6ImNsMW80eXQ4aTEwN3czcG8zMXM2NzJ2ODIifQ.oWHUIUiEj2SS4_hue3qv2g",
            alternatives: "true",
            annotations: annotations.value,
            overview: "full",
          },
        });

        directions.value.interactive = true;
      });
    }
  });
</script>
