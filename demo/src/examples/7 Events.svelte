<script lang="ts">
  import { onMount } from "svelte";
  import { examples } from "../router";
  import { location } from "svelte-spa-router";
  import AppSidebar from "../components/AppSidebar.svelte";
  import maplibregl from "maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";
  import style from "../assets/map/style/style.json?url";
  import MapLibreGlDirections from "@maplibre/maplibre-gl-directions";

  const meta = examples.find((example) => example.path === $location)!;

  let mapRef: HTMLElement;
  let directions: MapLibreGlDirections;

  let preventDefault = false;
  let forceAllowAddingWaypoints = false;
  let messages: string[] = [];

  // "Format Coordinates".
  function fc(coordinates?: number[] | [number, number]): string {
    return `[${coordinates?.map((c) => c.toFixed(5)).join(", ") ?? "N/A, N/A"}]`;
  }

  onMount(() => {
    const map = new maplibregl.Map({
      container: mapRef,
      style,
      center: [-74.1197632, 40.6974034],
      zoom: 11,
      attributionControl: false,
    });

    map.addControl(
      new maplibregl.AttributionControl({
        customAttribution: "<a href='http://project-osrm.org/' target='_blank'>&copy; OSRM</a>",
      }),
    );

    map.on("load", () => {
      directions = new MapLibreGlDirections(map, {
        requestOptions: {
          alternatives: "true",
        },
      });

      directions.interactive = true;

      directions.on("beforeaddwaypoint", (e) => {
        if (preventDefault && !forceAllowAddingWaypoints) {
          e.preventDefault();
        }

        let message = `<strong>${e.type}</strong>: waypoint <strong>#${e.data.index}</strong> will be added at <strong>${fc(e.data.coordinates)}</strong>. Original event - <strong>${e.originalEvent?.type}</strong>`;
        if (preventDefault && !forceAllowAddingWaypoints) message = `<s>${message}</s>`;
        messages.unshift(message);
        messages = messages;
      });

      directions.on("addwaypoint", (e) => {
        messages.unshift(
          `<strong>${e.type}</strong>: waypoint <strong>#${e.data.index}</strong> is added at <strong>${fc(e.data.coordinates)}</strong>. Original event - <strong>${e.originalEvent?.type}</strong>`,
        );
        messages = messages;
      });

      directions.on("beforeremovewaypoint", (e) => {
        if (preventDefault) {
          e.preventDefault();
        }

        let message = `<strong>${e.type}</strong>: waypoint <strong>#${e.data.index}</strong> will be removed. Original event - <strong>${e.originalEvent?.type}</strong>`;
        if (preventDefault) message = `<s>${message}</s>`;
        messages.unshift(message);
        messages = messages;
      });

      directions.on("removewaypoint", (e) => {
        messages.unshift(
          `<strong>${e.type}</strong>: waypoint <strong>#${e.data.index}</strong> is removed. Original event - <strong>${e.originalEvent?.type}</strong>`,
        );
        messages = messages;
      });

      directions.on("beforemovewaypoint", (e) => {
        if (preventDefault) {
          e.preventDefault();
        }

        let message = `<strong>${e.type}</strong>: waypoint <strong>#${e.data.index}</strong> will be moved from its initial coordinates <strong>${fc(e.data.initialCoordinates)}</strong>. Original event - <strong>${e.originalEvent?.type}</strong>`;
        if (preventDefault) message = `<s>${message}</s>`;
        messages.unshift(message);
        messages = messages;
      });

      directions.on("movewaypoint", (e) => {
        messages.unshift(
          `<strong>${e.type}</strong>: waypoint <strong>#${e.data.index}</strong> is moved from its initial coordinates <strong>${fc(e.data.initialCoordinates)}</strong> to <strong>${fc(e.data.newCoordinates)}</strong>. Original event - <strong>${e.originalEvent?.type}</strong>`,
        );
        messages = messages;
      });

      directions.on("beforecreatehoverpoint", (e) => {
        console.log(e);

        if (preventDefault) {
          e.preventDefault();
        }

        let message = `<strong>${e.type}</strong>: a hoverpoint will be created between waypoints <strong>#${e.data.departSnappointIndex}</strong> and <strong>#${e.data.departSnappointIndex + 1}</strong>. Original event - <strong>${e.originalEvent?.type}</strong>`;
        if (preventDefault) message = `<s>${message}</s>`;
        messages.unshift(message);
        messages = messages;
      });

      directions.on("fetchroutesstart", (e) => {
        if (preventDefault) {
          e.preventDefault();
        }

        let message = `<strong>${e.type}</strong>: routing request started. Original event - <strong>${e.originalEvent?.type}</strong>`;
        if (preventDefault) message = `<s>${message}</s>`;
        messages.unshift(message);
        messages = messages;
      });

      directions.on("fetchroutesend", (e) => {
        messages.unshift(
          `<strong>${e.type}</strong>: routing request finished with code <strong>${e.data.directions?.code}</strong>. Original event - <strong>${e.originalEvent?.type}</strong>`,
        );
        messages = messages;
      });
    });
  });
</script>

<AppSidebar>
  <span slot="title">{meta.name}</span>

  <p>
    This example listens for all the available events and logs them below. Interact with the map to see the emitted
    events.
  </p>

  <label class="flex items-center gap-3">
    <input type="checkbox" bind:checked={preventDefault} />
    <strong>Prevent Default</strong>
  </label>

  {#if preventDefault}
    <label class="flex items-center gap-3">
      <input type="checkbox" bind:checked={forceAllowAddingWaypoints} />
      <strong>Force-allow adding waypoints</strong>
    </label>
  {/if}

  <small>
    While the "Prevent Default" checkbox above is selected, all the subsequent cancelable events will have their default
    behavior prevented by calling the event's <code>preventDefault()</code> method. Such events will be displayed below
    as a strikethrough text.

    {#if preventDefault}
      Checking the "Force-allow adding waypoints" will make adding waypoints ignore its
      <code>preventDefault()</code> invocations
    {/if}
  </small>

  {#if messages.length}
    <button on:click={() => (messages = [])}>Clear</button>
  {/if}

  <ol reversed>
    {#each messages as message}
      <li>{@html message}</li>
    {/each}
  </ol>
</AppSidebar>

<div bind:this={mapRef} class="basis-full lg:basis-2/3 shadow-xl" />
