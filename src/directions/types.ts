import type { LayerSpecification } from "maplibre-gl";

/**
 * The {@link default|MaplibreGlDirections} configuration object's interface.
 */
export interface MaplibreGlDirectionsConfiguration {
  /**
   * An API-provider URL to make the routing requests to.
   *
   * Any {@link http://project-osrm.org/|OSRM}-compatible or
   * {@link https://docs.mapbox.com/api/navigation/directions/|Mapbox Directions API}-compatible API-provider is
   * supported.
   *
   * @default `"https://router.project-osrm.org/route/v1"`
   *
   * @example
   * ```
   * api: "https://router.project-osrm.org/route/v1"
   * ```
   *
   * @example
   * ```
   * api: "https://api.mapbox.com/directions/v5"
   * ```
   */
  api: string;

  /**
   * A routing profile to use. The value depends on the API-provider of choice.
   *
   * @see {@link http://project-osrm.org/docs/v5.24.0/api/#requests|OSRM #Requests}
   * @see {@link https://docs.mapbox.com/api/navigation/directions/#routing-profiles|Mapbox Direction API #Routing profiles}
   *
   * @default `"driving"`
   *
   * @example
   * ```
   * api: "https://router.project-osrm.org/route/v1",
   * profile: "driving"
   * ```
   *
   * @example
   * ```
   * api: "https://api.mapbox.com/directions/v5",
   * profile: "mapbox/driving-traffic"
   * ```
   */
  profile: string;

  /**
   * A list of the request-payload parameters that are passed along with routing requests.
   *
   * __Note__ that the `access-token` request-parameter has a special treatment when used along with
   * {@link makePostRequest|`makePostRequest: true`}. It's automatically removed from the `FormData` and passed as a URL
   * query-parameter as the Mapbox Directions API {@link https://docs.mapbox.com/api/navigation/http-post/|requires}.
   *
   * @default `{}`
   *
   * @example
   * ```
   * request: {
   *   overview: "full",
   *   steps: "true"
   * }
   * ```
   *
   * @example
   * ```
   * api: "https://api.mapbox.com/directions/v5",
   * profile: "mapbox/driving-traffic",
   * request: {
   *   access_token: "<mapbox-access-token>",
   *   annotations: "congestion",
   *   geometries: "polyline6"
   * }
   * ```
   */
  requestOptions: Partial<Record<string, string>>;

  /**
   * Whether to make a {@link https://docs.mapbox.com/api/navigation/http-post/|POST request} instead of a GET one.
   *
   * __Note__ that this is only supported by the Mapbox Directions API. Don't set the value to `true` if using an
   * OSRM-compatible API-provider.
   *
   * @default `false`
   *
   * @example
   * ```
   * api: "https://api.mapbox.com/directions/v5",
   * profile: "mapbox/driving-traffic",
   * makePostRequest: true
   * ```
   */
  makePostRequest: boolean;

  /**
   * The layers used by the plugin.
   *
   * @default The value returned by the {@link layersFactory|`layersFactory`} invoked with the passed
   * {@link pointsScalingFactor|`options.pointsScalingFactor`} and
   * {@link linesScalingFactor|`options.linesScalingFactor`}
   *
   * __Note__ that you don't have to create layers with the {@link layersFactory|`layersFactory`}. Any
   * `LayerSpecification[]` value is OK.
   *
   * __Note__ that if you add custom layers then you'd most probably want to register them as sensitive layers using
   * the {@link sensitiveWaypointLayers|`options.sensitiveWaypointLayers`},
   * {@link sensitiveSnappointLayers|`options.sensitiveSnappointLayers`},
   * {@link sensitiveAltRoutelineLayers|`options.sensitiveAltRoutelineLayers`} and
   * {@link sensitiveRoutelineLayers|`options.sensitiveRoutelineLayers`} options.
   *
   * @example
   * ```
   * // Use the default layers with all the points increased by 1.5 times and all the lines increased by 2 times and an additional `"my-custom-layer"` layer.
   * {
   *   layers: layersFactory(1.5, 2).concat([
   *     {
   *       id: "my-custom-layer",
   *       // ...
   *     }
   *   ])
   * }
   * ```
   */
  layers: LayerSpecification[];

  /**
   * A factor by which all the default points' dimensions should be increased. The value is passed as is to the
   * {@link layersFactory|`layersFactory`}'s first argument.
   *
   * __Note__ that the option has no effect when the `layers` option is provided.
   *
   * @default `1`
   *
   * @example
   * ```
   * // Increase all the points by 1.5 times when the map is used on a touch-enabled device
   * linesScalingFactor: isTouchDevice ? 1.5 : 1
   * ```
   */
  pointsScalingFactor: number;

  /**
   * A factor by which all the default lines' dimensions should be increased. The value is passed as is to the
   * {@link layersFactory|`layersFactory`}'s second argument.
   *
   * __Note__ that the option has no effect on the snaplines.
   *
   * __Note__ that the option has no effect when the `layers` option is provided.
   *
   * @default `1`
   *
   * @example
   * ```
   * // Increase all the lines by 2 times when the map is used on a touch-enabled device
   * linesScalingFactor: isTouchDevice ? 2 : 1
   * ```
   */
  linesScalingFactor: number;

  /**
   * IDs of the layers that are used to represent the waypoints which should be interactive.
   *
   * @default `["maplibre-gl-directions-waypoint", "maplibre-gl-directions-waypoint-casing"]`
   *
   * @example
   * ```
   * sensitiveSnappointLayers: [
   *   "maplibre-gl-directions-waypoint",
   *   "maplibre-gl-directions-waypoint-casing",
   *   "my-custom-waypoint-layer"
   * ]
   * ```
   */
  sensitiveWaypointLayers: string[];

  /**
   * IDs of the layers that are used to represent the snappoints which should be interactive.
   *
   * @default `["maplibre-gl-directions-snappoint", "maplibre-gl-directions-snappoint-casing"]`
   *
   * @example
   * ```
   * sensitiveSnappointLayers: [
   *   "maplibre-gl-directions-snappoint",
   *   "maplibre-gl-directions-snappoint-casing",
   *   "my-custom-snappoint-layer"
   * ]
   * ```
   */
  sensitiveSnappointLayers: string[];

  /**
   * IDs of the layers that are used to represent the selected route line which should be interactive.
   *
   * @default `["maplibre-gl-directions-routeline", "maplibre-gl-directions-routeline-casing"]`
   *
   * @example
   * ```
   * sensitiveRoutelineLayers: [
   *   "maplibre-gl-directions-routeline",
   *   "maplibre-gl-directions-routeline-casing",
   *   "my-custom-routeline-layer"
   * ]
   * ```
   */
  sensitiveRoutelineLayers: string[];

  /**
   * IDs of the layers that are used to represent the alternative route lines which should be interactive.
   *
   * @default `["maplibre-gl-directions-alt-routeline", "maplibre-gl-directions-alt-routeline-casing"]`
   *
   * @example
   * ```
   * sensitiveAltRoutelineLayers: [
   *   "maplibre-gl-directions-alt-routeline",
   *   "maplibre-gl-directions-alt-routeline-casing",
   *   "my-custom-alt-routeline-layer"
   * ]
   * ```
   */
  sensitiveAltRoutelineLayers: string[];

  /**
   * A minimal amount of pixels a waypoint or the hoverpoint must be dragged in order for the drag-event to be
   * respected. Should be a number >= `0`. Any negative value is treated as `0`.
   *
   * @default `10`
   *
   * @example
   * ```
   * // Don't respect drag-events where a point was dragged for less than 5px away from its initial location
   * dragThreshold: 5
   * ```
   */
  dragThreshold: number;
}

export const MaplibreGlDirectionsDefaultConfiguration: Omit<MaplibreGlDirectionsConfiguration, "layers"> = {
  api: "https://router.project-osrm.org/route/v1",
  profile: "driving",
  requestOptions: {},
  makePostRequest: false,
  pointsScalingFactor: 1,
  linesScalingFactor: 1,
  sensitiveWaypointLayers: ["maplibre-gl-directions-waypoint", "maplibre-gl-directions-waypoint-casing"],
  sensitiveSnappointLayers: ["maplibre-gl-directions-snappoint", "maplibre-gl-directions-snappoint-casing"],
  sensitiveRoutelineLayers: ["maplibre-gl-directions-routeline", "maplibre-gl-directions-routeline-casing"],
  sensitiveAltRoutelineLayers: ["maplibre-gl-directions-alt-routeline", "maplibre-gl-directions-alt-routeline-casing"],
  dragThreshold: 10,
};

export type PointType = "WAYPOINT" | "SNAPPOINT" | "HOVERPOINT";

// server response. Only the necessary for the plugin fields

export interface Directions {
  code: string;
  routes: Route[];
  waypoints: Snappoint[];
}

export type Geometry = PolylineGeometry | GeoJSONGeometry;
export type GeoJSONGeometry = { coordinates: [number, number][] };
export type PolylineGeometry = string;

export interface Route {
  geometry: Geometry;
  legs: Leg[];
}

export interface Leg {
  annotation?: {
    congestion?: ("unknown" | "low" | "moderate" | "heavy" | "severe")[];
    congestion_numeric?: (number | null)[];
  };
}

export interface Snappoint {
  location: [number, number];
}
