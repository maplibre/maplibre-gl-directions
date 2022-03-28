import { Feature, LineString, Point } from "geojson";
import { Route } from "./types";
import { decode } from "@mapbox/polyline";
import { nanoid } from "nanoid";

type PointType = "WAYPOINT" | "SNAPPOINT" | "HOVERPOINT";

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

export function buildSnaplines(
  waypoints: [number, number][],
  snappoints: [number, number][],
  hoverpoint?: [number, number],
  departSnappointIndex?: number,
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

  if (hoverpoint !== undefined && departSnappointIndex !== undefined) {
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

export function buildRoutelines(routes: Route[], selectedRouteIndex: number) {
  return routes.map((route, routeIndex) => {
    const routeId = nanoid();

    const legs = route.legs.map((leg) => {
      let depart: [number, number] = [NaN, NaN];
      let arrive: [number, number] = [NaN, NaN];
      let coords: [number, number][] = [];

      leg.steps.forEach((step) => {
        if (step.maneuver.type === "depart") depart = step.maneuver.location;
        if (step.maneuver.type === "arrive") arrive = step.maneuver.location;

        coords = coords.concat(decode(step.geometry, 6).map((latLng) => latLng.reverse() as [number, number]));
      });

      return { depart, arrive, coords };
    });

    return legs.map((leg) => {
      return {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: leg.coords,
        },
        properties: {
          id: routeId,
          routeIndex,
          route: routeIndex === selectedRouteIndex ? "SELECTED" : "ALT",
          depart: {
            lng: leg.depart[0],
            lat: leg.depart[1],
          },
          arrive: {
            lng: leg.arrive[0],
            lat: leg.arrive[1],
          },
        },
      } as Feature<LineString>;
    });
  });
}
