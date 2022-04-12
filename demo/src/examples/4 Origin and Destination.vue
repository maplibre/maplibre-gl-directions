<template>
  <app-sidebar>
    <template #title>{{ name }}</template>

    <p>
      In this example the default layers used by the plugin are augmented with an additional "symbol" layer which is
      only rendered for the ORIGIN and DESTINATION waypoints.
    </p>

    <p>
      <strong>Note</strong> how you don't need to re-define all the layers from scratch thanks to the exported
      <code>layersFactory</code> function that returns all the default layers allowing for their augmentation and
      modification.
    </p>
  </app-sidebar>

  <div ref="mapRef" class="shadow-xl" />
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from "vue";
  import { useRoute } from "vue-router";
  import AppSidebar from "../components/AppSidebar.vue";
  import maplibregl from "maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";
  import style from "../assets/map/style/style.json?url";
  import MaplibreGlDirections, { layersFactory } from "@maplibre/maplibre-gl-directions";

  const name = ref(useRoute().matched[0].name);

  const directions = ref<MaplibreGlDirections>();

  const mapRef = ref();
  onMounted(() => {
    const map = new maplibregl.Map({
      container: mapRef.value,
      style,
      center: [-74.1197632, 40.6974034],
      zoom: 11,
    });

    const layers = layersFactory();
    layers.push({
      id: "maplibre-gl-directions-waypoint-label",
      type: "symbol",
      source: "maplibre-gl-directions",
      layout: {
        "text-field": [
          "case",
          ["==", ["get", "category"], "ORIGIN"],
          "A",
          ["==", ["get", "category"], "DESTINATION"],
          "B",
          "",
        ],
      },
      paint: {
        "text-color": "#ffffff",
        "text-opacity": 0.7,
      },
      filter: [
        "all",
        ["==", ["geometry-type"], "Point"],
        ["==", ["get", "type"], "WAYPOINT"],
        ["in", ["get", "category"], ["literal", ["ORIGIN", "DESTINATION"]]],
      ],
    });

    map.on("load", () => {
      directions.value = new MaplibreGlDirections(map, {
        requestOptions: {
          alternatives: "true",
        },
        layers,
      });

      directions.value.interactive = true;
    });
  });
</script>
