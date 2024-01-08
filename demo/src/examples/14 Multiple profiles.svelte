<script lang="ts">
  import { onMount } from "svelte";
  import { examples } from "../router";
  import { location, link } from "svelte-spa-router";
  import AppSidebar from "../components/AppSidebar.svelte";
  import maplibregl, { Map } from "maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";
  import style from "../assets/map/style/style.json?url";
  import MapLibreGlDirections from "@maplibre/maplibre-gl-directions";
  import { shuffle } from "lodash";

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

      setPredefinedWaypoints();
    });
  });

  const waypoints = [
    [-74.21349031181673, 40.704951524836275],
    [-74.19666749687558, 40.738517300855904],
    [-74.16611177177786, 40.76634583723629],
    [-74.07169801445302, 40.719004374548206],
    [-73.99170381279369, 40.725509319065594],
    [-73.98071748466812, 40.762445342516145],
  ] satisfies [number, number][];
  const profiles = ["car", "bike", "car", "car", "foot"];

  function setPredefinedWaypoints() {
    directions?.setWaypoints(waypoints, profiles);
  }

  function shuffleWaypoints() {
    directions?.setWaypoints(waypoints, shuffle(profiles));
  }
</script>

<AppSidebar>
  <span slot="title">{meta.name}</span>
  <p>
    This example showcases routing with multiple profiles. Segments corresponding to different profiles are displayed in
    different colors. Plugin provides default styles for typical <a
      href="https://project-osrm.org/docs/v5.5.1/api/#general-options">OSRM profiles</a
    >: car, bike, foot. Styles can be changed per profile via general style customization approach (consult the
    <a href="/examples/restyling" use:link>Restyling example</a>). In case different profiles are used you can similarly
    style map features corresponding to each profile by targeting profile property of a feature (see
    <a href="https://github.com/maplibre/maplibre-gl-directions/blob/main/src/directions/layers.ts">default styles</a>).
  </p>

  <small><strong>Note</strong> that interactivity is not supported for multiple profiles</small>

  <div class="flex flex-col gap-2">
    <p>Shuffles used profiles</p>
    <button disabled={!directions} class="self-center" on:click={shuffleWaypoints}>Shuffle Profiles</button>
  </div>

  <div class="flex flex-col gap-2">
    <p>Reset to initial state</p>
    <button disabled={!directions} class="self-center" on:click={setPredefinedWaypoints}>Reset</button>
  </div>
</AppSidebar>

<div bind:this={mapRef} class="basis-full lg:basis-2/3 shadow-xl" />
