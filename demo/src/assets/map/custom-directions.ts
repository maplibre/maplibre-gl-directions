import type maplibregl from "maplibre-gl";
import type { MapLibreGlDirectionsConfiguration, Feature, LineString, Point } from "@maplibre/maplibre-gl-directions";
import MapLibreGlDirections from "@maplibre/maplibre-gl-directions";
import { MapLibreGlDirectionsWaypointEvent } from "@maplibre/maplibre-gl-directions";

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
