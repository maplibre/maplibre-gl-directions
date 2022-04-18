import MapLibreGlDirections from "./directions/main";
import type { MapLibreGlDirectionsConfiguration, PointType } from "./directions/types";
import layersFactory from "./directions/layers";
import type { LayerSpecification } from "maplibre-gl";
import * as utils from "./directions/utils";
import type { Feature, Point, LineString } from "geojson";
import LoadingControl from "./controls/loading/main";

export default MapLibreGlDirections;
export type { MapLibreGlDirectionsConfiguration };

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

export { LoadingControl };
