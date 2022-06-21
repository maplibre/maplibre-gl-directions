import type maplibregl from "maplibre-gl";
import type { MapLibreGlDirectionsConfiguration, PointType } from "@maplibre/maplibre-gl-directions";
import MapLibreGlDirections, { layersFactory } from "@maplibre/maplibre-gl-directions";
import { utils } from "@maplibre/maplibre-gl-directions";
import { MapLibreGlDirectionsWaypointEvent } from "@maplibre/maplibre-gl-directions";
import type { Feature, LineString, Point } from "@maplibre/maplibre-gl-directions";

export default class CustomMapLibreGlDirections extends MapLibreGlDirections {
  constructor(map: maplibregl.Map, configuration?: Partial<MapLibreGlDirectionsConfiguration>) {
    super(map, configuration);
  }

  // augmented public interface

  get waypointsFeatures() {
    return this._waypoints;
  }

  setWaypointsFeatures(waypointsFeatures: Feature<Point>[]) {
    this._waypoints = waypointsFeatures;

    this.assignWaypointsCategories();

    const waypointEvent = new MapLibreGlDirectionsWaypointEvent("setwaypoints", undefined);
    this.fire(waypointEvent);

    this.draw();
  }

  get snappointsFeatures() {
    return this.snappoints;
  }

  setSnappointsFeatures(snappointsFeatures: Feature<Point>[]) {
    this.snappoints = snappointsFeatures;
    this.draw();
  }

  get routelinesFeatures() {
    return this.routelines;
  }

  setRoutelinesFeatures(routelinesFeatures: Feature<LineString>[][]) {
    this.routelines = routelinesFeatures;
    this.draw();
  }
}

const routingLayers = layersFactory();

// routeline casing and routeline. Yellow-ish when straight, purple when routed
(routingLayers[3].paint as unknown as Record<string, unknown>)["line-color"] = (
  routingLayers[4].paint as unknown as Record<string, unknown>
)["line-color"] = [
  "case",
  [
    "any",
    [
      "boolean",
      ["get", "straightLinesMode", ["get", "waypointProperties", ["get", "departSnappointProperties"]]],
      false,
    ],
  ],
  "#f3d372",
  "#7b51f8",
];

// hoverpoint casing. Orange when straight, purple when routed
(routingLayers[5].paint as unknown as Record<string, unknown>)["circle-color"] = [
  "case",
  ["boolean", ["get", "straightLinesMode"]],
  "#e88331",
  "#6d26d7",
];

// snappoint casing and snappoint. Yellow-ish when straight, red when routed
(routingLayers[7].paint as unknown as Record<string, unknown>)["circle-color"] = (
  routingLayers[8].paint as unknown as Record<string, unknown>
)["circle-color"] = [
  "case",
  ["boolean", ["get", "straightLinesMode", ["get", "waypointProperties"]], false],
  ["case", ["boolean", ["get", "highlight"], false], "#e88331", "#f1a65a"],
  ["case", ["boolean", ["get", "highlight"], false], "#e50d3f", "#cb3373"],
];

// waypoint casing and waypoint. Yellow-ish when straight, purple when routed
(routingLayers[9].paint as unknown as Record<string, unknown>)["circle-color"] = (
  routingLayers[10].paint as unknown as Record<string, unknown>
)["circle-color"] = [
  "case",
  ["boolean", ["get", "straightLinesMode"], false],
  ["case", ["boolean", ["get", "highlight"], false], "#e8b331", "#f1cc5a"],
  ["case", ["boolean", ["get", "highlight"], false], "#6d26d7", "#7b33e7"],
];

// add static snappoint casing
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
routingLayers.push({
  id: `maplibre-gl-directions-static-snappoint-casing`,
  type: "circle",
  source: "maplibre-gl-directions",
  paint: { ...routingLayers[7].paint },
  filter: ["all", ["in", "$type", "Point"], ["in", "type", "STATIC_SNAPPOINT"]],
});

// add static snappoint
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
routingLayers.push({
  id: `maplibre-gl-directions-static-snappoint`,
  type: "circle",
  source: "maplibre-gl-directions",
  paint: { ...routingLayers[8].paint },
  filter: ["all", ["in", "$type", "Point"], ["in", "type", "STATIC_SNAPPOINT"]],
});

// add static waypoint casing
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
routingLayers.push({
  id: `maplibre-gl-static-waypoint-casing`,
  type: "circle",
  source: "maplibre-gl-directions",
  paint: { ...routingLayers[9].paint },
  filter: ["all", ["in", "$type", "Point"], ["in", "type", "STATIC_WAYPOINT"]],
});

// add static waypoint
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
routingLayers.push({
  id: `maplibre-gl-static-waypoint`,
  type: "circle",
  source: "maplibre-gl-directions",
  paint: { ...routingLayers[10].paint },
  filter: ["all", ["in", "$type", "Point"], ["in", "type", "STATIC_WAYPOINT"]],
});

// add direction arrow
routingLayers.push({
  id: "maplibre-gl-directions-routeline-direction-arrow",
  type: "symbol",
  source: "maplibre-gl-directions",
  layout: {
    "symbol-placement": "line-center",
    "icon-image": "direction-arrow",
    "icon-size": ["interpolate", ["exponential", 1.5], ["zoom"], 12, 0.9, 18, 1.5],
  },
  paint: {
    "icon-opacity": 0.75,
  },
  filter: ["all", ["in", "$type", "LineString"], ["in", "route", "SELECTED"]],
});

export { routingLayers };
