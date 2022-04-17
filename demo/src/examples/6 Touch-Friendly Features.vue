<template>
  <app-sidebar>
    <template #title>{{ name }}</template>

    <label class="flex items-center gap-3">
      <input v-model="isTouchDeviceProxy" type="checkbox" />
      <strong>Simulate a Touch-Enabled Device</strong>
    </label>

    <p>
      Sometimes it's pretty hard to aim exactly at the selected route line to add a waypoint by dragging it when using
      the plugin on a touch device.
    </p>

    <p>
      The example shows how one could use the <code>layersFactory</code>'s input parameters to handle that case by
      increasing the points by 1.5 and the lines by 2 times when the map is used on a touch-enabled device.
    </p>

    <small
      ><strong>Note</strong> that you can either load the page on a touch-enabled device or toggle the checkbox above:
      both options apply the same effect</small
    >
  </app-sidebar>

  <div ref="mapRef" :key="isTouchDeviceProxy" class="shadow-xl" />
</template>

<script setup lang="ts">
  import { computed, ref, watch } from "vue";
  import { useRoute } from "vue-router";
  import AppSidebar from "../components/AppSidebar.vue";
  import maplibregl from "maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";
  import style from "../assets/map/style/style.json?url";
  import MaplibreGlDirections from "@maplibre/maplibre-gl-directions";
  import { layersFactory } from "@maplibre/maplibre-gl-directions";

  const name = ref(useRoute().matched[0].name);

  const directions = ref<MaplibreGlDirections>();

  const mapRef = ref();
  watch(mapRef, () => {
    if (mapRef.value) {
      const map = new maplibregl.Map({
        container: mapRef.value,
        style,
        center: [-74.1197632, 40.6974034],
        zoom: 11,
        customAttribution: "<a href='http://project-osrm.org/' target='_blank'>&copy; OSRM</a>",
      });

      const layers = layersFactory(isTouchDeviceProxy.value ? 1.5 : 1, isTouchDeviceProxy.value ? 2 : 1);

      map.on("load", () => {
        directions.value = new MaplibreGlDirections(map, {
          requestOptions: {
            alternatives: "true",
          },
          layers,
        });

        directions.value.interactive = true;
      });
    }
  });

  const isTouchDevice = ref("ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0);

  const isTouchDeviceProxy = computed({
    get() {
      return isTouchDevice.value;
    },

    set(value: boolean) {
      isTouchDevice.value = value;
    },
  });
</script>
