<script lang="ts">
  import { onMount } from "svelte";
  import { location } from "svelte-spa-router";
  import { examples } from "../router";
  import AppSidebar from "../components/AppSidebar.svelte";
  import maplibregl, { Map, ControlPosition } from "maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";
  import style from "../assets/map/style/style.json?url";
  import MapLibreGlDirections, { LoadingIndicatorControl } from "@maplibre/maplibre-gl-directions";

  const meta = examples.find((example) => example.path === $location);

  let mapRef: HTMLElement | undefined = undefined;
  let map: Map | undefined = undefined;
  let directions: MapLibreGlDirections | undefined = undefined;

  onMount(() => {
    map = new maplibregl.Map({
      container: mapRef,
      style,
      center: [-74.1197632, 40.6974034],
      zoom: 11,
      customAttribution: "<a href='http://project-osrm.org/' target='_blank'>&copy; OSRM</a>",
    });

    map.on("load", () => {
      directions = new MapLibreGlDirections(map, {
        requestOptions: {
          alternatives: "true",
        },
      });

      directions.interactive = true;
    });
  });

  let control: LoadingIndicatorControl;
  let position: ControlPosition = "top-right";

  $: if (map && directions) {
    if (control && map.hasControl(control)) map.removeControl(control);
    map.addControl((control = new LoadingIndicatorControl(directions, { class: "m-2" })), position);
  }
</script>

<AppSidebar>
  <span slot="title">{meta.name}</span>

  <label class="flex flex-col gap-2">
    <span><strong>Position</strong></span>
    <select bind:value={position}>
      <option value="top-left">Top-Left</option>
      <option value="top-right">Top-Right</option>
      <option value="bottom-left">Bottom-Left</option>
      <option value="bottom-right">Bottom-Right</option>
    </select>
  </label>

  <p>
    The <code>LoadingIndicatorControl</code> adds a simple spinning loader-icon which automatically appears whenever there's
    an ongoing routing-request.
  </p>
</AppSidebar>

<div bind:this={mapRef} class="shadow-xl" />
