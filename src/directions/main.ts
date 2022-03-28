import maplibregl from "maplibre-gl";
import axios from "axios";
import { buildPoint, buildRoutelines, buildSnaplines } from "./utils";
import layers from "./layers";
import { Feature, FeatureCollection, LineString, Point } from "geojson";
import { Directions, MaplibreGlDirectionsOptions } from "./types";

const defaultOptions: MaplibreGlDirectionsOptions = {
  layers,
  sensitiveWaypointLayers: ["directions-waypoint", "directions-waypoint-casing"],
  sensitiveSnappointLayers: ["directions-snappoint", "directions-snappoint-casing"],
  sensitiveRoutelineLayers: ["directions-routeline", "directions-routeline-casing"],
  sensitiveAltRoutelineLayers: ["directions-alt-routeline", "directions-alt-routeline-casing"],
  dragThreshold: 10,
};

export default class MaplibreGlDirections {
  constructor(map: maplibregl.Map, options: Partial<MaplibreGlDirectionsOptions> = {}) {
    this.map = map;
    this.options = Object.assign({}, defaultOptions, options);

    /**
     * Bind the event listeners to `this` since e.g. `map.off("type", onMove)` won't work if it was registered
     * as `map.on("type", onMove.bind(this))`. `onMove !== onMove.bind(this)`, but
     * `onMoveHandler === onMoveHandler`!
     */
    this.onMoveHandler = this.onMove.bind(this);
    this.onDragDownHandler = this.onDragDown.bind(this);
    this.onDragMoveHandler = this.onDragMove.bind(this);
    this.onDragUpHandler = this.onDragUp.bind(this);
    this.onClickHandler = this.onClick.bind(this);

    this.init();
  }

  private readonly map: maplibregl.Map;
  private readonly options: MaplibreGlDirectionsOptions;
  private _interactive = false;
  private readonly onMoveHandler: (e: maplibregl.MapMouseEvent) => void;
  private readonly onDragDownHandler: (e: maplibregl.MapMouseEvent) => void;
  private readonly onDragMoveHandler: (e: maplibregl.MapMouseEvent) => void;
  private readonly onDragUpHandler: (e: maplibregl.MapMouseEvent) => void;
  private readonly onClickHandler: (e: maplibregl.MapMouseEvent) => void;

  private waypoints: Feature<Point>[] = [];
  private snappoints: Feature<Point>[] = [];
  private routelines: Feature<LineString>[][] = [];
  private selectedRouteIndex = 0;
  private hoverpoint: Feature<Point> | undefined = undefined;

  private get waypointsCoordinates(): [number, number][] {
    return this.waypoints.map((waypoint) => {
      return [waypoint.geometry.coordinates[0], waypoint.geometry.coordinates[1]];
    });
  }

  private get snappointsCoordinates(): [number, number][] {
    return this.snappoints.map((snappoint) => {
      return [snappoint.geometry.coordinates[0], snappoint.geometry.coordinates[1]];
    });
  }

  private get snaplines(): Feature<LineString>[] {
    return buildSnaplines(
      this.waypointsCoordinates,
      this.snappointsCoordinates,
      this.hoverpoint?.geometry.coordinates as [number, number] | undefined,
      this.departSnappointIndex,
    );
  }

  private init() {
    const directionsSource: maplibregl.GeoJSONSourceSpecification = {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      } as FeatureCollection,
    };

    if (!this.map.getSource("directions")) {
      this.map.addSource("directions", directionsSource);
    } else {
      throw new Error(`The source "directions" already exists`);
    }

    this.options.layers.forEach((layer) => {
      if (!this.map.getLayer(layer.id)) {
        this.map.addLayer(layer);
      } else {
        throw new Error(`The layer "${layer.id}" already exists`);
      }
    });
  }

  private async fetchDirections() {
    this.interactive = false;

    const options = [
      "access_token=pk.eyJ1IjoiZXhhbXBsZXMiLCJhIjoiY2p0MG01MXRqMW45cjQzb2R6b2ptc3J4MSJ9.zA2W0IkI0c6KaAhJfk9bWg",
      "overview=full",
      "geometries=polyline6",
      "steps=true",
      "alternatives=true",
    ];

    if (this.waypoints.length >= 2) {
      const { routes, waypoints: snappoints } = (
        await axios.get<Directions>(
          `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${this.waypointsCoordinates
            .map((waypoint) => waypoint.join(","))
            .join(";")}?${options.join("&")}`,
        )
      ).data;

      this.snappoints = snappoints.map((snappoint) => {
        return buildPoint(snappoint.location, "SNAPPOINT");
      });

      this.routelines = buildRoutelines(routes, this.selectedRouteIndex);
      if (routes.length <= this.selectedRouteIndex) this.selectedRouteIndex = 0;
    } else {
      this.snappoints = [];
      this.routelines = [];
    }

    // the selected route index might have changed
    this.draw(false);

    this.interactive = true;
  }

  private draw(skipSelectedRouteRedraw = true) {
    const features = [
      ...this.waypoints,
      ...this.snappoints,
      ...this.snaplines,
      ...this.routelines.reduce((acc, routeLegs) => {
        /**
         * `map` inside `reduce` is a pretty expensive operation, so by default it's disabled. If the `draw` method is
         * called from a place where the selected route index might potentially have changed (e.g. `onClick`), the
         * respective parameter is set to `false` and the currently selected route will be redrawn.
         */

        if (!skipSelectedRouteRedraw) {
          return acc.concat(
            ...routeLegs.map((routeLeg) => {
              if (routeLeg.properties) {
                routeLeg.properties.route =
                  routeLeg.properties.routeIndex === this.selectedRouteIndex ? "SELECTED" : "ALT";
              }

              return routeLeg;
            }),
          );
        }

        return acc.concat(...routeLegs);
      }, [] as Feature<LineString>[]),
    ];

    if (this.hoverpoint) features.push(this.hoverpoint);

    const geoJson: FeatureCollection = {
      type: "FeatureCollection",
      features,
    };

    if (this.map.style && this.map.getSource("directions")) {
      (this.map.getSource("directions") as maplibregl.GeoJSONSource).setData(geoJson);
    }
  }

  private highlightedWaypoint: Feature<Point> | undefined;
  private highlightedSnappoint: Feature<Point> | undefined;

  private onMove(e: maplibregl.MapMouseEvent) {
    const feature: (Feature & { layer: { id: string } }) | undefined = this.map.queryRenderedFeatures(e.point, {
      layers: [
        ...this.options.sensitiveWaypointLayers,
        ...this.options.sensitiveSnappointLayers,
        ...this.options.sensitiveRoutelineLayers,
        ...this.options.sensitiveAltRoutelineLayers,
      ],
    })[0];

    /**
     * De-highlight everything first in order to be able to highlight only the necessary stuff.
     */

    if (this.highlightedWaypoint?.properties) {
      this.highlightedWaypoint.properties.highlight = false;
      this.highlightedWaypoint = undefined;
    }

    if (this.highlightedSnappoint?.properties) {
      this.highlightedSnappoint.properties.highlight = false;
      this.highlightedSnappoint = undefined;
    }

    this.routelines.forEach((routeline) => {
      routeline.forEach((leg) => {
        if (leg.properties) {
          leg.properties.highlight = false;
        }
      });
    });

    if (this.options.sensitiveWaypointLayers.includes(feature?.layer.id ?? "")) {
      /**
       *  If the cursor moves over a waypoint then change its shape to "pointer", disable the map's standard drag-pan
       *  functionality (the user should be able to drag the waypoint itself, not the map), set the waypoint's
       *  "highlight" property to `true`. Set its respective snappoint's "highlight" property to `true` as well. Save
       *  the highlighted features outside to be able to de-highlight them the next time the `onMove` is called. Remove
       *  the existing hoverpoint.
       */

      this.map.getCanvas().style.cursor = "pointer";
      this.map.dragPan.disable();

      const highlightedWaypointIndex = this.waypoints.findIndex((waypoint) => {
        return waypoint.properties?.id === feature?.properties?.id;
      });

      this.highlightedWaypoint = this.waypoints[highlightedWaypointIndex];
      this.highlightedSnappoint = this.snappoints[highlightedWaypointIndex];

      if (this.highlightedWaypoint?.properties) {
        this.highlightedWaypoint.properties.highlight = true;
      }

      if (this.highlightedSnappoint?.properties) {
        this.highlightedSnappoint.properties.highlight = true;
      }

      if (this.hoverpoint) this.hoverpoint = undefined;
    } else if (this.options.sensitiveSnappointLayers.includes(feature?.layer.id ?? "")) {
      /**
       *  If the cursor moves over a snappoint then change its shape to "pointer" and set the snappoint's "highlight"
       *  property to `true`. Set its respective waypoint's "highlight" property to `true` as well. Save the highlighted
       *  features outside to be able to de-highlight them the next time the `onMove` is called. Remove the existing
       *  hoverpoint.
       */

      this.map.getCanvas().style.cursor = "pointer";

      const highlightedSnappointIndex = this.snappoints.findIndex((snappoint) => {
        return snappoint.properties?.id === feature?.properties?.id;
      });

      this.highlightedSnappoint = this.snappoints[highlightedSnappointIndex];
      this.highlightedWaypoint = this.waypoints[highlightedSnappointIndex];

      if (this.highlightedSnappoint?.properties) {
        this.highlightedSnappoint.properties.highlight = true;
      }

      if (this.highlightedWaypoint?.properties) {
        this.highlightedWaypoint.properties.highlight = true;
      }

      if (this.hoverpoint) this.hoverpoint = undefined;
    } else if (this.options.sensitiveRoutelineLayers.includes(feature?.layer.id ?? "")) {
      /**
       * If the cursor moves over the selected route line then change its shape to "pointer",  disable the map's
       * standard drag-pan functionality (the user should be able to drag the routeline itself, not the map), add a
       * hoverpoint (or change its position accordingly), and set the routeline's "highlight" property to `true`.
       */

      this.map.getCanvas().style.cursor = "pointer";
      this.map.dragPan.disable();

      if (this.hoverpoint) {
        this.hoverpoint.geometry.coordinates = [e.lngLat.lng, e.lngLat.lat];
      } else {
        this.hoverpoint = buildPoint([e.lngLat.lng, e.lngLat.lat], "HOVERPOINT");
      }

      this.routelines.forEach((routeline) => {
        routeline.forEach((leg) => {
          if (leg.properties && leg.properties?.id === feature?.properties?.id) {
            leg.properties.highlight = true;
          }
        });
      });
    } else if (this.options.sensitiveAltRoutelineLayers.includes(feature?.layer.id ?? "")) {
      /**
       * If the cursor moves over an alternative route line then change its shape to "pointer" and set the routeline's
       * "highlight" property to `true`.
       */

      this.map.getCanvas().style.cursor = "pointer";

      this.routelines.forEach((routeline) => {
        routeline.forEach((segment) => {
          if (segment.properties && segment.properties?.id === feature?.properties?.id) {
            segment.properties.highlight = true;
          }
        });
      });
    } else {
      /**
       * If the cursor moves somewhere else then re-enable the drag-pan functionality, restore the cursor original shape
       * and remove the hoverpoint.
       */

      this.map.dragPan.enable();
      this.map.getCanvas().style.cursor = "";

      this.hoverpoint = undefined;
    }

    this.draw();
  }

  private dragDownPosition: { x: number; y: number } = { x: 0, y: 0 };
  private waypointBeingDragged?: Feature<Point>;
  private waypointBeingDraggedInitialCoordinates?: [number, number];
  private departSnappointIndex?: number;
  private departSnappoint?: Feature<Point>;
  private arriveSnappoint?: Feature<Point>;

  private onDragDown(e: maplibregl.MapMouseEvent) {
    const feature: (Feature & { layer: { id: string } }) | undefined = this.map.queryRenderedFeatures(e.point, {
      layers: [...this.options.sensitiveWaypointLayers, ...this.options.sensitiveRoutelineLayers],
    })[0];

    /**
     * Save the cursor's position to be able to check later whether the dragged feature moved at all.
     */
    this.dragDownPosition = e.point;

    if (this.options.sensitiveWaypointLayers.includes(feature?.layer.id ?? "")) {
      /**
       * When a waypoint is being dragged, save it and its current coordinates outside.
       */

      this.waypointBeingDragged = this.waypoints.find((waypoint) => {
        return waypoint.properties?.id === feature?.properties?.id;
      });

      this.waypointBeingDraggedInitialCoordinates = this.waypointBeingDragged?.geometry.coordinates as
        | [number, number]
        | undefined;
    } else if (this.options.sensitiveRoutelineLayers.includes(feature?.layer.id ?? "")) {
      /**
       * When a routeline (a leg in particular) is being dragged, find its respective depart and arrive snappoints and
       * the depart-point's index and save them outside.
       */
      this.departSnappointIndex = this.snappointsCoordinates.findIndex((snappoint) => {
        const { lng: departLng, lat: departLat } = JSON.parse(feature?.properties?.depart);
        return snappoint[0] === departLng && snappoint[1] === departLat;
      });

      this.departSnappoint = this.snappoints[this.departSnappointIndex];

      const arriveSnappointIndex = this.snappointsCoordinates.findIndex((snappoint) => {
        const { lng: arriveLng, lat: arriveLat } = JSON.parse(feature?.properties?.arrive);
        return snappoint[0] === arriveLng && snappoint[1] === arriveLat;
      });

      this.arriveSnappoint = this.snappoints[arriveSnappointIndex];

      /**
       * Highlight the respective leg's depart and arrive snappoints.
       */
      if (this.departSnappoint.properties && this.arriveSnappoint.properties) {
        this.departSnappoint.properties.highlight = true;
        this.arriveSnappoint.properties.highlight = true;
      }
    }

    /**
     * Disable the global `onMove` handlers for them not to interfere with the new ones which are added further down.
     */
    this.map.off("touchstart", this.onMoveHandler);
    this.map.off("mousemove", this.onMoveHandler);

    /**
     * Add specific drag-only listeners.
     */
    this.map.on("mousemove", this.onDragMoveHandler);
    this.map.on("mouseup", this.onDragUpHandler);
    this.map.on("touchmove", this.onDragMoveHandler);
    this.map.on("touchend", this.onDragUpHandler);

    this.draw();
  }

  private onDragMove(e: maplibregl.MapMouseEvent) {
    if (this.waypointBeingDragged) {
      /**
       * If it's a waypoint that's being dragged then update accordingly its coordinates.
       */

      this.waypointBeingDragged.geometry.coordinates = [e.lngLat.lng, e.lngLat.lat];
    } else if (this.hoverpoint) {
      /**
       * When dragging a route line, redraw the hoverpoint at the new coordinates.
       */

      this.hoverpoint.geometry.coordinates = [e.lngLat.lng, e.lngLat.lat];
    } else {
      this.hoverpoint = buildPoint([e.lngLat.lng, e.lngLat.lat], "HOVERPOINT");
    }

    this.draw();
  }

  private onDragUp(e: maplibregl.MapMouseEvent) {
    /**
     * Only add a new waypoint if the mouse has been dragged for more than the specified threshold. If the specified
     * threshold's value is less than zero then treat is at if it was zero.
     */
    if (
      Math.abs(e.point.x - this.dragDownPosition?.x) >
        (this.options.dragThreshold >= 0 ? this.options.dragThreshold : 0) ||
      Math.abs(e.point.y - this.dragDownPosition?.y) >
        (this.options.dragThreshold >= 0 ? this.options.dragThreshold : 0)
    ) {
      if (this.waypointBeingDragged) {
        /**
         * If a waypoint has been dragged, update its position accordingly and re-fetch the directions.
         */

        this.waypointBeingDragged.geometry.coordinates = [e.lngLat.lng, e.lngLat.lat];

        this.waypointBeingDragged = undefined;
        this.waypointBeingDraggedInitialCoordinates = undefined;

        this.fetchDirections();
      } else if (this.hoverpoint) {
        /**
         * If the selected route line has been dragged then add a waypoint at the previously saved index.
         */
        this.addWaypoint(
          [e.lngLat.lng, e.lngLat.lat],
          this.departSnappointIndex !== undefined ? this.departSnappointIndex + 1 : undefined,
        );

        /**
         * De-highlight the previously-highlighted related snappoints.
         */
        if (this.departSnappoint?.properties && this.arriveSnappoint?.properties) {
          this.departSnappoint.properties.highlight = false;
          this.departSnappoint = undefined;

          this.arriveSnappoint.properties.highlight = false;
          this.arriveSnappoint = undefined;
        }

        /**
         * Remove the hoverpoint and nullify the departSnappoint's index
         */
        this.hoverpoint = undefined;
        this.departSnappointIndex = undefined;
      }
    } else {
      /**
       * If the waypoint has been dragged not far enough, restore its initial location.
       */

      if (this.waypointBeingDragged && this.waypointBeingDraggedInitialCoordinates) {
        this.waypointBeingDragged.geometry.coordinates = this.waypointBeingDraggedInitialCoordinates;

        this.waypointBeingDragged = undefined;
        this.waypointBeingDraggedInitialCoordinates = undefined;
      }
    }

    /**
     * Remove the specifically assigned for the drag-related events listeners.
     */
    this.map.off("mousemove", this.onDragMoveHandler);
    this.map.off("mouseup", this.onDragUpHandler);
    this.map.off("touchmove", this.onDragMoveHandler);
    this.map.off("touchend", this.onDragUpHandler);

    /**
     * Restore the removed global `onMove` listeners.
     */
    this.map.on("touchstart", this.onMoveHandler);
    this.map.on("mousemove", this.onMoveHandler);

    this.draw();
  }

  private onClick(e: maplibregl.MapMouseEvent) {
    const feature: (Feature<Point> & { layer: { id: string } }) | undefined = this.map.queryRenderedFeatures(e.point, {
      layers: [
        ...this.options.sensitiveWaypointLayers,
        ...this.options.sensitiveSnappointLayers,
        ...this.options.sensitiveAltRoutelineLayers,
        ...this.options.sensitiveRoutelineLayers,
      ],
    })[0];

    if (this.options.sensitiveWaypointLayers.includes(feature?.layer.id ?? "")) {
      /**
       * If a waypoint is clicked, remove it.
       */

      const respectiveWaypointIndex = this.waypoints.findIndex((waypoint) => {
        return waypoint.properties?.id === feature?.properties?.id;
      });

      if (~respectiveWaypointIndex) {
        this.removeWaypoint(respectiveWaypointIndex);
      }
    } else if (this.options.sensitiveSnappointLayers.includes(feature?.layer.id ?? "")) {
      /**
       * If a snappoint is clicked, find its respective waypoint and remove it.
       */

      const respectiveWaypointIndex = this.snappoints.findIndex((snappoint) => {
        return snappoint.properties?.id === feature?.properties?.id;
      });

      if (~respectiveWaypointIndex) {
        this.removeWaypoint(respectiveWaypointIndex);
      }
    } else if (this.options.sensitiveAltRoutelineLayers.includes(feature?.layer.id ?? "")) {
      /**
       * If an alternative route line is clicked, set its index as the selected route's one.
       */

      this.selectedRouteIndex = this.routelines.findIndex((routeline) => {
        return !!routeline.find((segment) => {
          return segment.properties?.id === feature?.properties?.id;
        });
      });
    } else if (!this.options.sensitiveRoutelineLayers.includes(feature?.layer.id ?? "")) {
      /**
       * If a route line is clicked, don't add a new waypoint. Else do.
       */

      this.addWaypoint([e.lngLat.lng, e.lngLat.lat]);
    }

    // the selected route might have changed, so it's important not to skip its redraw
    this.draw(false);
  }

  get interactive() {
    return this._interactive;
  }

  set interactive(interactive) {
    this._interactive = interactive;

    if (interactive) {
      this.map.on("mousemove", this.onMoveHandler);
      this.map.on("mousedown", this.onDragDownHandler);
      this.map.on("click", this.onClickHandler);
      this.map.on("touchstart", this.onMoveHandler);
      this.map.on("touchstart", this.onDragDownHandler);
    } else {
      this.map.off("mousemove", this.onMoveHandler);
      this.map.off("mousedown", this.onDragDownHandler);
      this.map.off("click", this.onClickHandler);
      this.map.off("touchstart", this.onMoveHandler);
      this.map.off("touchstart", this.onDragDownHandler);
    }
  }

  async setWaypoints(waypoints: [number, number][]) {
    this.waypoints = waypoints.map((waypoint) => {
      return buildPoint(waypoint, "WAYPOINT");
    });

    this.draw();
    await this.fetchDirections();
  }

  async addWaypoint(waypoint: [number, number], index?: number) {
    index = index ?? this.waypoints.length;
    this.waypoints.splice(index, 0, buildPoint(waypoint, "WAYPOINT"));

    this.draw();
    await this.fetchDirections();
  }

  async removeWaypoint(index: number) {
    this.waypoints.splice(index, 1);
    this.snappoints.splice(index, 1);

    this.draw();
    await this.fetchDirections();
  }
}
