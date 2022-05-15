<script lang="ts">
  import { onMount } from "svelte";
  import { examples } from "../router";
  import { location } from "svelte-spa-router";
  import AppSidebar from "../components/AppSidebar.svelte";
  import maplibregl, { Map } from "maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";
  import style from "../assets/map/style/style.json?url";
  import MapLibreGlDirections from "@maplibre/maplibre-gl-directions";

  const meta = examples.find((example) => example.path === $location);

  let mapRef: HTMLElement | undefined = undefined;
  let map: Map | undefined = undefined;
  let directions: MapLibreGlDirections | undefined = undefined;

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

      directions = new MapLibreGlDirections(map, {
        requestOptions: {
          alternatives: "true",
        },
      });
    });
  });

  function setPredefinedWaypoints() {
    directions?.setWaypoints([
      [-74.21349031181673, 40.704951524836275],
      [-74.19666749687558, 40.738517300855904],
      [-74.16611177177786, 40.76634583723629],
      [-74.07169801445302, 40.719004374548206],
      [-73.99170381279369, 40.725509319065594],
      [-73.98071748466812, 40.762445342516145],
    ]);
  }

  function addRandomWaypoint() {
    const bounds = map?.getBounds();
    const center = map?.getCenter();

    if (bounds && center) {
      const xField = bounds.getEast() - bounds.getWest();
      const yField = bounds.getSouth() - bounds.getNorth();

      directions?.addWaypoint(
        [center.lng - xField / 2 + xField * Math.random(), center.lat - yField / 2 + yField * Math.random()],
        (directions?.waypoints.length * Math.random()) | 0,
      );
    }
  }

  function deleteRandomWaypoint() {
    directions?.removeWaypoint((directions?.waypoints.length * Math.random()) | 0);
  }

  function clear() {
    directions?.clear();
  }
</script>

<AppSidebar>
  <span slot="title">{meta.name}</span>

  <small><strong>Note</strong> that interactivity is disabled for this example</small>

  <div class="flex flex-col gap-2">
    <p>Set waypoints to a predefined set</p>
    <button disabled={!directions} class="self-center" on:click={setPredefinedWaypoints}>Set Waypoints</button>
  </div>

  <div class="flex flex-col gap-2">
    <p>Add a random waypoint at some random index</p>
    <button disabled={!directions} class="self-center" on:click={addRandomWaypoint}>Add Waypoint</button>
  </div>

  <div class="flex flex-col gap-2">
    <p>Delete a random waypoint</p>
    <button disabled={!directions} class="self-center" on:click={deleteRandomWaypoint}>Delete Waypoint</button>
  </div>

  <div class="flex flex-col gap-2">
    <p>Clear the map from all the stuff added by the plugin</p>
    <button disabled={!directions} class="self-center" on:click={clear}>Clear</button>
  </div>
</AppSidebar>

<div bind:this={mapRef} class="shadow-xl" />
