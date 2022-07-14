<script lang="ts">
  import { onMount } from "svelte";
  import { examples } from "../router";
  import { location } from "svelte-spa-router";
  import AppSidebar from "../components/AppSidebar.svelte";
  import maplibregl from "maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";
  import style from "../assets/map/style/style.json?url";
  import CustomMapLibreGlDirections from "../assets/map/custom-directions";

  const meta = examples.find((example) => example.path === $location);

  let mapRef: HTMLElement | undefined = undefined;
  let directions: CustomMapLibreGlDirections | undefined = undefined;

  onMount(() => {
    const map = new maplibregl.Map({
      container: mapRef,
      style,
      center: [-74.1197632, 40.6974034],
      zoom: 11,
      customAttribution: "<a href='http://project-osrm.org/' target='_blank'>&copy; OSRM</a>",
    });

    map.on("load", () => {
      directions = new CustomMapLibreGlDirections(map);
      directions.interactive = true;
    });
  });

  function checkDataToLoad() {
    return (
      localStorage.getItem("saved-waypoints-features") &&
      localStorage.getItem("saved-snappoints-features") &&
      localStorage.getItem("saved-routelines-features")
    );
  }

  let noDataToLoad = !checkDataToLoad();

  function loadRoute() {
    directions.setWaypointsFeatures(JSON.parse(localStorage.getItem("saved-waypoints-features")));
    directions.setSnappointsFeatures(JSON.parse(localStorage.getItem("saved-snappoints-features")));
    directions.setRoutelinesFeatures(JSON.parse(localStorage.getItem("saved-routelines-features")));
  }

  function saveRoute() {
    localStorage.setItem("saved-waypoints-features", JSON.stringify(directions.waypointsFeatures));
    localStorage.setItem("saved-snappoints-features", JSON.stringify(directions.snappointsFeatures));
    localStorage.setItem("saved-routelines-features", JSON.stringify(directions.routelinesFeatures));

    noDataToLoad = !checkDataToLoad();
  }
</script>

<AppSidebar>
  <span slot="title">{meta.name}</span>

  <button disabled={!directions || noDataToLoad} on:click={loadRoute}>Load the saved Route</button>
  <button disabled={!directions} on:click={saveRoute}>Save the Route</button>
  <button disabled={!directions} on:click={() => directions.clear()}>Clear</button>

  <small
    >This example uses the <code>localStorage</code> to save routes, but you are obviously not restricted to it. There might
    instead be a file or a serverside-database or whatever else</small
  >

  <p>
    If you want to save/load the route, the obvious way to do so would be to save the list of waypoints whenever the
    route is updated and to make a new routing-request with the saved waypoints' coordinates whenever you need to load
    it.
  </p>

  <p>
    But what if the underlying roads networks changes for some reason? You'll get a different route for the same set of
    waypoints. Moreover, if there are some severe construction works going on, you run into a risk of not getting any
    routes whatsoever.
  </p>

  <p>
    Sometimes it's actually a good idea to save the route as a list of GeoJSON Features and be able to load these saved
    features whenever there's a need. This example shows how that could be done.
  </p>
</AppSidebar>

<div bind:this={mapRef} class="basis-full lg:basis-2/3 shadow-xl" />
