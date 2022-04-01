import type { MaplibreGlDirectionsOptions, PointType, Route } from "./types";
import type { Feature, LineString, Point } from "geojson";
import { DefaultMaplibreGlDirectionsOptions, Geometry } from "./types";
import layersFactory from "./layers";
import { nanoid } from "nanoid";
import { congestionLevelDecoderFactory, coordinateRounderFactory, geometryDecoderFactory } from "./helpers";
import MaplibreGlDirections from "./main";

/**
 * Takes a missing or an incomplete options object from the user and augments it with the default values.
 *
 * @param {Partial<MaplibreGlDirectionsOptions>=} customOptions
 * @returns {MaplibreGlDirectionsOptions}
 */
export function buildOptions(
  customOptions: Partial<MaplibreGlDirectionsOptions> = { request: {} },
): MaplibreGlDirectionsOptions {
  customOptions.request = Object.assign({}, DefaultMaplibreGlDirectionsOptions.request, customOptions.request);
  const layers = layersFactory(
    customOptions.pointsScalingFactor ?? DefaultMaplibreGlDirectionsOptions.pointsScalingFactor,
    customOptions.linesScalingFactor ?? DefaultMaplibreGlDirectionsOptions.linesScalingFactor,
  );
  return Object.assign({}, DefaultMaplibreGlDirectionsOptions, { layers }, customOptions);
}

/**
 * Creates a context-aware function that takes the waypoints' coordinates and produces a FormData instance...
 *
 * @param {MaplibreGlDirectionsOptions["request"]} requestOptions
 * @returns {(waypointsCoordinates: [number, number][]) => URLSearchParams}
 */
export function buildPostRequestPayloadFactory(requestOptions: MaplibreGlDirectionsOptions["request"]) {
  console.log("FACTORY CALL");
  const newRequestPayload = Object.entries(requestOptions).reduce((acc, [key, value]) => {
    if (!(key in DefaultMaplibreGlDirectionsOptions.request)) {
      acc = acc.concat(`${key}=${value}`);
    }

    return acc;
  }, [] as string[]);

  function buildPostRequestPayload(waypointsCoordinates: [number, number][]): FormData {
    newRequestPayload.push(`coordinates=${waypointsCoordinates.map((waypoint) => waypoint.join(",")).join(";")}`);

    const formData = new FormData();

    newRequestPayload.forEach((keyValuePair) => {
      const [key, value] = keyValuePair.split("=");

      if (key !== "access_token") {
        formData.set(key, value);
      }
    });

    return formData;
  }

  return buildPostRequestPayload;
}

/**
 * Creates a context-aware function that takes the waypoints' coordinates and produces an array of "="-concatenated
 * key-value string pairs of these request options.
 *
 * @param {MaplibreGlDirectionsOptions["request"]} requestOptions
 * @returns {(waypointsCoordinates: [number, number][]) => string[]}
 */
export function buildGetRequestPayloadFactory(requestOptions: MaplibreGlDirectionsOptions["request"]) {
  const newRequestPayload = Object.entries(requestOptions).reduce((acc, [key, value]) => {
    if (!(key in DefaultMaplibreGlDirectionsOptions.request)) {
      acc = acc.concat(`${key}=${value}`);
    }

    return acc;
  }, [] as string[]);

  function buildGetRequestPayload(waypointsCoordinates: [number, number][]): string[] {
    newRequestPayload.push(`coordinates=${waypointsCoordinates.map((waypoint) => waypoint.join(",")).join(";")}`);
    return newRequestPayload;
  }

  return buildGetRequestPayload;
}

/**
 * Creates a context-aware function that creates a GeoJSON Point Feature of one of the known types.
 *
 * @param {MaplibreGlDirectionsOptions["request"]} requestOptions
 * @returns {(coordinate: [number, number], type: PointType) => Feature<Point, {type: PointType, id: string}>}
 */
export function buildPointFactory(requestOptions: MaplibreGlDirectionsOptions["request"]) {
  const coordinateRounder = coordinateRounderFactory(requestOptions);

  function buildPoint<T extends Record<string, unknown>>(
    coordinate: [number, number],
    type: PointType,
    properties?: T,
  ): Feature<Point, { type: PointType; id: string } & T> {
    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: coordinateRounder(coordinate),
      },
      properties: {
        type,
        id: nanoid(),
        ...(properties ?? {}),
      } as { type: PointType; id: string } & T,
    };
  }

  return buildPoint;
}

/**
 * Creates a context-aware function that create a GeoJSON LineString Features array where each feature represents a line
 * connecting a waypoint with its respective snappoint and a hoverpoint with its respective snappoints.
 *
 * @param {MaplibreGlDirectionsOptions["request"]} _requestOptions
 * @returns {(waypointsCoordinates: [number, number][], snappointsCoordinates: [number, number][], hoverpointCoordinates: ([number, number] | undefined), departSnappointIndex: number, showHoverpointSnaplines?: boolean) => Feature<LineString>[]}
 */
export function buildSnaplinesFactory(_requestOptions: MaplibreGlDirectionsOptions["request"]) {
  // the function is wrapped in a factory for the sakes of consistency

  function buildSnaplines(
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

  return buildSnaplines;
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
export function buildRoutelinesFactory(requestOptions: MaplibreGlDirectionsOptions["request"]) {
  const geometryDecoder = geometryDecoderFactory(requestOptions);
  const congestionLevelDecoder = congestionLevelDecoderFactory(requestOptions);

  function buildRoutelines(
    routes: Route[],
    selectedRouteIndex: number,
    snappointsCoordinates: [number, number][],
  ): Feature<LineString>[][] {
    // do the following stuff for each route (there are multiple when `alternatives=true` request option is set
    return routes.map((route, routeIndex) => {
      // a list of coordinates pairs (longitude-latitude) the route goes by
      const coordinates = geometryDecoder(route.geometry);

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
          const segmentCongestion = congestionLevelDecoder(route.legs[legIndex]?.annotation, i);

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

  return buildRoutelines;
}
