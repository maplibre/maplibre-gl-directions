<script lang="ts">
  import { onMount } from "svelte";
  import { examples } from "../router";
  import { location } from "svelte-spa-router";
  import AppSidebar from "../components/AppSidebar.svelte";
  import maplibregl from "maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";
  import style from "../assets/map/style/style.json?url";
  import DistanceMeasurementMapLibreGlDirections, { config } from "../assets/map/distance-measurement-directions";
  const meta = examples.find((example) => example.path === $location)!;

  let mapRef: HTMLElement;
  let directions: DistanceMeasurementMapLibreGlDirections;

  let totalDistance = 0;

  onMount(() => {
    const map = new maplibregl.Map({
      container: mapRef,
      style,
      center: [-74.1197632, 40.6974034],
      zoom: 11,
      attributionControl: false,
    });

    map.addControl(
      new maplibregl.AttributionControl({
        customAttribution: "<a href='http://project-osrm.org/' target='_blank' rel='noreferrer'>&copy; OSRM</a>",
      }),
    );

    map.on("load", () => {
      directions = new DistanceMeasurementMapLibreGlDirections(map, config);

      directions.on("fetchroutesend", (ev) => {
        totalDistance = ev.data.directions?.routes[0].distance as number;
      });

      directions.on("removewaypoint", () => {
        if (directions.waypoints.length < 2) {
          totalDistance = 0;
        }
      });

      directions.interactive = true;
    });
  });
</script>

<AppSidebar>
  <span slot="title">{meta.name}</span>

  <p>
    Total Route Distance:
    {#if totalDistance}
      <strong>{totalDistance}m</strong>
    {:else}
      <em>unknown</em>
    {/if}
  </p>

  <small
    ><strong>Note</strong> that you might want to zoom in and out the map to toggle the distance-annotations visibility</small
  >

  <p>
    This is an example of how one could use the plugin's extensibility interfaces to create a distance measurement tool
    out of it.
  </p>

  <p>
    Here we create a subclass of the <code>MapLibreGlDirections</code> main super class and augment the original
    <code>buildRoutelines</code>
    method to write each route leg's distance into a respective feature's <code>properties</code> object. These saved distances
    are then used by an additional "symbol" layer that displays them along the respective route's lines on the map.
  </p>

  <p>
    The total distance comes from the response's specific field and is updated each time there's the "fetchroutesend" or
    the "removewaypoint" event fired.
  </p>
</AppSidebar>

<div bind:this={mapRef} class="basis-full lg:basis-2/3 shadow-xl" />
