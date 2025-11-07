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
  let messages: string[] = [];

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
        if (preventDefault) {
          e.preventDefault();
        }

        let message = `<strong>${e.type}</strong>: waypoint will be added at index <strong>${e.data.index}</strong>. Original event - <strong>${e.originalEvent?.type}</strong>`;
        if (preventDefault) message = `<s>${message}</s>`;
        messages.push(message);
        messages = messages;
      });

      directions.on("addwaypoint", (e) => {
        messages.push(
          `<strong>${e.type}</strong>: waypoint added at index <strong>${e.data.index}</strong>. Original event - <strong>${e.originalEvent?.type}</strong>`,
        );
        messages = messages;
      });

      directions.on("beforeremovewaypoint", (e) => {
        if (preventDefault) {
          e.preventDefault();
        }

        let message = `<strong>${e.type}</strong>: waypoint will be removed at index <strong>${e.data.index}</strong>. Original event - <strong>${e.originalEvent?.type}</strong>`;
        if (preventDefault) message = `<s>${message}</s>`;
        messages.push(message);
        messages = messages;
      });

      directions.on("removewaypoint", (e) => {
        messages.push(
          `<strong>${e.type}</strong>: waypoint removed at index <strong>${e.data.index}</strong>. Original event - <strong>${e.originalEvent?.type}</strong>`,
        );
        messages = messages;
      });

      directions.on("beforemovewaypoint", (e) => {
        if (preventDefault) {
          e.preventDefault();
        }

        let message = `<strong>${e.type}</strong>: waypoint at index <strong>${
          e.data.index
        }</strong> will be moved from coordinates ${e.data.initialCoordinates
          ?.map((c) => c.toFixed(5))
          .join(", ")}. Original event - <strong>${e.originalEvent?.type}</strong>`;
        if (preventDefault) message = `<s>${message}</s>`;
        messages.push(message);
        messages = messages;
      });

      directions.on("movewaypoint", (e) => {
        messages.push(
          `<strong>${e.type}</strong>: waypoint at index <strong>${
            e.data.index
          }</strong> moved from coordinates ${e.data.initialCoordinates
            ?.map((c) => c.toFixed(5))
            .join(", ")}. Original event - <strong>${e.originalEvent?.type}</strong>`,
        );
        messages = messages;
      });

      directions.on("beforecreatehoverpoint", (e) => {
        if (preventDefault) {
          e.preventDefault();
        }

        let message = `<strong>${e.type}</strong>: a hoverpoint will be created`;
        if (preventDefault) message = `<s>${message}</s>`;
        messages.push(message);
        messages = messages;
      });

      directions.on("fetchroutesstart", (e) => {
        if (preventDefault) {
          e.preventDefault();
        }

        let message = `<strong>${e.type}</strong>: routing request started. Original event - <strong>${e.originalEvent?.type}</strong>`;
        if (preventDefault) message = `<s>${message}</s>`;
        messages.push(message);
        messages = messages;
      });

      directions.on("fetchroutesend", (e) => {
        messages.push(
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

  <label>
    <input type="checkbox" bind:checked={preventDefault} />
    Prevent Default
  </label>

  <small>
    While the checkbox above is selected, all the subsequent cancelable events will have their default behavior
    prevented by calling the event's <code>preventDefault()</code> method. Such events will be displayed below as a strikethrough
    text
  </small>

  <ol>
    {#each messages as message}
      <li>{@html message}</li>
    {/each}
  </ol>

  {#if messages.length}
    <button on:click={() => (messages = [])}>Clear</button>
  {/if}
</AppSidebar>

<div bind:this={mapRef} class="basis-full lg:basis-2/3 shadow-xl" />
