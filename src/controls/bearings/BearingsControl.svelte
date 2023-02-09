<script lang="ts">
  import type MapLibreGlDirections from "../../directions/main";
  import type { BearingsControlConfiguration } from "./types";

  export let directions: MapLibreGlDirections;
  export let configuration: BearingsControlConfiguration;

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
        enabled: !!waypointBearing,
        angle: waypointBearing ? waypointBearing[0] : 0,
        degrees: waypointBearing ? waypointBearing[1] : 45,
      };
    });
  }

  $: directions.waypointsBearings = waypointsBearings.map((waypointBearing) => {
    return waypointBearing.enabled ? [waypointBearing.angle, waypointBearing.degrees] : undefined;
  });
</script>

<div class="maplibregl-ctrl p-4 flex flex-col gap-4 bg-white rounded">
  {#each waypointsBearings as waypointBearing}
    <div class="flex items-center gap-2">
      <input type="checkbox" bind:checked={waypointBearing.enabled} />
      <div>
        <svg height="20" width="20" viewBox="0 0 20 20" style="width: 50px; height: 50px;">
          <circle
            r="5"
            cx="10"
            cy="10"
            fill="transparent"
            stroke="rgba(109, {waypointBearing.enabled ? '38, 215' : '109, 109'}, 0.65)"
            stroke-width="10"
            stroke-dasharray="calc({waypointBearing.degrees / 3.6} * 31.42 / 100) 31.42"
            transform="rotate({-90 - waypointBearing.degrees / 2 + waypointBearing.angle})"
            transform-origin="10 10"
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
