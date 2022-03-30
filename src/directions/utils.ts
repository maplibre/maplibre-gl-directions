import { Feature, LineString, Point } from "geojson";
import {
  DefaultMaplibreGlDirectionsOptions,
  GeoJSONGeometry,
  Geometry,
  Leg,
  MaplibreGlDirectionsOptions,
  PolylineGeometry,
  Route,
} from "./types";
import { decode } from "@mapbox/polyline";
import { nanoid } from "nanoid";
import layersFactory from "./layers";

/**
 * Take a potentially incomplete options object from the user and augment it with the default values.
 *
 * @param {Partial<MaplibreGlDirectionsOptions>} customOptions
 * @returns {MaplibreGlDirectionsOptions}
 */
export function buildOptions(customOptions: Partial<MaplibreGlDirectionsOptions>): MaplibreGlDirectionsOptions {
  customOptions.request = Object.assign({}, DefaultMaplibreGlDirectionsOptions.request, customOptions.request);
  const layers = layersFactory(
    customOptions.pointsScalingFactor ?? DefaultMaplibreGlDirectionsOptions.pointsScalingFactor,
    customOptions.linesScalingFactor ?? DefaultMaplibreGlDirectionsOptions.linesScalingFactor,
  );
  return Object.assign({}, DefaultMaplibreGlDirectionsOptions, { layers }, customOptions);
}

type PointType = "WAYPOINT" | "SNAPPOINT" | "HOVERPOINT";

/**
 * Build a GeoJSON Point Feature with the provided coordinates and of one of the known types.
 *
 * @param {number[]} coords Coordinates of the point
 * @param {PointType} type A type of the point
 * @returns {Feature<Point, {type: PointType, id: string}>}
 */
export function buildPoint(coords: number[], type: PointType): Feature<Point, { type: PointType; id: string }> {
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: coords,
    },
    properties: {
      type,
      id: nanoid(),
    },
  };
}

/**
 * A helper function which returns an array of LineString GeoJSON Features representing the snapping lines between
 * the waypoints and the snappoints and between the hoverpoint and its related leg's snappoints.
 *
 * @param {[number, number][]} waypoints Waypoints' coordinates
 * @param {[number, number][]} snappoints Snappoints' coordinates
 * @param {number} departSnappointIndex Index of the depart-snappoint (for the hoverpoint)
 * @param {[number, number]} hoverpoint The hoverpoint's coordinates
 * @param {boolean} showHoverpointSnaplines Whether the hoverpoint's snaplines should be visible or not
 * @returns {Feature<LineString>[]}
 */
export function buildSnaplines(
  waypoints: [number, number][],
  snappoints: [number, number][],
  departSnappointIndex: number,
  hoverpoint?: [number, number],
  showHoverpointSnaplines = false,
): Feature<LineString>[] {
  if (waypoints.length !== snappoints.length) return [];

  const features = waypoints.map((waypoint, index) => {
    return {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [waypoint[0], waypoint[1]],
          [snappoints[index][0], snappoints[index][1]],
        ],
      },
      properties: {
        type: "SNAPLINE",
      },
    } as Feature<LineString>;
  });

  if (~departSnappointIndex && hoverpoint !== undefined && showHoverpointSnaplines) {
    features.push({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [hoverpoint[0], hoverpoint[1]],
          [snappoints[departSnappointIndex][0], snappoints[departSnappointIndex][1]],
        ],
      },
      properties: {
        type: "SNAPLINE",
      },
    });

    features.push({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [hoverpoint[0], hoverpoint[1]],
          [snappoints[departSnappointIndex + 1][0], snappoints[departSnappointIndex + 1][1]],
        ],
      },
      properties: {
        type: "SNAPLINE",
      },
    });
  }

  return features;
}

/**
 * A helper function to round a number to a specific amount of fractional digits.
 *
 * @example
 * roundToN(2.005), 2) // returns 2.01
 *
 * @param {number} num A number to round
 * @param {number} n How many fractional digits needed (fractional digits - digits after the comma in a floating point number)
 * @returns {number}
 */
export function roundToN(num: number, n: number) {
  // From the TypeScript's perspective it's a bad idea to sum a number with a string, but that's actually what makes it
  // difficult to perform the following hack, so disable the TS-check here.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return +(Math.round(num + `e+${n}`) + `e-${n}`);
}

/**
 * A helper function to decode a route's geometry.
 *
 * Depending on the `options.request.geometries` property's value the coordinates might be returned as a
 * polyline6-encoded string, a polyline-encoded string or as a plain array of coordinate pairs. The function always
 * returns a longitude-latitude array.
 *
 * @param {Geometry} geometry A route geometry from the server's response
 * @param {MaplibreGlDirectionsOptions["request"]} options The `request` options initially passed to MaplibreGlDirections constructor
 * @returns {[number, number][]}
 */
function decodeGeometry(geometry: Geometry, options: MaplibreGlDirectionsOptions["request"]) {
  let coordinates: [number, number][];

  if (options.geometries === "geojson") {
    coordinates = (geometry as GeoJSONGeometry).coordinates;
  } else if (options.geometries === "polyline6") {
    coordinates = decode(geometry as PolylineGeometry, 6).map((latLng) => latLng.reverse() as [number, number]);
  } else {
    coordinates = decode(geometry as PolylineGeometry, 5).map((latLng) => latLng.reverse() as [number, number]);
  }

  return coordinates;
}

/**
 * A helper function to parse the Route Leg's `annotation` property (when available) for the congestion level value.
 *
 * Supports both `congestion` and `congestion_numeric` request options. Returns a number <= 0 <= 100 which indicates
 * the current route segment's congestion level.
 *
 * @param {Leg["annotation"]} annotation A Leg's `annotation` object from the server's response
 * @param {number} segmentIndex The current segment's index
 * @param {MaplibreGlDirectionsOptions["request"]} options The `request` options initially passed to MaplibreGlDirections constructor
 * @returns {string}
 */
function getCongestionLevel(
  annotation: Leg["annotation"],
  segmentIndex: number,
  options: MaplibreGlDirectionsOptions["request"],
): number {
  if (typeof options.annotations === "string" && (options.annotations as string).includes("congestion_numeric")) {
    return annotation?.congestion_numeric?.[segmentIndex] ?? 0;
  } else if (typeof options.annotations === "string" && (options.annotations as string).includes("congestion")) {
    switch (annotation?.congestion?.[segmentIndex] ?? "") {
      case "unknown":
        return 0;
      case "low":
        return 1;
      case "moderate":
        return 34;
      case "heavy":
        return 77;
      case "severe":
        return 100;
      default:
        return 0;
    }
  } else {
    return 0;
  }
}

/**
 * Build Routelines from the server response.
 *
 * Each routeline is an array of legs, where each leg is an array of segments. A segment is a GeoJSON LineString
 * Feature. Route legs are divided into segments by their congestion levels. If there's no congestions, each route leg
 * consists of a single segment.
 *
 * @param {Route[]} routes The `routes` array returned by the server
 * @param {number} selectedRouteIndex Currently selected route's index
 * @param {[number, number][]} snappointsCoordinates The snappoints' coordinates array
 * @param {MaplibreGlDirectionsOptions["request"]} options The `request` options initially passed to MaplibreGlDirections constructor
 * @returns {Feature<LineString>[][]}
 */
export function buildRoutelines(
  routes: Route[],
  selectedRouteIndex: number,
  snappointsCoordinates: [number, number][],
  options: MaplibreGlDirectionsOptions["request"],
): Feature<LineString>[][] {
  // do the following stuff for each route (there are multiple when `alternatives=true` request option is set
  return routes.map((route, routeIndex) => {
    // a list of coordinates pairs (longitude-latitude) the route goes by
    const coordinates = decodeGeometry(route.geometry, options);

    // indices of coordinate pairs that match existing snappoints (except for the first one)
    const snappointsCoordinatesIndices = snappointsCoordinates
      .map((snappointLngLat) => {
        return coordinates.findIndex((lngLat) => {
          // when using the `geometries=polyline` request option (default value) each route's coordinate has 5
          // fractional digits, while the snappoints always have 6. Even though that's respected by the
          // `snappointsCoordinates` getter, sometimes they still mismatch, so the `findIndex` might return -1
          return lngLat[0] === snappointLngLat[0] && lngLat[1] === snappointLngLat[1];
        });
      })
      .slice(1); // because the first one is always 0

    // if some snappoint wasn't found because of the issue described above then just through an exception, there's
    // nothing we can do about it
    if (snappointsCoordinatesIndices.includes(-1)) throw "MISSING_SNAPPOINT";

    // split the coordinates array by legs. Each leg consists of coordinates between snappoints
    let initialIndex = 0;
    const legsCoordinates = snappointsCoordinatesIndices.map((waypointCoordinatesIndex) => {
      return coordinates.slice(initialIndex, (initialIndex = waypointCoordinatesIndex + 1));
    });

    // an array to store the resulting route's features in
    const features: Feature<LineString>[] = [];

    legsCoordinates.forEach((legCoordinates, legIndex) => {
      const legId = nanoid();

      // for each pair of leg's coordinates
      legCoordinates.forEach((lngLat, i) => {
        // find the previous segment
        const previousSegment = features[features.length - 1] as Feature<LineString> | undefined;
        // determine the current segment's congestion level
        const segmentCongestion = getCongestionLevel(route.legs[legIndex].annotation, i, options);

        // only allow to continue the previous segment if it exists and if it's the same leg and if it's the same
        // congestion level
        if (
          legIndex === previousSegment?.properties?.legIndex &&
          previousSegment.properties?.congestion === segmentCongestion
        ) {
          previousSegment.geometry.coordinates.push(lngLat);
        } else {
          const segment = {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [],
            },
            properties: {
              id: legId, // used to highlight the whole leg when hovered, not a single segment
              routeIndex, // used to switch between alternative and selected routes
              route: routeIndex === selectedRouteIndex ? "SELECTED" : "ALT",
              legIndex, // used across forEach iterations to check whether it's safe to continue a segment
              congestion: segmentCongestion, // the current segment's congestion level
            },
          } as Feature<LineString>;

          // New segment starts with previous segment's last coordinate.
          if (previousSegment) {
            segment.geometry.coordinates.push(
              previousSegment.geometry.coordinates[previousSegment.geometry.coordinates.length - 1],
            );
          }

          segment.geometry.coordinates.push(lngLat);

          features.push(segment);
        }
      });
    });

    return features;
  });
}
