<template>
  <svg
    v-if="loading"
    xmlns:svg="http://www.w3.org/2000/svg"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    version="1.0"
    :width="props.configuration.size"
    :height="props.configuration.size"
    viewBox="0 0 128 128"
    xml:space="preserve"
    :class="props.configuration.class"
  >
    <circle cx="64.13" cy="64.13" r="27.63" :fill="props.configuration.fill" />
    <path
      d="M64.13 18.5A45.63 45.63 0 1 1 18.5 64.13 45.63 45.63 0 0 1 64.13 18.5zm0 7.85a37.78 37.78 0 1 1-37.78 37.78 37.78 37.78 0 0 1 37.78-37.78z"
      fill-rule="evenodd"
      :fill="props.configuration.fill"
    />
    <g>
      <path
        d="M95.25 17.4a56.26 56.26 0 0 0-76.8 13.23L12.1 26.2a64 64 0 0 1 87.6-15.17z"
        :fill="props.configuration.fill"
      />
      <path
        d="M95.25 17.4a56.26 56.26 0 0 0-76.8 13.23L12.1 26.2a64 64 0 0 1 87.6-15.17z"
        :fill="props.configuration.fill"
        transform="rotate(120 64 64)"
      />
      <path
        d="M95.25 17.4a56.26 56.26 0 0 0-76.8 13.23L12.1 26.2a64 64 0 0 1 87.6-15.17z"
        :fill="props.configuration.fill"
        transform="rotate(240 64 64)"
      />
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 64 64"
        to="120 64 64"
        dur="360ms"
        repeatCount="indefinite"
      ></animateTransform>
    </g>
  </svg>
</template>

<script setup lang="ts">
  import { ref } from "vue";
  import MapLibreGlDirections from "../../directions/main";
  import { MapLibreGlDirectionsLoadingControlConfiguration } from "./types";

  const props = defineProps<{
    directions: MapLibreGlDirections;
    configuration: MapLibreGlDirectionsLoadingControlConfiguration;
  }>();

  props.directions.on("fetchroutesstart", () => {
    loading.value = true;
  });

  props.directions.on("fetchroutesend", () => {
    loading.value = false;
  });

  const loading = ref(false);
</script>
