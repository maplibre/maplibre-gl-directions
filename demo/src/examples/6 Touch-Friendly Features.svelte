<script lang="ts">
  import { onMount } from "svelte";
  import { location } from "svelte-spa-router";
  import { examples } from "../router";
  import AppSidebar from "../components/AppSidebar.svelte";
  import maplibregl, { Map } from "maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";
  import style from "../assets/map/style/style.json?url";
  import MapLibreGlDirections, { layersFactory } from "@maplibre/maplibre-gl-directions";

  const meta = examples.find((example) => example.path === $location);

  let mapRef: HTMLElement | undefined = undefined;
  let map: Map | undefined = undefined;
  let directions: MapLibreGlDirections | undefined = undefined;

  // `maxTouchPoints` isn't recognized by TS. Safe to ignore.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;

  onMount(() => {
    const _map = new maplibregl.Map({
      container: mapRef,
      style,
      center: [-74.1197632, 40.6974034],
      zoom: 11,
      customAttribution: "<a href='http://project-osrm.org/' target='_blank'>&copy; OSRM</a>",
    });

    _map.on("load", () => {
      map = _map;
    });
  });

  $: if (map && directions) {
    if (directions) directions.destroy();

    const layers = layersFactory(isTouchDevice ? 1.5 : 1, isTouchDevice ? 2 : 1);

    directions = new MapLibreGlDirections(map, {
      requestOptions: {
        alternatives: "true",
      },
      layers,
    });

    directions.interactive = true;
  }
</script>

<AppSidebar>
  <span slot="title">{meta.name}</span>

  <label class="flex items-center gap-3">
    <input bind:checked={isTouchDevice} type="checkbox" />
    <strong>Simulate a Touch-Enabled Device</strong>
  </label>

  <p>
    Sometimes it's pretty hard to aim exactly at the selected route line to add a waypoint by dragging it when using the
    plugin on a touch device.
  </p>

  <p>
    The example shows how one could use the <code>layersFactory</code>'s input parameters to handle that case by
    increasing the points by 1.5 and the lines by 2 times when the map is used on a touch-enabled device.
  </p>

  <small
    ><strong>Note</strong> that you can either load the page on a touch-enabled device or toggle the checkbox above: both
    options apply the same effect</small
  >
</AppSidebar>

<div bind:this={mapRef} class="shadow-xl" />
