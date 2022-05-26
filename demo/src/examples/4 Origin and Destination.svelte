<script lang="ts">
  import { onMount } from "svelte";
  import { examples } from "../router";
  import { location } from "svelte-spa-router";
  import AppSidebar from "../components/AppSidebar.svelte";
  import maplibregl from "maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";
  import style from "../assets/map/style/style.json?url";
  import MapLibreGlDirections, { layersFactory } from "@maplibre/maplibre-gl-directions";

  const meta = examples.find((example) => example.path === $location);

  let mapRef: HTMLElement | undefined = undefined;
  let directions: MapLibreGlDirections | undefined = undefined;

  onMount(() => {
    const map = new maplibregl.Map({
      container: mapRef,
      style,
      center: [-74.1197632, 40.6974034],
      zoom: 11,
      customAttribution: "<a href='http://project-osrm.org/' target='_blank'>&copy; OSRM</a>",
    });

    const layers = layersFactory();
    layers.push({
      id: "maplibre-gl-directions-waypoint-label",
      type: "symbol",
      source: "maplibre-gl-directions",
      layout: {
        "text-field": [
          "case",
          ["==", ["get", "category"], "ORIGIN"],
          "A",
          ["==", ["get", "category"], "DESTINATION"],
          "B",
          "",
        ],
      },
      paint: {
        "text-color": "#ffffff",
        "text-opacity": 0.7,
      },
      filter: [
        "all",
        ["==", ["geometry-type"], "Point"],
        ["==", ["get", "type"], "WAYPOINT"],
        ["in", ["get", "category"], ["literal", ["ORIGIN", "DESTINATION"]]],
      ],
    });

    map.on("load", () => {
      directions = new MapLibreGlDirections(map, {
        requestOptions: {
          alternatives: "true",
        },
        layers,
      });

      directions.interactive = true;
    });
  });
</script>

<AppSidebar>
  <span slot="title">{meta.name}</span>

  <p>
    In this example the default layers used by the plugin are augmented with an additional "symbol" layer which is only
    rendered for the ORIGIN and DESTINATION waypoints.
  </p>

  <p>
    <strong>Note</strong> how you don't need to re-define all the layers from scratch thanks to the exported
    <code>layersFactory</code> function that returns all the default layers allowing for their augmentation and modification
  </p>
</AppSidebar>

<div bind:this={mapRef} class="basis-full lg:basis-2/3 shadow-xl" />
