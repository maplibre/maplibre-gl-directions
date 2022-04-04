import MaplibreGlDirections from "./directions/main";
import type { MaplibreGlDirectionsOptions } from "./directions/types";
import type { LayerSpecification } from "maplibre-gl";
import layersFactory from "./directions/layers";
import * as utils from "./directions/utils";

export default MaplibreGlDirections;
export type { MaplibreGlDirectionsOptions };
/**
 * @see {@link https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/|Layers | Style Specification}
 */
export type { LayerSpecification };
export { layersFactory };
export { utils };
