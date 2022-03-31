import type { GeoJSONGeometry, Geometry, Leg, MaplibreGlDirectionsOptions, PolylineGeometry } from "./types";
import { decode } from "@mapbox/polyline";

/**
 * Creates a helper function that rounds each constituent of a longitude-latitude tuple to a specific amount of
 * fractional digits.
 *
 * The amount of fractional digits is determined by the `requestOptions`. It's 5 for "polyline" geometries and 6 for
 * "polyline6" and "geojson" geometries.
 *
 * @param {MaplibreGlDirectionsOptions["request"]} requestOptions
 * @returns {(coordinate: [number, number]) => [number, number]}
 * @constructor
 */
export function coordinateRounderFactory(requestOptions: MaplibreGlDirectionsOptions["request"]) {
  const n = !requestOptions.geometries || requestOptions.geometries === "polyline" ? 5 : 6;

  function coordinateRounder(coordinate: [number, number]): [number, number] {
    // From the TypeScript's perspective it's a bad idea to sum a number with a string, but that's necessary to perform
    // the following hack, so disable the TS-check here.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return [+(Math.round(coordinate[0] + `e+${n}`) + `e-${n}`), +(Math.round(coordinate[1] + `e+${n}`) + `e-${n}`)];
  }

  return coordinateRounder;
}

/**
 * Creates a helper function that decodes the geometry of a route to the form of a precision-aware-coordinates array.
 *
 * @param {MaplibreGlDirectionsOptions["request"]} requestOptions
 * @returns {(geometry: Geometry) => [number, number][]}
 */
export function geometryDecoderFactory(requestOptions: MaplibreGlDirectionsOptions["request"]) {
  let geometryDecoder: (geometry: Geometry) => [number, number][];

  if (requestOptions.geometries === "geojson") {
    const coordinateRounder = coordinateRounderFactory(requestOptions);

    geometryDecoder = function geometryDecoder(geometry) {
      return (geometry as GeoJSONGeometry).coordinates.map((coordinate) => coordinateRounder(coordinate));
    };
  } else if (requestOptions.geometries === "polyline6") {
    geometryDecoder = function geometryDecoder(geometry) {
      return decode(geometry as PolylineGeometry, 6).map((coordinate) => coordinate.reverse() as [number, number]);
    };
  } else {
    geometryDecoder = function geometryDecoder(geometry) {
      return decode(geometry as PolylineGeometry, 5).map((coordinate) => coordinate.reverse() as [number, number]);
    };
  }

  return geometryDecoder;
}

/**
 * Creates a helper function that decodes the congestion level of a specific segment of a route leg.
 *
 * @param {MaplibreGlDirectionsOptions["request"]} requestOptions
 * @returns {(annotation: ({congestion?: ("unknown" | "low" | "moderate" | "heavy" | "severe")[], congestion_numeric?: (number | null)[]} | undefined), segmentIndex: number) => number}
 */
export function congestionLevelDecoderFactory(requestOptions: MaplibreGlDirectionsOptions["request"]) {
  let congestionLevelDecoder: (annotation: Leg["annotation"] | undefined, segmentIndex: number) => number;

  if (
    typeof requestOptions.annotations === "string" &&
    (requestOptions.annotations as string).includes("congestion_numeric")
  ) {
    congestionLevelDecoder = function congestionLevelDecoder(annotation, segmentIndex) {
      return annotation?.congestion_numeric?.[segmentIndex] ?? 0;
    };
  } else if (
    typeof requestOptions.annotations === "string" &&
    (requestOptions.annotations as string).includes("congestion")
  ) {
    congestionLevelDecoder = function congestionLevelDecoder(annotation, segmentIndex) {
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
    };
  } else {
    congestionLevelDecoder = function congestionLevelDecoder() {
      return 0;
    };
  }

  return congestionLevelDecoder;
}
