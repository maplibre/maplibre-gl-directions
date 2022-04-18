<template>
  <app-sidebar>
    <template #title>{{ name }}</template>

    <p>
      This example listens for all the available events and logs them below. Interact with the map to see the emitted
      events.
    </p>

    <ol>
      <!-- eslint-disable-next-line -->
      <li v-for="message in messages" :key="message" v-html="message" />
    </ol>

    <button v-if="messages.length" @click="messages = []">Clear</button>
  </app-sidebar>

  <div ref="mapRef" class="shadow-xl" />
</template>

<script setup lang="ts">
  import { onMounted, ref } from "vue";
  import { useRoute } from "vue-router";
  import AppSidebar from "../components/AppSidebar.vue";
  import maplibregl from "maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";
  import style from "../assets/map/style/style.json?url";
  import MaplibreGlDirections from "@maplibre/maplibre-gl-directions";

  const name = ref(useRoute().matched[0].name);

  const directions = ref<MaplibreGlDirections>();

  const messages = ref<string[]>([]);

  const mapRef = ref();
  onMounted(() => {
    const map = new maplibregl.Map({
      container: mapRef.value,
      style,
      center: [-74.1197632, 40.6974034],
      zoom: 11,
      customAttribution: "<a href='http://project-osrm.org/' target='_blank'>&copy; OSRM</a>",
    });

    map.on("load", () => {
      directions.value = new MaplibreGlDirections(map, {
        requestOptions: {
          alternatives: "true",
        },
      });

      directions.value.interactive = true;

      directions.value?.on("addwaypoint", (e) => {
        messages.value.push(
          `<strong>${e.type}</strong>: waypoint added at index <strong>${e.data?.index}</strong>. Original event - <strong>${e.originalEvent?.type}</strong>`,
        );
      });

      directions.value?.on("removewaypoint", (e) => {
        messages.value.push(
          `<strong>${e.type}</strong>: waypoint removed at index <strong>${e.data?.index}</strong>. Original event - <strong>${e.originalEvent?.type}</strong>`,
        );
      });

      directions.value?.on("movewaypoint", (e) => {
        messages.value.push(
          `<strong>${e.type}</strong>: waypoint moved from coordinates ${e.data?.initialCoordinates
            ?.map((c) => c.toFixed(5))
            .join(", ")}. Original event - <strong>${e.originalEvent?.type}</strong>`,
        );
      });

      directions.value?.on("fetchroutesstart", (e) => {
        messages.value.push(
          `<strong>${e.type}</strong>: routing request started. Original event - <strong>${e.originalEvent.type}</strong>`,
        );
      });

      directions.value?.on("fetchroutesend", (e) => {
        messages.value.push(
          `<strong>${e.type}</strong>: routing request finished with code <strong>${e.data?.code}</strong>. Original event - <strong>${e.originalEvent.type}</strong>`,
        );
      });
    });
  });
</script>
