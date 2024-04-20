<script lang="ts">
  import { onMount } from "svelte";
  import { examples } from "../router";
  import { location, link } from "svelte-spa-router";
  import AppSidebar from "../components/AppSidebar.svelte";
  import maplibregl from "maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";
  import style from "../assets/map/style/style.json?url";
  import MapLibreGlDirections from "@maplibre/maplibre-gl-directions";
  import { layers } from "../assets/map/restyling-example-layers";
  import balloonWaypointImgUrl from "../assets/map/images/balloon-waypoint.png?url";
  import balloonSnappointImgUrl from "../assets/map/images/balloon-snappoint.png?url";
  import balloonHoverpointImgUrl from "../assets/map/images/balloon-hoverpoint.png?url";
  import routelineImgUrl from "../assets/map/images/routeline.png?url";

  const meta = examples.find((example) => example.path === $location)!;

  let mapRef: HTMLElement;
  let directions: MapLibreGlDirections;

  onMount(() => {
    const map = new maplibregl.Map({
      container: mapRef,
      style,
      center: [-74.1197632, 40.6974034],
      zoom: 11,
      fadeDuration: 0,
      attributionControl: false,
    });

    map.addControl(
      new maplibregl.AttributionControl({
        customAttribution:
          '<a href=\'http://project-osrm.org/\' target=\'_blank\'>&copy; OSRM</a> | Icons made by <a href="https://www.flaticon.com/authors/vectors-market" title="Vectors Market">Vectors Market</a> and by <a href="https://www.flaticon.com/authors/dinosoftlabs" title="DinosoftLabs">DinosoftLabs</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a>',
      }),
    );

    map.on("load", () => {
      // make sure to load and add the images used by the custom directions' styles first:
      // a balloon for thw waypoints,
      map.loadImage(balloonWaypointImgUrl).then((image) => {
        if (image) {
          map.addImage("balloon-waypoint", image.data);
        }
      });

      // a balloon for the snappoints,
      map.loadImage(balloonSnappointImgUrl).then((image) => {
        if (image) {
          map.addImage("balloon-snappoint", image.data);
        }
      });

      // a balloon for the hoverpoints,
      map.loadImage(balloonHoverpointImgUrl).then((image) => {
        if (image) {
          map.addImage("balloon-hoverpoint", image.data);
        }
      });

      // and a pattern-image for the routelines.
      map.loadImage(routelineImgUrl).then((image) => {
        if (image) {
          map.addImage("routeline", image.data);
        }
      });

      directions = new MapLibreGlDirections(map, {
        requestOptions: {
          alternatives: "true",
        },
        layers, // see the imports
        // if you decide not to use some layers of the default set (casings namely), make sure to update the sensitive
        // layers respectfully
        sensitiveWaypointLayers: ["maplibre-gl-directions-waypoint"],
        sensitiveSnappointLayers: ["maplibre-gl-directions-snappoint"],
        sensitiveRoutelineLayers: ["maplibre-gl-directions-routeline"],
        sensitiveAltRoutelineLayers: ["maplibre-gl-directions-alt-routeline"],
      });

      directions.interactive = true;
    });
  });
</script>

<AppSidebar>
  <span slot="title">{meta.name}</span>

  <p>
    It's completely up to you how to style the Directions' features shown on the map. You can either use the default
    styles provided by the plugin (see other examples), easily modify the default features' dimensions (see the
    <a href="/examples/touch-friendly-features" use:link>Touch-Friendly Features example</a>) or
    <strong>define your custom features' styles from scratch</strong>.
  </p>

  <p>This example demonstrates the last option.</p>
</AppSidebar>

<div bind:this={mapRef} class="basis-full lg:basis-2/3 shadow-xl" />
