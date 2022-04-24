import MapLibreGlDirections from "./directions/main";
import type { MapLibreGlDirectionsConfiguration, PointType } from "./directions/types";
import {
  MapLibreGlDirectionsEventType,
  MapLibreGlDirectionsWaypointEvent,
  MapLibreGlDirectionsWaypointEventData,
  MapLibreGlDirectionsRoutingEvent,
  MapLibreGlDirectionsRoutingEventData,
} from "./directions/events";
import layersFactory from "./directions/layers";
import type { LayerSpecification, MapMouseEvent, MapTouchEvent } from "maplibre-gl";
import * as utils from "./directions/utils";
import type { Feature, Point, LineString } from "geojson";

export default MapLibreGlDirections;
export type { MapLibreGlDirectionsConfiguration };
export type { MapLibreGlDirectionsEventType };
export { layersFactory };

import LoadingIndicatorControl from "./controls/loading-indicator/main";
import type { LoadingIndicatorControlConfiguration } from "./controls/loading-indicator/types";
import "./controls/common.css";

/**
 * @protected
 */
export type {
  MapLibreGlDirectionsWaypointEvent,
  MapLibreGlDirectionsWaypointEventData,
  MapLibreGlDirectionsRoutingEvent,
  MapLibreGlDirectionsRoutingEventData,
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

/**
 * @deprecated in favor of {@link LoadingIndicatorControl}
 */
export { LoadingIndicatorControl as LoadingControl };
export { LoadingIndicatorControl };
export type { LoadingIndicatorControlConfiguration };
