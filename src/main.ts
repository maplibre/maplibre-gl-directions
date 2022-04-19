import MaplibreGlDirections from "./directions/main";
import type { MaplibreGlDirectionsConfiguration, PointType } from "./directions/types";
import {
  MaplibreGlDirectionsEventType,
  MaplibreGlDirectionsWaypointEvent,
  MaplibreGlDirectionsWaypointEventData,
  MaplibreGlDirectionsRoutingEvent,
  MaplibreGlDirectionsRoutingEventData,
} from "./directions/events";
import layersFactory from "./directions/layers";
import type { LayerSpecification, MapMouseEvent, MapTouchEvent } from "maplibre-gl";
import * as utils from "./directions/utils";
import type { Feature, Point, LineString } from "geojson";

export default MaplibreGlDirections;
export type { MaplibreGlDirectionsConfiguration };
export type { MaplibreGlDirectionsEventType };
export { layersFactory };

/**
 * @protected
 */
export type {
  MaplibreGlDirectionsWaypointEvent,
  MaplibreGlDirectionsWaypointEventData,
  MaplibreGlDirectionsRoutingEvent,
  MaplibreGlDirectionsRoutingEventData,
};

/**
 * @protected
 * @see {@link https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/|Layers | Style Specification}
 */
export type { LayerSpecification };

/**
 * @protected
 */
export type { MapMouseEvent, MapTouchEvent };

/**
 * @protected
 */
export { utils };
/**
 * @protected
 */
export type { Feature, Point, PointType, LineString };
