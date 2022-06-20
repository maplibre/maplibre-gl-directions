import type { LayerSpecification } from "maplibre-gl";

// The following layers are used in the "Restyling" example.
export const layers = [
  {
    id: "maplibre-gl-directions-snapline",
    type: "line",
    source: "maplibre-gl-directions",
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-dasharray": [2, 2],
      "line-color": "#ffffff",
      "line-opacity": 0.65,
      "line-width": 2,
    },
    filter: ["==", ["get", "type"], "SNAPLINE"],
  },

  {
    id: "maplibre-gl-directions-alt-routeline",
    type: "line",
    source: "maplibre-gl-directions",
    layout: {
      "line-cap": "butt",
      "line-join": "round",
    },
    paint: {
      "line-pattern": "routeline",
      "line-width": 8,
      "line-opacity": 0.5,
    },
    filter: ["==", ["get", "route"], "ALT"],
  },

  {
    id: "maplibre-gl-directions-routeline",
    type: "line",
    source: "maplibre-gl-directions",
    layout: {
      "line-cap": "butt",
      "line-join": "round",
    },
    paint: {
      "line-pattern": "routeline",
      "line-width": 8,
    },
    filter: ["==", ["get", "route"], "SELECTED"],
  },

  {
    id: "maplibre-gl-directions-hoverpoint",
    type: "symbol",
    source: "maplibre-gl-directions",
    layout: {
      "icon-image": "balloon-hoverpoint",
      "icon-anchor": "bottom",
      "icon-ignore-placement": true,
      "icon-overlap": "always",
    },
    filter: ["==", ["get", "type"], "HOVERPOINT"],
  },

  {
    id: "maplibre-gl-directions-snappoint",
    type: "symbol",
    source: "maplibre-gl-directions",
    layout: {
      "icon-image": "balloon-snappoint",
      "icon-anchor": "bottom",
      "icon-ignore-placement": true,
      "icon-overlap": "always",
    },
    filter: ["==", ["get", "type"], "SNAPPOINT"],
  },

  {
    id: "maplibre-gl-directions-waypoint",
    type: "symbol",
    source: "maplibre-gl-directions",
    layout: {
      "icon-image": "balloon-waypoint",
      "icon-anchor": "bottom",
      "icon-ignore-placement": true,
      "icon-overlap": "always",
    },
    filter: ["==", ["get", "type"], "WAYPOINT"],
  },
] as LayerSpecification[];
