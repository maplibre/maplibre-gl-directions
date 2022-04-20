<template>
  <app-sidebar>
    <template #title>{{ name }}</template>

    <label class="flex flex-col gap-2">
      <span><strong>Position</strong></span>
      <select v-model="position">
        <option value="top-left">Top-Left</option>
        <option value="top-right">Top-Right</option>
        <option value="bottom-left">Bottom-Left</option>
        <option value="bottom-right">Bottom-Right</option>
      </select>
    </label>

    <p>
      The <code>LoadingControl</code> adds a simple spinning loader-icon which automatically appears whenever there's an
      ongoing routing-request.
    </p>
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
  import MapLibreGlDirections from "@maplibre/maplibre-gl-directions";
  import { LoadingControl } from "@maplibre/maplibre-gl-directions";
  import "@maplibre/maplibre-gl-directions/dist/style.css";

  const name = ref(useRoute().matched[0].name);

  let map: maplibregl.Map;
  const directions = ref<MapLibreGlDirections>();
  let control: LoadingControl;

  const position = ref<maplibregl.ControlPosition>("top-right");
  watch([directions, position], () => {
    if (directions.value && position.value) {
      map.removeControl(control);
      map.addControl((control = new LoadingControl(directions.value, { class: "m-2" })), position.value);
    }
  });

  const mapRef = ref();
  onMounted(() => {
    map = new maplibregl.Map({
      container: mapRef.value,
      style,
      center: [-74.1197632, 40.6974034],
      zoom: 11,
      customAttribution: "<a href='http://project-osrm.org/' target='_blank'>&copy; OSRM</a>",
    });

    map.on("load", () => {
      directions.value = new MapLibreGlDirections(map, {
        requestOptions: {
          alternatives: "true",
        },
      });

      directions.value.interactive = true;
    });
  });
</script>
