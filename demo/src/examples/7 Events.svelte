<script lang="ts">
  import { onMount } from "svelte";
  import { location } from "svelte-spa-router";
  import { examples } from "../router";
  import AppSidebar from "../components/AppSidebar.svelte";
  import maplibregl from "maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";
  import style from "../assets/map/style/style.json?url";
  import MapLibreGlDirections from "@maplibre/maplibre-gl-directions";

  const meta = examples.find((example) => example.path === $location);

  let mapRef: HTMLElement | undefined = undefined;
  let directions: MapLibreGlDirections | undefined = undefined;
  let messages: string[] = [];

  onMount(() => {
    const map = new maplibregl.Map({
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

      directions.on("addwaypoint", (e) => {
        messages.push(
          `<strong>${e.type}</strong>: waypoint added at index <strong>${e.data?.index}</strong>. Original event - <strong>${e.originalEvent?.type}</strong>`,
        );
        messages = messages;
      });

      directions.on("removewaypoint", (e) => {
        messages.push(
          `<strong>${e.type}</strong>: waypoint removed at index <strong>${e.data?.index}</strong>. Original event - <strong>${e.originalEvent?.type}</strong>`,
        );
        messages = messages;
      });

      directions.on("movewaypoint", (e) => {
        messages.push(
          `<strong>${e.type}</strong>: waypoint at index <strong>${
            e.data?.index
          }</strong> moved from coordinates ${e.data?.initialCoordinates
            ?.map((c) => c.toFixed(5))
            .join(", ")}. Original event - <strong>${e.originalEvent?.type}</strong>`,
        );
        messages = messages;
      });

      directions.on("fetchroutesstart", (e) => {
        messages.push(
          `<strong>${e.type}</strong>: routing request started. Original event - <strong>${e.originalEvent.type}</strong>`,
        );
        messages = messages;
      });

      directions.on("fetchroutesend", (e) => {
        messages.push(
          `<strong>${e.type}</strong>: routing request finished with code <strong>${e.data?.code}</strong>. Original event - <strong>${e.originalEvent.type}</strong>`,
        );
        messages = messages;
      });
    });
  });
</script>

<AppSidebar>
  <span slot="title">{meta.name}</span>

  <p>
    This example listens for all the available events and logs them below. Interact with the map to see the emitted
    events.
  </p>

  <ol>
    {#each messages as message}
      <li>{@html message}</li>
    {/each}
  </ol>

  <button disabled={!messages.length} on:click={() => (messages = [])}>Clear</button>
</AppSidebar>

<div bind:this={mapRef} class="shadow-xl" />
