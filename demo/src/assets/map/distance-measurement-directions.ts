import type maplibregl from "maplibre-gl";
import type {
  MapLibreGlDirectionsConfiguration,
  Route,
  Feature,
  Point,
  LineString,
} from "@maplibre/maplibre-gl-directions";
import MapLibreGlDirections from "@maplibre/maplibre-gl-directions";
import { utils } from "@maplibre/maplibre-gl-directions";

export default class DistanceMeasurementMapLibreGlDirections extends MapLibreGlDirections {
  constructor(map: maplibregl.Map, configuration?: Partial<MapLibreGlDirectionsConfiguration>) {
    super(map, configuration);
  }

  // here we save the original method to be able to use it in the re-defined one. For some methods (namely those
  // that are defined as methods and not as properties) you can instead call their "super" counterparts, but for the
  // methods as `buildRoutelines` it's impossible due to restrictions implied by the language itself, so that's the
  // only reasonable way to be able to use the original functionality as a part of the re-defined method
  originalBuildRoutelines = utils.buildRoutelines;

  // re-defining the original `buildRoutelines` method
  protected buildRoutelines = (
    requestOptions: MapLibreGlDirectionsConfiguration["requestOptions"],
    routes: Route[],
    selectedRouteIndex: number,
    snappoints: Feature<Point>[],
  ): Feature<LineString>[][] => {
    // first we call the original method. It returns the built routelines
    const routelines = this.originalBuildRoutelines(requestOptions, routes, selectedRouteIndex, snappoints);

    // then we modify the routelines adding to each route leg a property that stores the leg's distance
    routelines[0].forEach((leg, index) => {
      if (leg.properties) leg.properties.distance = routes[0].legs[index].distance as number;
    });

    // and returning the modified routelines
    return routelines;
  };
}

// using a different source name. That might become useful if you'd like to use the Distance Measurement Directions
// instance along with a normal Directions instance on the same map
const sourceName = "distance-measurement-maplibre-gl-directions";

const config: Partial<MapLibreGlDirectionsConfiguration> = {
  sourceName,
  layers: [
    {
      id: `${sourceName}-snapline`,
      type: "line",
      source: sourceName,
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-dasharray": [3, 3],
        "line-color": "#34343f",
        "line-width": 2,
      },
      filter: ["==", ["get", "type"], "SNAPLINE"],
    },
    {
      id: `${sourceName}-routeline`,
      type: "line",
      source: sourceName,
      layout: {
        "line-cap": "butt",
        "line-join": "round",
      },
      paint: {
        "line-color": "#212121",
        "line-opacity": 0.85,
        "line-width": 3,
      },
      filter: ["==", ["get", "route"], "SELECTED"],
    },
    {
      id: `${sourceName}-routeline-distance`,
      type: "symbol",
      source: sourceName,
      layout: {
        "symbol-placement": "line-center",
        "text-field": "{distance}m",
        "text-size": 16,
        "text-ignore-placement": true,
        "text-allow-overlap": true,
        "text-overlap": "always",
      },
      paint: {
        "text-color": "#212121",
        "text-halo-color": "#ffffff",
        "text-halo-width": 1,
      },
      filter: ["==", ["get", "route"], "SELECTED"],
    },
    {
      id: `${sourceName}-hoverpoint`,
      type: "circle",
      source: sourceName,
      paint: {
        "circle-radius": 9,
        "circle-color": "#212121",
      },
      filter: ["==", ["get", "type"], "HOVERPOINT"],
    },
    {
      id: `${sourceName}-snappoint`,
      type: "circle",
      source: sourceName,
      paint: {
        "circle-radius": ["case", ["boolean", ["get", "highlight"], false], 9, 7],
        "circle-color": ["case", ["boolean", ["get", "highlight"], false], "#313131", "#494949"],
      },
      filter: ["==", ["get", "type"], "SNAPPOINT"],
    },
    {
      id: `${sourceName}-waypoint`,
      type: "circle",
      source: sourceName,
      paint: {
        "circle-radius": ["case", ["boolean", ["get", "highlight"], false], 9, 7],
        "circle-color": ["case", ["boolean", ["get", "highlight"], false], "#212121", "#2c2c2c"],
      },
      filter: ["==", ["get", "type"], "WAYPOINT"],
    },
  ] as maplibregl.LayerSpecification[],
  // don't forget to update the sensitive layers
  sensitiveSnappointLayers: [`${sourceName}-snappoint`],
  sensitiveWaypointLayers: [`${sourceName}-waypoint`],
  sensitiveRoutelineLayers: [`${sourceName}-routeline`],
  sensitiveAltRoutelineLayers: [],
};

export { config };
