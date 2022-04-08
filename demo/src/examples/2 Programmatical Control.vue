<template>
  <app-sidebar>
    <template #title>{{ name }}</template>

    <small><strong>Note</strong> that interactivity is disabled for this example</small>

    <div class="flex flex-col gap-2">
      <p>Set waypoints to a predefined set</p>
      <button :disabled="!map || !directions" class="self-center" @click="setPredefinedWaypoints">Set Waypoints</button>
    </div>

    <div class="flex flex-col gap-2">
      <p>Add a random waypoint at some random index</p>
      <button :disabled="!map || !directions" class="self-center" @click="addRandomWaypoint">Add Waypoint</button>
    </div>

    <div class="flex flex-col gap-2">
      <p>Delete a random waypoint</p>
      <button :disabled="!map || !directions" class="self-center" @click="deleteRandomWaypoint">Delete Waypoint</button>
    </div>

    <div class="flex flex-col gap-2">
      <p>Clear the map from all the stuff added by the plugin</p>
      <button :disabled="!map || !directions" class="self-center" @click="clear">Clear</button>
    </div>
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

  const map = ref<maplibregl.Map>();
  const directions = ref<MaplibreGlDirections>();

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
        requestOptions: {
          alternatives: "true",
        },
      });
    });
  });

  function setPredefinedWaypoints() {
    directions.value?.setWaypoints([
      [-74.21349031181673, 40.704951524836275],
      [-74.19666749687558, 40.738517300855904],
      [-74.16611177177786, 40.76634583723629],
      [-74.07169801445302, 40.719004374548206],
      [-73.99170381279369, 40.725509319065594],
      [-73.98071748466812, 40.762445342516145],
    ]);
  }

  function addRandomWaypoint() {
    const bounds = map.value?.getBounds();
    const center = map.value?.getCenter();

    if (bounds && center) {
      const xField = bounds.getEast() - bounds.getWest();
      const yField = bounds.getSouth() - bounds.getNorth();

      directions.value?.addWaypoint(
        [center.lng - xField / 2 + xField * Math.random(), center.lat - yField / 2 + yField * Math.random()],
        (directions.value?.waypoints.length * Math.random()) | 0,
      );
    }
  }

  function deleteRandomWaypoint() {
    directions.value?.removeWaypoint((directions.value?.waypoints.length * Math.random()) | 0);
  }

  function clear() {
    directions.value?.clear();
  }
</script>
