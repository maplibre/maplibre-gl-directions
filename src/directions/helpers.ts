import type { GeoJSONGeometry, Geometry, Leg, MaplibreGlDirectionsOptions, PolylineGeometry } from "./types";
import { decode } from "@mapbox/polyline";

/**
 * Creates a helper function that decodes the geometry of a route to the form of a precision-aware-coordinates array.
 *
 * @param {MaplibreGlDirectionsOptions["request"]} requestOptions
 * @returns {(geometry: Geometry) => [number, number][]}
 */
export function geometryDecoderFactory(requestOptions: MaplibreGlDirectionsOptions["request"]) {
  let geometryDecoder: (geometry: Geometry) => [number, number][];

  if (requestOptions.geometries === "geojson") {
    // const coordinateRounder = coordinateRounderFactory(requestOptions);

    geometryDecoder = function geometryDecoder(geometry) {
      return (geometry as GeoJSONGeometry).coordinates;
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

/**
 * Creates a helper function that compares two coordinates and returns `true` if they are equal taking into account that
 * when using "polyline" geometries (5 digits after the comma precision) there's an allowable error in 0.00001 degree.
 *
 * @param {MaplibreGlDirectionsOptions["request"]} requestOptions
 * @return {(a: [number, number], b: [number, number]) => boolean}
 */
export function coordinatesComparatorFactory(requestOptions: MaplibreGlDirectionsOptions["request"]) {
  let coordinatesComparator: (a: [number, number], b: [number, number]) => boolean;

  if (!requestOptions.geometries || requestOptions.geometries === "polyline") {
    coordinatesComparator = function coordinatesComparator(a: [number, number], b: [number, number]): boolean {
      return Math.abs(a[0] - b[0]) <= 0.00001 && Math.abs(a[1] - b[1]) <= 0.00001;
    };
  } else {
    coordinatesComparator = function coordinatesComparator(a: [number, number], b: [number, number]): boolean {
      return a[0] === b[0] && a[1] === b[1];
    };
  }

  return coordinatesComparator;
}
