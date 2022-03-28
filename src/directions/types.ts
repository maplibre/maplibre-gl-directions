import type { LayerSpecification } from "maplibre-gl";

export interface MaplibreGlDirectionsOptions {
  layers: LayerSpecification[];
  sensitiveWaypointLayers: string[];
  sensitiveSnappointLayers: string[];
  sensitiveRoutelineLayers: string[];
  sensitiveAltRoutelineLayers: string[];
  dragThreshold: number;
}

export interface Directions {
  code: "Ok" | "NoRoute" | "NoSegment" | "Forbidden" | "ProfileNotFound" | "InvalidInput";
  routes: Route[];
  uuid: string;
  waypoints: Waypoint[];
}

export interface Route {
  legs: Leg[];
}

interface Leg {
  steps: Step[];
}

interface Step {
  maneuver: {
    type: "depart" | "arrive";
    location: [number, number];
  };
  geometry: string;
}

export interface Waypoint {
  location: [number, number];
}
