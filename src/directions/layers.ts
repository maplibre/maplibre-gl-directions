import type { LayerSpecification } from "maplibre-gl";

export default [
  {
    id: "directions-snapline",
    type: "line",
    source: "directions",
    layout: {
      "line-cap": "butt",
      "line-join": "round",
    },
    paint: {
      "line-dasharray": [3, 3],
      "line-color": "#34343f",
      "line-opacity": 0.65,
      "line-width": 3,
    },
    filter: ["all", ["in", "$type", "LineString"], ["in", "type", "SNAPLINE"]],
  },

  {
    id: "directions-alt-routeline-casing",
    type: "line",
    source: "directions",
    layout: {
      "line-cap": "butt",
      "line-join": "round",
    },
    paint: {
      "line-color": "#9e91be",
      "line-opacity": 0.55,
      "line-width": ["case", ["boolean", ["get", "highlight"], false], 10, 7],
    },
    filter: ["all", ["in", "$type", "LineString"], ["in", "route", "ALT"]],
  },
  {
    id: "directions-alt-routeline",
    type: "line",
    source: "directions",
    layout: {
      "line-cap": "butt",
      "line-join": "round",
    },
    paint: {
      "line-color": "#9e91be",
      "line-opacity": 0.85,
      "line-width": 3,
    },
    filter: ["all", ["in", "$type", "LineString"], ["in", "route", "ALT"]],
  },

  {
    id: "directions-routeline-casing",
    type: "line",
    source: "directions",
    layout: {
      "line-cap": "butt",
      "line-join": "round",
    },
    paint: {
      "line-color": "#7b51f8",
      "line-opacity": 0.55,
      "line-width": ["case", ["boolean", ["get", "highlight"], false], 10, 7],
    },
    filter: ["all", ["in", "$type", "LineString"], ["in", "route", "SELECTED"]],
  },
  {
    id: "directions-routeline",
    type: "line",
    source: "directions",
    layout: {
      "line-cap": "butt",
      "line-join": "round",
    },
    paint: {
      "line-color": "#7b51f8",
      "line-opacity": 0.85,
      "line-width": 3,
    },
    filter: ["all", ["in", "$type", "LineString"], ["in", "route", "SELECTED"]],
  },

  {
    id: "directions-hoverpoint-casing",
    type: "circle",
    source: "directions",
    paint: {
      "circle-radius": 14,
      "circle-color": "#30a856",
      "circle-opacity": 0.65,
    },
    filter: ["all", ["in", "$type", "Point"], ["in", "type", "HOVERPOINT"]],
  },
  {
    id: "directions-hoverpoint",
    type: "circle",
    source: "directions",
    paint: {
      "circle-radius": 9,
      "circle-color": "#30a856",
    },
    filter: ["all", ["in", "$type", "Point"], ["in", "type", "HOVERPOINT"]],
  },

  {
    id: "directions-snappoint-casing",
    type: "circle",
    source: "directions",
    paint: {
      "circle-radius": ["case", ["boolean", ["get", "highlight"], false], 14, 12],
      "circle-color": ["case", ["boolean", ["get", "highlight"], false], "#e50d3f", "#cb3373"],
      "circle-opacity": 0.65,
    },
    filter: ["all", ["in", "$type", "Point"], ["in", "type", "SNAPPOINT"]],
  },
  {
    id: "directions-snappoint",
    type: "circle",
    source: "directions",
    paint: {
      "circle-radius": ["case", ["boolean", ["get", "highlight"], false], 9, 7],
      "circle-color": ["case", ["boolean", ["get", "highlight"], false], "#e50d3f", "#cb3373"],
    },
    filter: ["all", ["in", "$type", "Point"], ["in", "type", "SNAPPOINT"]],
  },

  {
    id: "directions-waypoint-casing",
    type: "circle",
    source: "directions",
    paint: {
      "circle-radius": ["case", ["boolean", ["get", "highlight"], false], 14, 12],
      "circle-color": ["case", ["boolean", ["get", "highlight"], false], "#6d26d7", "#7b33e7"],
      "circle-opacity": 0.65,
    },
    filter: ["all", ["in", "$type", "Point"], ["in", "type", "WAYPOINT"]],
  },

  {
    id: "directions-waypoint",
    type: "circle",
    source: "directions",
    paint: {
      "circle-radius": ["case", ["boolean", ["get", "highlight"], false], 9, 7],
      "circle-color": ["case", ["boolean", ["get", "highlight"], false], "#6d26d7", "#7b33e7"],
    },
    filter: ["all", ["in", "$type", "Point"], ["in", "type", "WAYPOINT"]],
  },
] as LayerSpecification[];
