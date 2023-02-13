<script lang="ts">
  import type MapLibreGlDirections from "../../directions/main";
  import type { BearingsControlConfiguration } from "./types";
  import { onDestroy } from "svelte";
  import { Map } from "maplibre-gl";

  export let directions: MapLibreGlDirections;
  export let configuration: BearingsControlConfiguration;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (!directions.configuration.bearings) {
    console.warn("The Bearings Control is used, but the `bearings` option is not enabled on the Directions instance.");
  }

  directions.on("addwaypoint", onWaypointsChanged);
  directions.on("removewaypoint", onWaypointsChanged);
  directions.on("movewaypoint", onWaypointsChanged);
  directions.on("setwaypoints", onWaypointsChanged);

  let waypointsBearings: {
    enabled: boolean;
    angle: number;
    degrees: number;
  }[] = [];

  function onWaypointsChanged() {
    waypointsBearings = directions.waypointsBearings.map((waypointBearing, index) => {
      if (waypointsBearings[index]) return waypointsBearings[index];

      return {
        enabled: configuration.defaultEnabled || !!waypointBearing,
        angle: waypointBearing ? waypointBearing[0] : 0,
        degrees: waypointBearing ? waypointBearing[1] : 45,
      };
    });
  }

  $: directions.waypointsBearings = waypointsBearings.map((waypointBearing) => {
    return waypointBearing.enabled ? [waypointBearing.angle, waypointBearing.degrees] : undefined;
  });

  const images = [] as (HTMLDivElement | null)[];
  let imageBeingRotatedIndex = -1;

  function onImageMousedown(event: MouseEvent, i: number) {
    if (!waypointsBearings[i]?.enabled) return;

    imageBeingRotatedIndex = i;

    document.addEventListener("mouseup", onDocumentMouseup);
    document.addEventListener("mousemove", onDocumentMousemove);
  }

  function onDocumentMouseup() {
    imageBeingRotatedIndex = -1;

    document.removeEventListener("mouseup", onDocumentMouseup);
    document.removeEventListener("mousemove", onDocumentMousemove);
  }

  function onDocumentMousemove(e: MouseEvent) {
    if (~imageBeingRotatedIndex && images[imageBeingRotatedIndex]) {
      const image = images[imageBeingRotatedIndex];

      const centerX = image.getBoundingClientRect().x + configuration.imageSize / 2;
      const centerY = image.getBoundingClientRect().y + configuration.imageSize / 2;

      const mouse_x = e.pageX;
      const mouse_y = e.pageY;

      const radians = Math.atan2(mouse_x - centerX, mouse_y - centerY);
      const angle = radians * (180 / Math.PI) * -1 + 90;

      waypointsBearings[imageBeingRotatedIndex].angle = (90 + angle + angleAdjustment) | 0;
    }
  }

  onDestroy(() => {
    document.removeEventListener("mouseup", onDocumentMouseup);
    document.removeEventListener("mousemove", onDocumentMousemove);
  });

  let angleAdjustment = 0;

  // adjust the angle of control's waypoints based on the map's current bearing
  if (configuration.respectMapBearing) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    (directions.map as Map).on("rotate", () => (angleAdjustment = directions.map.getBearing()));
  }
</script>

<div
  class="maplibregl-ctrl maplibregl-ctrl-group maplibre-gl-directions-bearings-control p-4 {waypointsBearings.length
    ? 'flex'
    : 'hidden'} flex-col gap-4 max-h-96 overflow-y-auto bg-white rounded"
>
  {#each waypointsBearings as waypointBearing, i}
    <div class="flex items-center gap-2">
      <input type="checkbox" bind:checked={waypointBearing.enabled} />
      <div bind:this={images[i]} on:mousedown={(e) => onImageMousedown(e, i)}>
        <svg
          height="20"
          width="20"
          viewBox="0 0 20 20"
          style="width: {configuration.imageSize}px; height: {configuration.imageSize}px;"
        >
          <circle
            r="5"
            cx="10"
            cy="10"
            fill="transparent"
            stroke="rgba(109, {waypointBearing.enabled ? '38, 215' : '109, 109'}, 0.65)"
            stroke-width="10"
            stroke-dasharray="calc({waypointBearing.degrees / 3.6} * 31.42 / 100) 31.42"
            transform="rotate({-90 - waypointBearing.degrees / 2 + waypointBearing.angle - angleAdjustment})"
            style="transform-origin: 10px 10px"
          />
          <circle r="6" cx="10" cy="10" fill="rgb(109, {waypointBearing.enabled ? '38, 215' : '109, 109'})" />
        </svg>
      </div>
      <input
        type="number"
        disabled={!waypointBearing.enabled}
        bind:value={waypointBearing.angle}
        min={configuration.angleMin}
        max={configuration.angleMax}
        step={configuration.angleStep}
      />
      <span>°</span>
      <span>±</span>
      {#if configuration.fixedDegrees}
        <span>{configuration.fixedDegrees}°</span>
      {:else}
        <input
          type="number"
          disabled={!waypointBearing.enabled}
          bind:value={waypointBearing.degrees}
          min={configuration.degreesMin}
          max={configuration.degreesMax}
          step={configuration.degreesStep}
        />
        <span>°</span>
      {/if}
    </div>
  {/each}
</div>
