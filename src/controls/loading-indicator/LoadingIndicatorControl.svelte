<script lang="ts">
  import type MapLibreGlDirections from "../../directions/main";
  import type { LoadingIndicatorControlConfiguration } from "./types";

  export let directions: MapLibreGlDirections;
  export let configuration: LoadingIndicatorControlConfiguration;

  let loading: boolean;

  directions.on("fetchroutesstart", () => {
    loading = true;
  });

  directions.on("fetchroutesend", () => {
    loading = false;
  });
</script>

{#if loading}
  <svg
    v-if="loading"
    xmlns="http://www.w3.org/2000/svg"
    width={configuration.size}
    height={configuration.size}
    viewBox="0 0 128 128"
    xml:space="preserve"
    class={configuration.class}
  >
    <circle cx="64.13" cy="64.13" r="27.63" fill={configuration.fill} />
    <path
      d="M64.13 18.5A45.63 45.63 0 1 1 18.5 64.13 45.63 45.63 0 0 1 64.13 18.5zm0 7.85a37.78 37.78 0 1 1-37.78 37.78 37.78 37.78 0 0 1 37.78-37.78z"
      fill-rule="evenodd"
      fill={configuration.fill}
    />
    <g>
      <path d="M95.25 17.4a56.26 56.26 0 0 0-76.8 13.23L12.1 26.2a64 64 0 0 1 87.6-15.17z" fill={configuration.fill} />
      <path
        d="M95.25 17.4a56.26 56.26 0 0 0-76.8 13.23L12.1 26.2a64 64 0 0 1 87.6-15.17z"
        fill={configuration.fill}
        transform="rotate(120 64 64)"
      />
      <path
        d="M95.25 17.4a56.26 56.26 0 0 0-76.8 13.23L12.1 26.2a64 64 0 0 1 87.6-15.17z"
        fill={configuration.fill}
        transform="rotate(240 64 64)"
      />
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 64 64"
        to="120 64 64"
        dur="360ms"
        repeatCount="indefinite"
      />
    </g>
  </svg>
{/if}
