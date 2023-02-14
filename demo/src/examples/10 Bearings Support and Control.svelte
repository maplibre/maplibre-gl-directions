<script lang="ts">
  import { onMount } from "svelte";
  import { examples } from "../router";
  import { location } from "svelte-spa-router";
  import AppSidebar from "../components/AppSidebar.svelte";
  import maplibregl, { Map, NavigationControl } from "maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";
  import style from "../assets/map/style/style.json?url";
  import MapLibreGlDirections, {
    BearingsControl,
    type BearingsControlConfiguration,
  } from "@maplibre/maplibre-gl-directions";

  const meta = examples.find((example) => example.path === $location);

  let mapRef: HTMLElement | undefined = undefined;
  let map: Map | undefined = undefined;
  let directions: MapLibreGlDirections | undefined = undefined;

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
        bearings: true,
      });

      directions.interactive = true;

      map.addControl(new NavigationControl({}));
    });
  });

  let control: BearingsControl;
  let controlConfiguration: BearingsControlConfiguration = {
    defaultEnabled: false,
    angleDefault: 0,
    angleMin: 0,
    angleMax: 359,
    angleStep: 1,
    fixedDegrees: 0,
    degreesDefault: 45,
    degreesMin: 15,
    degreesMax: 360,
    degreesStep: 15,
    respectMapBearing: false,
    imageSize: 50,
  };

  $: if (map && directions) {
    if (control && map.hasControl(control)) map.removeControl(control);
    map.addControl((control = new BearingsControl(directions, controlConfiguration)), "top-left");
  }
</script>

<AppSidebar>
  <span slot="title">{meta.name}</span>

  <p>
    The <a href="http://project-osrm.org/docs/v5.24.0/api/#requests" target="_blank" rel="noreferrer">bearings</a> support
    allows to control in which direction the route would be continued from a given waypoint.
  </p>

  <p>
    In order to enable support for this API option on the plugin level, pass the <code>bearings: true</code> option to
    the plugin's configuration object. When this is done, each request would contain the <code>bearings</code> field. The
    problem with that is that the values for the waypoints' bearings are not populated correctly since we need some way to
    assign these bearings values to our waypoints.
  </p>

  <p>Luckily, that's possible to achieve using the built-in <strong>Bearings Control</strong>.</p>

  <label class="flex flex-col gap-2">
    <span><strong>Default angle</strong></span>
    <input type="number" disabled={!directions} bind:value={controlConfiguration.angleDefault} />
  </label>

  <label class="flex flex-col gap-2">
    <span><strong>Minimal allowed angle</strong></span>
    <input type="number" disabled={!directions} bind:value={controlConfiguration.angleMin} />
  </label>

  <label class="flex flex-col gap-2">
    <span><strong>Maximal allowed angle</strong></span>
    <input type="number" disabled={!directions} bind:value={controlConfiguration.angleMax} />
  </label>

  <label class="flex flex-col gap-2">
    <span><strong>Angle step</strong></span>
    <input type="number" disabled={!directions} bind:value={controlConfiguration.angleStep} />
  </label>

  <label class="flex flex-col gap-2">
    <span><strong>Fixed degrees</strong></span>
    <input type="number" disabled={!directions} bind:value={controlConfiguration.fixedDegrees} />
  </label>

  <label class="flex flex-col gap-2">
    <span><strong>Degrees default</strong></span>
    <input
      type="number"
      disabled={!directions || !!controlConfiguration.fixedDegrees}
      bind:value={controlConfiguration.degreesDefault}
    />
  </label>

  <label class="flex flex-col gap-2">
    <span><strong>Minimal allowed degrees</strong></span>
    <input
      type="number"
      disabled={!directions || !!controlConfiguration.fixedDegrees}
      bind:value={controlConfiguration.degreesMin}
    />
  </label>

  <label class="flex flex-col gap-2">
    <span><strong>Maximal allowed degrees</strong></span>
    <input
      type="number"
      disabled={!directions || !!controlConfiguration.fixedDegrees}
      bind:value={controlConfiguration.degreesMax}
    />
  </label>

  <label class="flex flex-col gap-2">
    <span><strong>Degrees step</strong></span>
    <input
      type="number"
      disabled={!directions || !!controlConfiguration.fixedDegrees}
      bind:value={controlConfiguration.degreesStep}
    />
  </label>

  <label class="flex items-center gap-3">
    <input type="checkbox" disabled={!directions} bind:checked={controlConfiguration.respectMapBearing} />
    <strong>Respect Map's Bearing</strong>
  </label>

  <label class="flex flex-col gap-2">
    <span><strong>Image size</strong></span>
    <input type="number" disabled={!directions} bind:value={controlConfiguration.imageSize} />
  </label>
</AppSidebar>

<div bind:this={mapRef} class="basis-full lg:basis-2/3 shadow-xl" />
