import type maplibregl from "maplibre-gl";
import MaplibreGlDirections, { MaplibreGlDirectionsConfiguration, utils, layersFactory } from "maplibre-gl-directions";

export default class CustomMaplibreGlDirections extends MaplibreGlDirections {
  constructor(map: maplibregl.Map, configuration?: Partial<MaplibreGlDirectionsConfiguration>) {
    super(map, configuration);
  }

  // originalBuildPostRequestPayload = utils.buildPostRequestPayloadFactory(this.options.request);
  originalBuildPoint = utils.buildPoint;

  // augmented implementation

  private _straightLinesMode = false;

  // redefined implementation

  // protected buildPostRequestPayload = (waypointsCoordinates: [number, number][]) => {
  //   const requestPayload = this.originalBuildPostRequestPayload(waypointsCoordinates);
  //   requestPayload.append(
  //     "straight",
  //     this.waypoints.map((waypoint) => waypoint.properties?.straightLinesMode ?? false).join(","),
  //   );
  //   return requestPayload;
  // };

  // protected buildPoint = (
  //   coordinate: [number, number],
  //   type: "WAYPOINT" | "SNAPPOINT" | "HOVERPOINT",
  //   properties?: Record<string, unknown>,
  // ) => {
  //   const feature = this.originalBuildPoint(coordinate, type, properties);
  //
  //   if ((type === "HOVERPOINT" || type === "WAYPOINT") && feature.properties) {
  //     feature.properties.straightLinesMode = this.straightLinesMode;
  //   }
  //
  //   return feature;
  // };
  //
  // updateHoverpointProperties() {
  //   if (this.hoverpoint?.properties) {
  //     this.hoverpoint.properties.straightLinesMode = this.straightLinesMode;
  //   }
  //
  //   this.draw();  // }

  // augmented public interface

  get straightLinesMode() {
    return this._straightLinesMode;
  }

  set straightLinesMode(straightLinesMode) {
    this._straightLinesMode = straightLinesMode;
  }
}

const routingLayers = layersFactory();

// routeline casing and routeline
(routingLayers[3].paint as unknown as Record<string, unknown>)["line-color"] = (
  routingLayers[4].paint as unknown as Record<string, unknown>
)["line-color"] = [
  "case",
  [
    "any",
    // [
    //   "boolean",
    //   ["get", "straightLinesMode", ["get", "waypointProperties", ["get", "departSnappointProperties"]]],
    //   false,
    // ],
    [
      "boolean",
      ["get", "straightLinesMode", ["get", "waypointProperties", ["get", "arriveSnappointProperties"]]],
      false,
    ],
  ],
  "#f3d372",
  "#7b51f8",
];

// hoverpoint casing
(routingLayers[5].paint as unknown as Record<string, unknown>)["circle-color"] = [
  "case",
  ["boolean", ["get", "straightLinesMode"]],
  "#e88331",
  "#6d26d7",
];

// snappoint casing and snappoint
(routingLayers[7].paint as unknown as Record<string, unknown>)["circle-color"] = (
  routingLayers[8].paint as unknown as Record<string, unknown>
)["circle-color"] = [
  "case",
  ["boolean", ["get", "straightLinesMode", ["get", "waypointProperties"]], false],
  ["case", ["boolean", ["get", "highlight"], false], "#e88331", "#f1a65a"],
  ["case", ["boolean", ["get", "highlight"], false], "#e50d3f", "#cb3373"],
];

// waypoint casing and waypoint
(routingLayers[9].paint as unknown as Record<string, unknown>)["circle-color"] = (
  routingLayers[10].paint as unknown as Record<string, unknown>
)["circle-color"] = [
  "case",
  ["boolean", ["get", "straightLinesMode"], false],
  ["case", ["boolean", ["get", "highlight"], false], "#e8b331", "#f1cc5a"],
  ["case", ["boolean", ["get", "highlight"], false], "#6d26d7", "#7b33e7"],
];

export { routingLayers };
