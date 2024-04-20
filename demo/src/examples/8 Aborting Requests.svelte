<script lang="ts">
  import { onMount } from "svelte";
  import { examples } from "../router";
  import { location } from "svelte-spa-router";
  import AppSidebar from "../components/AppSidebar.svelte";
  import maplibregl, { Map } from "maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";
  import style from "../assets/map/style/style.json?url";
  import MapLibreGlDirections from "@maplibre/maplibre-gl-directions";

  const meta = examples.find((example) => example.path === $location)!;

  let mapRef: HTMLElement;
  let map: Map;
  let directions: MapLibreGlDirections;
  let requestTimeout = 1000;

  onMount(() => {
    const _map = new maplibregl.Map({
      container: mapRef,
      style,
      center: [-74.1197632, 40.6974034],
      zoom: 11,
      attributionControl: false,
    });

    _map.addControl(
      new maplibregl.AttributionControl({
        customAttribution: "<a href='http://project-osrm.org/' target='_blank' rel='noreferrer'>&copy; OSRM</a>",
      }),
    );

    _map.on("load", () => {
      map = _map;
    });
  });

  $: if (map) {
    if (directions) directions.destroy();

    directions = new MapLibreGlDirections(map, {
      requestOptions: {
        alternatives: "true",
      },
      requestTimeout,
    });

    directions.interactive = true;
  }

  function abortManually() {
    directions?.abortController?.abort();
  }
</script>

<AppSidebar>
  <span slot="title">{meta.name}</span>

  <button disabled={!directions} on:click={abortManually}>Abort Manually</button>

  <p>
    Instead of aborting routing-requests manually, you can set the <code>requestTimeout</code> configuration option to a
    number of ms that a routing-request is allowed to take before getting automatically aborted.
  </p>

  <label class="flex flex-col gap-2">
    <span><strong>Request Timeout</strong></span>
    <input type="number" disabled={!directions} bind:value={requestTimeout} />
  </label>

  <small
    ><strong>Note</strong> that you may need to manually
    <a
      href="https://www.browserstack.com/guide/how-to-perform-network-throttling-in-chrome"
      target="_blank"
      rel="noreferrer">enable network throttling</a
    > for the setting above to take effect</small
  >
</AppSidebar>

<div bind:this={mapRef} class="basis-full lg:basis-2/3 shadow-xl" />
