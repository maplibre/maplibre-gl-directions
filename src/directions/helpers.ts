import type { GeoJSONGeometry, Geometry, Leg, MapLibreGlDirectionsConfiguration, PolylineGeometry } from "./types";
import { decode } from "@placemarkio/polyline";

/**
 * Decodes the geometry of a route to the form of a coordinates array.
 */
export function geometryDecoder(
  requestOptions: MapLibreGlDirectionsConfiguration["requestOptions"],
  geometry: Geometry,
): [number, number][] {
  if (requestOptions.geometries === "geojson") {
    return (geometry as GeoJSONGeometry).coordinates;
  } else if (requestOptions.geometries === "polyline6") {
    return decode(geometry as PolylineGeometry, 6);
  } else {
    return decode(geometry as PolylineGeometry, 5);
  }
}

/**
 * Decodes the congestion level of a specific segment of a route leg.
 */
export function congestionLevelDecoder(
  requestOptions: MapLibreGlDirectionsConfiguration["requestOptions"],
  annotation: Leg["annotation"] | undefined,
  segmentIndex: number,
): number {
  if (requestOptions.annotations?.includes("congestion_numeric")) {
    return annotation?.congestion_numeric?.[segmentIndex] ?? 0;
  } else if (requestOptions.annotations?.includes("congestion")) {
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
 * Compares two coordinates and returns `true` if they are equal taking into account that there's an allowable error in
 * 0.00001 degree when using "polyline" geometries (5 fractional-digits precision).
 */
export function coordinatesComparator(
  requestOptions: MapLibreGlDirectionsConfiguration["requestOptions"],
  a: [number, number],
  b: [number, number],
): boolean {
  if (!requestOptions.geometries || requestOptions.geometries === "polyline") {
    return Math.abs(a[0] - b[0]) <= 0.00001 && Math.abs(a[1] - b[1]) <= 0.00001;
  } else {
    return a[0] === b[0] && a[1] === b[1];
  }
}
