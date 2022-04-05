<template>
  <app-sidebar>
    <template #title>{{ name }}</template>

    <label class="flex items-center gap-3">
      <input v-model="interactive" type="checkbox" />
      <strong>Interactivity enabled</strong>
    </label>

    <ul>
      <li>Click somewhere on the map to add a waypoint</li>
      <li>Click a waypoint to remove it and its related snappoint</li>
      <li>Click a snappoint to remove it and its related waypoint</li>
      <li>Drag a waypoint somewhere to move it</li>
      <li>Drag a routeline somewhere to add a waypoint in-between the 2 nearest ones</li>
      <li>
        Click an alternative routeline to select it<br />
        <small
          ><strong>Note</strong>, there's usually no alternative routelines in the server response if there are more
          than 2 waypoints</small
        >
      </li>
    </ul>
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
  import MaplibreGlDirections from "maplibre-gl-directions";

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

    map.on("load", () => {
      directions.value = new MaplibreGlDirections(map, {
        requestOptions: {
          alternatives: "true",
        },
      });

      directions.value.interactive = true;
    });
  });

  const interactive = computed({
    get() {
      return directions.value?.interactive ?? false;
    },

    set(value: boolean) {
      if (directions.value) {
        directions.value.interactive = value;
      }
    },
  });
</script>
