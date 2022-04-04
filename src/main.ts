import MaplibreGlDirections from "./directions/main";
import type { MaplibreGlDirectionsConfiguration, PointType } from "./directions/types";
import layersFactory from "./directions/layers";
import type { LayerSpecification } from "maplibre-gl";
import * as utils from "./directions/utils";
import type { Feature, Point, LineString } from "geojson";

export default MaplibreGlDirections;
export type { MaplibreGlDirectionsConfiguration };

export { layersFactory };
/**
 * @see {@link https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/|Layers | Style Specification}
 */
export type { LayerSpecification };

/**
 * @protected
 */
export { utils };
/**
 * @protected
 */
export type { Feature, Point, PointType, LineString };
