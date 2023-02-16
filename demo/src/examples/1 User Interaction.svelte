<script lang="ts">
  import { onMount } from "svelte";
  import { examples } from "../router";
  import { location } from "svelte-spa-router";
  import AppSidebar from "../components/AppSidebar.svelte";
  import maplibregl from "maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";
  import style from "../assets/map/style/style.json?url";
  import MapLibreGlDirections from "@maplibre/maplibre-gl-directions";

  const meta = examples.find((example) => example.path === $location);

  let mapRef: HTMLElement | undefined = undefined;
  let map: maplibregl.Map | undefined = undefined;
  let directions: MapLibreGlDirections | undefined = undefined;
  let interactive = true;
  let refreshOnMove = false;

  function changeRefreshOnMove() {
    if (directions) directions.destroy();

    directions = new MapLibreGlDirections(map, {
      requestOptions: {
        alternatives: "true",
      },
      refreshOnMove: !refreshOnMove,
    });
  }

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
    });
  });

  let message;

  $: if (directions) {
    directions.interactive = interactive;

    directions.on("fetchroutesend", (event) => {
      if (event.data.code !== "Ok") {
        message = `${event.data.code}: ${event.data.message ?? "no details available."}`;
      } else {
        message = "";
      }
    });
  }
</script>

<AppSidebar>
  <span slot="title">{meta.name}</span>

  {#if message}
    <p class="text-red-500">{message}</p>
  {/if}

  <label class="flex items-center gap-3">
    <input type="checkbox" bind:checked={interactive} disabled={!directions} />
    <strong>Interactivity enabled</strong>
  </label>

  <label class="flex items-center gap-3">
    <input type="checkbox" bind:checked={refreshOnMove} on:click={changeRefreshOnMove} disabled={!directions} />
    <strong>Update route while dragging</strong>
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
        ><strong>Note</strong>, there's usually no alternative routelines in the server response if there are more than
        2 waypoints</small
      >
    </li>
  </ul>
</AppSidebar>

<div bind:this={mapRef} class="basis-full lg:basis-2/3 shadow-xl" />
