<script lang="ts">
  import type MapLibreGlDirections from "../../directions/main";
  import type { BearingsControlConfiguration } from "./types";

  export let directions: MapLibreGlDirections;
  export let configuration: BearingsControlConfiguration;

  directions.on("addwaypoint", onWaypointsChanged);
  directions.on("removewaypoint", onWaypointsChanged);
  directions.on("movewaypoint", onWaypointsChanged);
  directions.on("setwaypoints", onWaypointsChanged);

  let waypoints;

  function onWaypointsChanged() {
    waypoints = directions.waypoints;
  }
</script>

<div class="p-4 flex flex-col bg-white rounded">
  {#if waypoints}
    {#each waypoints as waypoint}
      <div class="w-8 h-8 rounded-full bg-accent-500" />
    {/each}
  {/if}
</div>
