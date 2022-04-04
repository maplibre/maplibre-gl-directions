import type { MaplibreGlDirectionsOptions, PointType, Route } from "./types";
import type { Feature, LineString, Point } from "geojson";
import { nanoid } from "nanoid";
import { congestionLevelDecoderFactory, coordinatesComparatorFactory, geometryDecoderFactory } from "./helpers";
import { DefaultMaplibreGlDirectionsOptions } from "./types";
import layersFactory from "./layers";

export function buildOptions(customOptions?: Partial<MaplibreGlDirectionsOptions>): MaplibreGlDirectionsOptions {
  const layers = layersFactory(customOptions?.pointsScalingFactor, customOptions?.linesScalingFactor);
  return Object.assign({}, DefaultMaplibreGlDirectionsOptions, { layers }, customOptions);
}

/**
 * Takes the {@link DefaultMaplibreGlDirectionsOptions} object and the waypoints' coordinates and returns the request method,
 * URL and parameters.
 */
export function buildRequest(
  options: typeof DefaultMaplibreGlDirectionsOptions,
  waypointsCoordinates: [number, number][],
): { method: "get" | "post"; url: string; payload: URLSearchParams | FormData } {
  const method = options.makePostRequest ? "post" : "get";

  let url: string;
  let payload: URLSearchParams;

  if (method === "get") {
    url = `${options.api}/${options.profile}/${waypointsCoordinates.join(";")}`;
    payload = new URLSearchParams(options.request);
  } else {
    url = `${options.api}/${options.profile}${
      options.request.access_token ? `?access_token=${options.request.access_token}` : ""
    }`;

    const formData = new FormData();

    Object.entries(options.request).forEach(([key, value]) => {
      if (key !== "access_token") {
        formData.set(key, value);
      }
    });

    formData.set("coordinates", waypointsCoordinates.join(";"));

    // the URLSearchParams constructor works perfectly fine with FormData, so ignore the TypeScript's complaint
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    payload = new URLSearchParams(formData);
  }

  return { method, url, payload };
}

/**
 * Creates a GeoJSON Point Feature of one of the known types at a given coordinate.
 *
 * @param {[number, number]} coordinate
 * @param {PointType} type
 * @param {Record<string, unknown>} properties
 * @return {Feature<Point>}
 */
export function buildPoint(
  coordinate: [number, number],
  type: PointType,
  properties?: Record<string, unknown>,
): Feature<Point> {
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: coordinate,
    },
    properties: {
      type,
      id: nanoid(),
      ...(properties ?? {}),
    },
  };
}

/**
 * Creates a context-aware function that creates a GeoJSON LineString Features array where each feature represents a
 * line connecting a waypoint with its respective snappoint and a hoverpoint with its respective snappoints.
 *
 * @param {[number, number][]} waypointsCoordinates
 * @param {[number, number][]} snappointsCoordinates
 * @param {[number, number] | undefined} hoverpointCoordinates
 * @param {number} departSnappointIndex
 * @param {boolean} showHoverpointSnaplines
 * @return {Feature<LineString>[]}
 */
export function buildSnaplines(
  waypointsCoordinates: [number, number][],
  snappointsCoordinates: [number, number][],
  hoverpointCoordinates: [number, number] | undefined,
  departSnappointIndex: number, // might be -1
  showHoverpointSnaplines = false,
): Feature<LineString>[] {
  if (waypointsCoordinates.length !== snappointsCoordinates.length) return [];

  const snaplines = waypointsCoordinates.map((waypointCoordinates, index) => {
    return {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [waypointCoordinates[0], waypointCoordinates[1]],
          [snappointsCoordinates[index][0], snappointsCoordinates[index][1]],
        ],
      },
      properties: {
        type: "SNAPLINE",
      },
    } as Feature<LineString>;
  });

  if (~departSnappointIndex && hoverpointCoordinates !== undefined && showHoverpointSnaplines) {
    snaplines.push({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [hoverpointCoordinates[0], hoverpointCoordinates[1]],
          [snappointsCoordinates[departSnappointIndex][0], snappointsCoordinates[departSnappointIndex][1]],
        ],
      },
      properties: {
        type: "SNAPLINE",
      },
    });

    snaplines.push({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [hoverpointCoordinates[0], hoverpointCoordinates[1]],
          [snappointsCoordinates[departSnappointIndex + 1][0], snappointsCoordinates[departSnappointIndex + 1][1]],
        ],
      },
      properties: {
        type: "SNAPLINE",
      },
    });
  }

  return snaplines;
}

/**
 * Creates a context-aware function that creates routelines from the server response.
 *
 * Each routeline is an array of legs, where each leg is an array of segments. A segment is a GeoJSON LineString
 * Feature. Route legs are divided into segments by their congestion levels. If there's no congestions, each route leg
 * consists of a single segment.
 *
 * @param {MaplibreGlDirectionsOptions["request"]} requestOptions
 * @returns {(routes: Route[], selectedRouteIndex: number, snappointsCoordinates: [number, number][]) => Feature<LineString>[][]}
 */
export function buildRoutelinesFactory(requestOptions: typeof DefaultMaplibreGlDirectionsOptions["request"]) {
  const geometryDecoder = geometryDecoderFactory(requestOptions);
  const coordinatesComparator = coordinatesComparatorFactory(requestOptions);
  const congestionLevelDecoder = congestionLevelDecoderFactory(requestOptions);

  function buildRoutelines(
    routes: Route[],
    selectedRouteIndex: number,
    snappoints: Feature<Point>[],
  ): Feature<LineString>[][] {
    // do the following stuff for each route (there are multiple when `alternatives=true` request option is set)
    return routes.map((route, routeIndex) => {
      // a list of coordinates pairs (longitude-latitude) the route goes by
      const coordinates = geometryDecoder(route.geometry);

      // get coordinates from the snappoint-features
      const snappointsCoordinates = snappoints.map((snappoint) => snappoint.geometry.coordinates);

      // indices of coordinate pairs that match existing snappoints (except for the first one)
      const snappointsCoordinatesIndices = snappointsCoordinates
        .map((snappointLngLat) => {
          return coordinates.findIndex((lngLat) => {
            // there might be an error in 0.00001 degree between snappoint and decoded coordinate when using the
            // "polyline" geometries. The comparator neglects that
            return coordinatesComparator(lngLat, snappointLngLat as [number, number]);
          });
        })
        .slice(1); // because the first one is always 0

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
          const segmentCongestion = congestionLevelDecoder(route.legs[legIndex]?.annotation, i);

          // only allow to continue the previous segment if it exists and if it's the same leg and if it's the same
          // congestion level
          if (
            legIndex === previousSegment?.properties?.legIndex &&
            previousSegment.properties?.congestion === segmentCongestion
          ) {
            previousSegment.geometry.coordinates.push(lngLat);
          } else {
            const departSnappointProperties = snappoints[legIndex].properties ?? {};
            const arriveSnappointProperties = snappoints[legIndex + 1].properties ?? {};

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
                departSnappointProperties, // include depart and arrive snappoints' properties to allow customization...
                arriveSnappointProperties, // ...of behavior via a subclass
              },
            } as Feature<LineString>;

            // a new segment starts with previous segment's last coordinate
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

  return buildRoutelines;
}
