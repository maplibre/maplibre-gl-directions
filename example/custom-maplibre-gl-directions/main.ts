import type maplibregl from "maplibre-gl";
import type { MaplibreGlDirectionsOptions } from "../../src/directions/types";
import MaplibreGlDirections from "../../src/directions/main";
import { utils } from "../../src/main";

export default class CustomMaplibreGlDirections extends MaplibreGlDirections {
  constructor(map: maplibregl.Map, options?: Partial<MaplibreGlDirectionsOptions>) {
    super(map, options);
  }

  originalBuildPostRequestPayload = utils.buildPostRequestPayloadFactory(this.options.request);

  private _straightLinesMode = false;

  // redefined implementation

  protected buildPostRequestPayload = function (
    this: CustomMaplibreGlDirections,
    waypointsCoordinates: [number, number][],
  ) {
    const requestPayload = this.originalBuildPostRequestPayload(waypointsCoordinates);
    requestPayload.append(
      "straight",
      this.waypoints.map((waypoint) => waypoint.properties?.straightLinesMode ?? false).join(","),
    );
    return requestPayload;
  };

  // augmented and modified public interface

  get straightLinesMode() {
    return this._straightLinesMode;
  }

  set straightLinesMode(straightLinesMode) {
    this._straightLinesMode = straightLinesMode;
  }

  async addWaypoint(waypoint: [number, number], index?: number) {
    index = index ?? this.waypoints.length;

    this.waypoints.splice(
      index,
      0,
      this.buildPoint(waypoint, "WAYPOINT", {
        straightLinesMode: this.straightLinesMode,
      }),
    );

    this.draw();
    await this.fetchDirections();
  }
}
