<script lang="ts">
  import { onMount } from "svelte";
  import { examples } from "../router";
  import { location } from "svelte-spa-router";
  import AppSidebar from "../components/AppSidebar.svelte";
  import maplibregl, { Map, ControlPosition } from "maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";
  import style from "../assets/map/style/style.json?url";
  import MapLibreGlDirections, { BearingsControl } from "@maplibre/maplibre-gl-directions";

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
        api: "https://api.mapbox.com/directions/v5",
        profile: "mapbox/driving-traffic",
        makePostRequest: true,
        requestOptions: {
          access_token:
            "pk.eyJ1Ijoic21lbGx5c2hvdmVsIiwiYSI6ImNsMW80eXQ4aTEwN3czcG8zMXM2NzJ2ODIifQ.oWHUIUiEj2SS4_hue3qv2g",
        },
        bearings: true,
      });

      directions.interactive = true;
    });
  });

  let control: BearingsControl;
  let position: ControlPosition = "top-left";

  $: if (map && directions) {
    if (control && map.hasControl(control)) map.removeControl(control);
    map.addControl((control = new BearingsControl(directions, {})), position);
  }
</script>

<AppSidebar>
  <span slot="title">{meta.name}</span>

  <!--  <label class="flex flex-col gap-2">-->
  <!--    <span><strong>Position</strong></span>-->
  <!--    <select bind:value={position} disabled={!directions}>-->
  <!--      <option value="top-left">Top-Left</option>-->
  <!--      <option value="top-right">Top-Right</option>-->
  <!--      <option value="bottom-left">Bottom-Left</option>-->
  <!--      <option value="bottom-right">Bottom-Right</option>-->
  <!--    </select>-->
  <!--  </label>-->

  <p>
    The <code>BearingsControl</code> adds a control to modify the waypoints' bearings values.
  </p>
</AppSidebar>

<div bind:this={mapRef} class="basis-full lg:basis-2/3 shadow-xl" />
