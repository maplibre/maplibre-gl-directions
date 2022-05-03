<script lang="ts">
  import { onMount } from "svelte";
  import { location } from "svelte-spa-router";
  import { examples } from "../router";
  import AppSidebar from "../components/AppSidebar.svelte";
  import maplibregl, { Map } from "maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";
  import style from "../assets/map/style/style.json?url";
  import MapLibreGlDirections from "@maplibre/maplibre-gl-directions";

  const meta = examples.find((example) => example.path === $location);

  let mapRef: HTMLElement | undefined = undefined;
  let map: Map | undefined = undefined;
  let directions: MapLibreGlDirections | undefined = undefined;
  let annotations = "congestion";

  onMount(() => {
    const _map = new maplibregl.Map({
      container: mapRef,
      style,
      center: [-74.1197632, 40.6974034],
      zoom: 11,
      customAttribution: "<a href='//project-osrm.org/' target='_blank'>&copy; OSRM</a>",
    });

    _map.on("load", () => {
      map = _map;
    });
  });

  $: if (map && directions) {
    if (directions) directions.destroy();

    directions = new MapLibreGlDirections(map, {
      api: "https://api.mapbox.com/directions/v5",
      profile: "mapbox/driving-traffic",
      makePostRequest: true,
      requestOptions: {
        access_token:
          "pk.eyJ1Ijoic21lbGx5c2hvdmVsIiwiYSI6ImNsMW80eXQ4aTEwN3czcG8zMXM2NzJ2ODIifQ.oWHUIUiEj2SS4_hue3qv2g",
        alternatives: "true",
        annotations: annotations,
        overview: "full",
      },
    });

    directions.interactive = true;
  }
</script>

<AppSidebar>
  <span slot="title">{meta.name}</span>

  <label class="flex flex-col gap-2">
    <span><strong>Congestions</strong></span>
    <select bind:value={annotations} disabled={!directions}>
      <option value="congestion">Stringy</option>
      <option value="congestion_numeric">Numeric</option>
    </select>
  </label>

  <p>This example makes POST requests to the official Mapbox Directions API with the following options:</p>

  <ul>
    <li>
      <strong>annotations={annotations}</strong>
    </li>
    <li>overview=full</li>
    <li>alternatives=true</li>
  </ul>
</AppSidebar>

<div bind:this={mapRef} class="shadow-xl" />
