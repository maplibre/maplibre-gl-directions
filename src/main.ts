import MapLibreGlDirections from "./directions/main";
import type {
  MapLibreGlDirectionsConfiguration,
  PointType,
  Directions,
  Route,
  Leg,
  Snappoint,
} from "./directions/types";
import {
  type MapLibreGlDirectionsEventType,
  type AnyMapLibreGlDirectionsEvent,
  type MapLibreGlDirectionsEventData,
  type MapLibreGlDirectionsAddWaypointData,
  type MapLibreGlDirectionsRemoveWaypointData,
  type MapLibreGlDirectionsMoveWaypointData,
  type MapLibreGlDirectionsRoutingData,
  MapLibreGlDirectionsCancelableEvent,
  MapLibreGlDirectionsNonCancelableEvent,
} from "./directions/events";
import layersFactory from "./directions/layers";
import type { LayerSpecification, MapMouseEvent, MapTouchEvent } from "maplibre-gl";
import * as utils from "./directions/utils";
import type { Feature, Point, LineString } from "geojson";

import LoadingIndicatorControl from "./controls/loading-indicator/main";
import type { LoadingIndicatorControlConfiguration } from "./controls/loading-indicator/types";
import BearingsControl from "./controls/bearings/main";
import type { BearingsControlConfiguration } from "./controls/bearings/types";
import "./controls/common.css";

export default MapLibreGlDirections;
export type { MapLibreGlDirectionsConfiguration };
export type { MapLibreGlDirectionsEventType };
export { layersFactory };

/**
 * @protected
 */
export type {
  Directions,
  Route,
  Leg,
  Snappoint,
  AnyMapLibreGlDirectionsEvent,
  MapLibreGlDirectionsEventData,
  MapLibreGlDirectionsAddWaypointData,
  MapLibreGlDirectionsRemoveWaypointData,
  MapLibreGlDirectionsMoveWaypointData,
  MapLibreGlDirectionsRoutingData,
};

/**
 * @protected
 */
export { MapLibreGlDirectionsCancelableEvent, MapLibreGlDirectionsNonCancelableEvent };

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

export { LoadingIndicatorControl };
export type { LoadingIndicatorControlConfiguration };

export { BearingsControl };
export type { BearingsControlConfiguration };
