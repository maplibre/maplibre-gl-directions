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
      <input
        type="number"
        disabled={!waypointBearing.enabled}
        bind:value={waypointBearing.angle}
        min={configuration.angleMin}
        max={configuration.angleMax}
        step={configuration.angleStep}
      />
      <span>° ± </span>
      <input
        type="number"
        disabled={!waypointBearing.enabled}
        bind:value={waypointBearing.degrees}
        min={configuration.degreesMin}
        max={configuration.degreesMax}
        step={configuration.degreesStep}
      />
      <span>°</span>
    </div>
  {/each}
</div>
