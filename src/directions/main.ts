import type { Feature, FeatureCollection, LineString, Point } from "geojson";
import type maplibregl from "maplibre-gl";
import type { Directions, MaplibreGlDirectionsOptions, Route, Waypoint } from "./types";
import axios from "axios";
import {
  buildGetRequestPayloadFactory,
  buildOptions,
  buildPointFactory,
  buildPostRequestPayloadFactory,
  buildRoutelinesFactory,
  buildSnaplinesFactory,
} from "./utils";

/**
 * The main class responsible for the routing itself.
 */
export default class MaplibreGlDirections {
  /**
   * Creates an instance of the `MaplibreGlDirections` class.
   *
   * @param {maplibregl.Map} map
   * @param {Partial<MaplibreGlDirectionsOptions>} options
   */
  constructor(map: maplibregl.Map, options?: Partial<MaplibreGlDirectionsOptions>) {
    this.map = map;
    this.options = buildOptions(options);

    /*
     * Kind of meta-programming stuff. The factory functions below return custom context-aware functions specific for
     * the current `MaplibreGlDirections` instance. The function returned by the factory function depends on the request
     * options passed to the constructor and does one specific thing which allows to reduce the runtime-payload.
     */
    this.buildPostRequestPayload = buildPostRequestPayloadFactory(this.options.request);
    this.buildGetRequestPayload = buildGetRequestPayloadFactory(this.options.request);
    this.buildPoint = buildPointFactory(this.options.request);
    this.buildSnaplines = buildSnaplinesFactory(this.options.request);
    this.buildRoutelines = buildRoutelinesFactory(this.options.request);

    /*
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

  /*
   * Everything is `protected` to allow access from a subclass.
   */
  protected readonly map: maplibregl.Map;
  protected readonly options: MaplibreGlDirectionsOptions;
  protected _interactive = false;
  protected buildPostRequestPayload: ReturnType<typeof buildPostRequestPayloadFactory>;
  protected buildGetRequestPayload: ReturnType<typeof buildGetRequestPayloadFactory>;
  protected buildPoint: ReturnType<typeof buildPointFactory>;
  protected buildSnaplines: ReturnType<typeof buildSnaplinesFactory>;
  protected buildRoutelines: ReturnType<typeof buildRoutelinesFactory>;
  protected onMoveHandler: (e: maplibregl.MapMouseEvent) => void;
  protected onDragDownHandler: (e: maplibregl.MapMouseEvent) => void;
  protected onDragMoveHandler: (e: maplibregl.MapMouseEvent) => void;
  protected onDragUpHandler: (e: maplibregl.MapMouseEvent) => void;
  protected onClickHandler: (e: maplibregl.MapMouseEvent) => void;

  protected waypoints: Feature<Point>[] = [];
  protected snappoints: Feature<Point>[] = [];
  protected routelines: Feature<LineString>[][] = [];
  protected selectedRouteIndex = 0;
  protected hoverpoint: Feature<Point> | undefined = undefined;

  protected get waypointsCoordinates(): [number, number][] {
    return this.waypoints.map((waypoint) => {
      return [waypoint.geometry.coordinates[0], waypoint.geometry.coordinates[1]];
    });
  }

  protected get snappointsCoordinates(): [number, number][] {
    return this.snappoints.map((snappoint) => {
      return [snappoint.geometry.coordinates[0], snappoint.geometry.coordinates[1]];
    });
  }

  protected get snaplines(): Feature<LineString>[] {
    return this.buildSnaplines(
      this.waypointsCoordinates,
      this.snappointsCoordinates,
      this.hoverpoint?.geometry.coordinates as [number, number] | undefined,
      this.departSnappointIndex,
      this.hoverpoint?.properties?.showSnaplines,
    );
  }

  protected init() {
    this.map.addSource("maplibre-gl-directions", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
    });

    this.options.layers.forEach((layer) => {
      this.map.addLayer(layer);
    });
  }

  protected async fetchDirections() {
    this.interactive = false;

    if (this.waypoints.length >= 2) {
      let snappoints: Waypoint[];
      let routes: Route[];

      if (this.options.makePostRequest) {
        const requestPayload = this.buildPostRequestPayload(this.waypointsCoordinates);

        const response = (
          await axios.post<Directions>(
            `${this.options.request.api}/${this.options.request.profile}${
              this.options.request.access_token ? `?access_token=${this.options.request.access_token}` : ""
            }`,
            // the URLSearchParams constructor perfectly works with the FormData, so ignore the TypeScript's complaint
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            new URLSearchParams(requestPayload),
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
            },
          )
        ).data;

        snappoints = response.waypoints;
        routes = response.routes;
      } else {
        const requestPayload = this.buildGetRequestPayload(this.waypointsCoordinates);

        const response = (
          await axios.get<Directions>(`${this.options.request.api}/${this.options.request.profile}/?${requestPayload}`)
        ).data;

        snappoints = response.waypoints;
        routes = response.routes;
      }

      this.snappoints = snappoints.map((snappoint, i) =>
        this.buildPoint(snappoint.location, "SNAPPOINT", {
          waypointProperties: this.waypoints[i].properties ?? {},
        }),
      );

      this.routelines = this.buildRoutelines(routes, this.selectedRouteIndex, this.snappoints);
      if (routes.length <= this.selectedRouteIndex) this.selectedRouteIndex = 0;
    } else {
      this.snappoints = [];
      this.routelines = [];
    }

    // the selected route index might have changed
    this.draw(false);

    this.interactive = true;
  }

  protected draw(skipSelectedRouteRedraw = true) {
    const features = [
      ...this.waypoints,
      ...this.snappoints,
      ...this.snaplines,
      ...this.routelines.reduce((acc, routeLegs) => {
        /*
         * `.map` inside `.reduce` is a pretty expensive operation, so by default it's disabled. If the `draw` method is
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

    if (this.map.getSource("maplibre-gl-directions")) {
      (this.map.getSource("maplibre-gl-directions") as maplibregl.GeoJSONSource).setData(geoJson);
    }
  }

  protected highlightedWaypoints: Feature<Point>[] = [];
  protected highlightedSnappoints: Feature<Point>[] = [];

  protected deHighlight() {
    this.highlightedWaypoints.forEach((waypoint) => {
      if (waypoint?.properties) {
        waypoint.properties.highlight = false;
      }
    });

    this.highlightedSnappoints.forEach((snappoint) => {
      if (snappoint?.properties) {
        snappoint.properties.highlight = false;
      }
    });

    this.routelines.forEach((routeline) => {
      routeline.forEach((leg) => {
        if (leg.properties) {
          leg.properties.highlight = false;
        }
      });
    });
  }

  protected onMove(e: maplibregl.MapMouseEvent) {
    const feature: (Feature & { layer: { id: string } }) | undefined = this.map.queryRenderedFeatures(e.point, {
      layers: [
        ...this.options.sensitiveWaypointLayers,
        ...this.options.sensitiveSnappointLayers,
        ...this.options.sensitiveRoutelineLayers,
        ...this.options.sensitiveAltRoutelineLayers,
      ],
    })[0];

    /*
     * De-highlight everything first in order to be able to highlight only the necessary features.
     */
    this.deHighlight();

    if (this.options.sensitiveWaypointLayers.includes(feature?.layer.id ?? "")) {
      /*
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

      this.highlightedWaypoints = [this.waypoints[highlightedWaypointIndex]];
      this.highlightedSnappoints = [this.snappoints[highlightedWaypointIndex]];

      if (this.highlightedWaypoints[0]?.properties) {
        this.highlightedWaypoints[0].properties.highlight = true;
      }

      if (this.highlightedSnappoints[0]?.properties) {
        this.highlightedSnappoints[0].properties.highlight = true;
      }

      if (this.hoverpoint) this.hoverpoint = undefined;
    } else if (this.options.sensitiveSnappointLayers.includes(feature?.layer.id ?? "")) {
      /*
       *  If the cursor moves over a snappoint then change its shape to "pointer" and set the snappoint's "highlight"
       *  property to `true`. Set its respective waypoint's "highlight" property to `true` as well. Save the highlighted
       *  features outside to be able to de-highlight them the next time the `onMove` is called. Remove the existing
       *  hoverpoint.
       */

      this.map.getCanvas().style.cursor = "pointer";

      const highlightedSnappointIndex = this.snappoints.findIndex((snappoint) => {
        return snappoint.properties?.id === feature?.properties?.id;
      });

      this.highlightedSnappoints = [this.snappoints[highlightedSnappointIndex]];
      this.highlightedWaypoints = [this.waypoints[highlightedSnappointIndex]];

      if (this.highlightedSnappoints[0].properties) {
        this.highlightedSnappoints[0].properties.highlight = true;
      }

      if (this.highlightedWaypoints[0].properties) {
        this.highlightedWaypoints[0].properties.highlight = true;
      }

      if (this.hoverpoint) this.hoverpoint = undefined;
    } else if (this.options.sensitiveRoutelineLayers.includes(feature?.layer.id ?? "")) {
      /*
       * If the cursor moves over the selected route line then change its shape to "pointer",  disable the map's
       * standard drag-pan functionality (the user should be able to drag the routeline itself, not the map), add a
       * hoverpoint (or change its position accordingly), and set the routeline's "highlight" property to `true`.
       */

      this.map.getCanvas().style.cursor = "pointer";
      this.map.dragPan.disable();

      if (this.hoverpoint) {
        this.hoverpoint.geometry.coordinates = [e.lngLat.lng, e.lngLat.lat];
      } else {
        this.hoverpoint = this.buildPoint([e.lngLat.lng, e.lngLat.lat], "HOVERPOINT", {
          departSnappointProperties: {
            ...JSON.parse(feature?.properties?.departSnappointProperties ?? "{}"),
          },
          arriveSnappointProperties: {
            ...JSON.parse(feature?.properties?.arriveSnappointProperties ?? "{}"),
          },
        });
      }

      this.routelines.forEach((routeline) => {
        routeline.forEach((leg) => {
          if (leg.properties && leg.properties?.id === feature?.properties?.id) {
            leg.properties.highlight = true;
          }
        });
      });
    } else if (this.options.sensitiveAltRoutelineLayers.includes(feature?.layer.id ?? "")) {
      /*
       * If the cursor moves over an alternative route line then change its shape to "pointer" and set the routeline's
       * "highlight" property to `true`.
       */

      this.map.getCanvas().style.cursor = "pointer";

      this.routelines.forEach((routeline) => {
        routeline.forEach((leg) => {
          if (leg.properties && leg.properties?.id === feature?.properties?.id) {
            leg.properties.highlight = true;
          }
        });
      });
    } else {
      /*
       * If the cursor moves somewhere else then re-enable the drag-pan functionality, restore the cursor original shape
       * and remove the hoverpoint.
       */

      this.map.dragPan.enable();
      this.map.getCanvas().style.cursor = "";

      this.hoverpoint = undefined;
    }

    this.draw();
  }

  protected dragDownPosition: { x: number; y: number } = { x: 0, y: 0 };
  protected waypointBeingDragged?: Feature<Point>;
  protected waypointBeingDraggedInitialCoordinates?: [number, number];
  protected departSnappointIndex = -1;

  protected onDragDown(e: maplibregl.MapMouseEvent | maplibregl.MapTouchEvent) {
    if (e.type === "touchstart" && e.originalEvent.touches.length !== 1) return;
    if (e.type === "mousedown" && e.originalEvent.which !== 1) return;

    const feature: (Feature & { layer: { id: string } }) | undefined = this.map.queryRenderedFeatures(e.point, {
      layers: [...this.options.sensitiveWaypointLayers, ...this.options.sensitiveRoutelineLayers],
    })[0];

    /*
     * Save the cursor's position to be able to check later whether the dragged feature moved at all.
     */
    this.dragDownPosition = e.point;

    if (this.options.sensitiveWaypointLayers.includes(feature?.layer.id ?? "")) {
      /*
       * When a waypoint is being dragged, save it and its current coordinates outside.
       */

      this.waypointBeingDragged = this.waypoints.find((waypoint) => {
        return waypoint.properties?.id === feature?.properties?.id;
      });

      this.waypointBeingDraggedInitialCoordinates = this.waypointBeingDragged?.geometry.coordinates as
        | [number, number]
        | undefined;
    } else if (this.options.sensitiveRoutelineLayers.includes(feature?.layer.id ?? "")) {
      /*
       * the "touchstart" event ("mousemove" equivalent) is not always fired before this `onDragDown` (which is also the
       * "touchstart"), therefore the hoverpoint might not exist yet. If it indeed does not, then create it and then
       * enable showing its snaplines.
       */

      if (this.hoverpoint) {
        this.hoverpoint.geometry.coordinates = [e.lngLat.lng, e.lngLat.lat];
      } else {
        this.hoverpoint = this.buildPoint([e.lngLat.lng, e.lngLat.lat], "HOVERPOINT", {
          departSnappointProperties: {
            ...JSON.parse(feature?.properties?.departSnappointProperties ?? "{}"),
          },
          arriveSnappointProperties: {
            ...JSON.parse(feature?.properties?.arriveSnappointProperties ?? "{}"),
          },
        });
      }

      if (this.hoverpoint.properties) {
        this.hoverpoint.properties.showSnaplines = true;
      }

      /*
       * When a routeline (a leg in particular) is being dragged, find its respective depart snappoint's index and save
       * it outside. Since a route is divided into legs by the snappoints, the leg's index is always equal to the
       * depart snappoint's index.
       */
      this.departSnappointIndex = JSON.parse(feature?.properties?.legIndex);

      /*
       * Highlight the respective leg's depart and arrive snappoints.
       */
      if (~this.departSnappointIndex && this.snappoints[this.departSnappointIndex]?.properties) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.snappoints[this.departSnappointIndex].properties.highlight = true;
        this.highlightedSnappoints.push(this.snappoints[this.departSnappointIndex]);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.snappoints[this.departSnappointIndex + 1].properties.highlight = true;
        this.highlightedSnappoints.push(this.snappoints[this.departSnappointIndex + 1]);
      }
    }

    /*
     * Disable the global `onMove` handlers for them not to interfere with the new ones which are added further down.
     */
    this.map.off("touchstart", this.onMoveHandler);
    this.map.off("mousemove", this.onMoveHandler);

    /*
     * Add specific drag-only listeners.
     */
    if (e.type === "touchstart") {
      this.map.on("touchmove", this.onDragMoveHandler);
      this.map.on("touchend", this.onDragUpHandler);
    } else if (e.type === "mousedown") {
      this.map.on("mousemove", this.onDragMoveHandler);
      this.map.on("mouseup", this.onDragUpHandler);
    }

    this.draw();
  }

  protected onDragMove(e: maplibregl.MapMouseEvent | maplibregl.MapTouchEvent) {
    /*
     * `preventDefault` here prevents drag down gesture in mobile chrome from updating the page
     */
    // TODO: remove the @ts-ignore when https://github.com/maplibre/maplibre-gl-js/pull/1131 is merged
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (e.type === "touchmove" && e.originalEvent.touches.length !== 1) return e.originalEvent.preventDefault();
    if (e.type === "mousemove" && e.originalEvent.which !== 1) return;

    if (this.waypointBeingDragged) {
      /*
       * If it's a waypoint that's being dragged then update accordingly its coordinates.
       */

      this.waypointBeingDragged.geometry.coordinates = [e.lngLat.lng, e.lngLat.lat];
    } else if (this.hoverpoint) {
      /*
       * When dragging a route line, redraw the hoverpoint at the new coordinates.
       */

      this.hoverpoint.geometry.coordinates = [e.lngLat.lng, e.lngLat.lat];
    }

    this.draw();
  }

  protected async onDragUp(e: maplibregl.MapMouseEvent | maplibregl.MapTouchEvent) {
    if (e.type === "mouseup" && e.originalEvent.which !== 1) return;

    if (this.hoverpoint?.properties) this.hoverpoint.properties.showSnaplines = false;

    /*
     * Only add a new waypoint or change the dragged one's position if the mouse has been dragged for more than the
     * specified threshold. If the specified threshold's value is less than zero then treat it as if it was zero.
     */
    if (
      Math.abs(e.point.x - this.dragDownPosition?.x) >
        (this.options.dragThreshold >= 0 ? this.options.dragThreshold : 0) ||
      Math.abs(e.point.y - this.dragDownPosition?.y) >
        (this.options.dragThreshold >= 0 ? this.options.dragThreshold : 0)
    ) {
      if (this.waypointBeingDragged) {
        /*
         * If a waypoint has been dragged, update its position accordingly and re-fetch the directions.
         */

        this.waypointBeingDragged.geometry.coordinates = [e.lngLat.lng, e.lngLat.lat];

        /*
         * If the routing request has failed for some reason, restore the waypoint's original position.
         */
        try {
          await this.fetchDirections();
        } catch (err) {
          if (this.waypointBeingDraggedInitialCoordinates) {
            this.waypointBeingDragged.geometry.coordinates = this.waypointBeingDraggedInitialCoordinates;
          }
        }

        this.waypointBeingDragged = undefined;
        this.waypointBeingDraggedInitialCoordinates = undefined;
      } else if (this.hoverpoint) {
        /*
         * If the selected route line has been dragged then add a waypoint at the previously saved index and remove the
         * hoverpoint.
         */

        this.addWaypoint(
          [e.lngLat.lng, e.lngLat.lat],
          this.departSnappointIndex !== undefined ? this.departSnappointIndex + 1 : undefined,
        );

        this.hoverpoint = undefined;
      }
    } else {
      /*
       * If the waypoint or the selected routeline has been dragged not far enough, restore its initial location.
       */

      if (this.waypointBeingDragged && this.waypointBeingDraggedInitialCoordinates) {
        this.waypointBeingDragged.geometry.coordinates = this.waypointBeingDraggedInitialCoordinates;

        this.waypointBeingDragged = undefined;
        this.waypointBeingDraggedInitialCoordinates = undefined;
      } else if (this.hoverpoint) {
        this.hoverpoint = undefined;
      }
    }

    /*
     * De-highlight everything.
     */
    this.deHighlight();

    /*
     * Remove the specifically assigned for the drag-related events listeners.
     */
    if (e.type === "touchend") {
      this.map.off("touchmove", this.onDragMoveHandler);
      this.map.off("touchend", this.onDragUpHandler);
    } else if (e.type === "mouseup") {
      this.map.off("mousemove", this.onDragMoveHandler);
      this.map.off("mouseup", this.onDragUpHandler);
    }

    /*
     * Restore the removed global `onMove` listeners.
     */
    this.map.on("touchstart", this.onMoveHandler);
    this.map.on("mousemove", this.onMoveHandler);

    this.draw();
  }

  protected onClick(e: maplibregl.MapMouseEvent) {
    const feature: (Feature<Point> & { layer: { id: string } }) | undefined = this.map.queryRenderedFeatures(e.point, {
      layers: [
        ...this.options.sensitiveWaypointLayers,
        ...this.options.sensitiveSnappointLayers,
        ...this.options.sensitiveAltRoutelineLayers,
        ...this.options.sensitiveRoutelineLayers,
      ],
    })[0];

    if (this.options.sensitiveWaypointLayers.includes(feature?.layer.id ?? "")) {
      /*
       * If a waypoint is clicked, remove it.
       */

      const respectiveWaypointIndex = this.waypoints.findIndex((waypoint) => {
        return waypoint.properties?.id === feature?.properties?.id;
      });

      if (~respectiveWaypointIndex) {
        this.removeWaypoint(respectiveWaypointIndex);
      }
    } else if (this.options.sensitiveSnappointLayers.includes(feature?.layer.id ?? "")) {
      /*
       * If a snappoint is clicked, find its respective waypoint and remove it.
       */

      const respectiveWaypointIndex = this.snappoints.findIndex((snappoint) => {
        return snappoint.properties?.id === feature?.properties?.id;
      });

      if (~respectiveWaypointIndex) {
        this.removeWaypoint(respectiveWaypointIndex);
      }
    } else if (this.options.sensitiveAltRoutelineLayers.includes(feature?.layer.id ?? "")) {
      /*
       * If an alternative route line is clicked, set its index as the selected route's one.
       */

      this.selectedRouteIndex = this.routelines.findIndex((routeline) => {
        return !!routeline.find((segment) => {
          return segment.properties?.id === feature?.properties?.id;
        });
      });
    } else if (!this.options.sensitiveRoutelineLayers.includes(feature?.layer.id ?? "")) {
      /*
       * If the selected route line is clicked, don't add a new waypoint. Else do.
       */

      this.addWaypoint([e.lngLat.lng, e.lngLat.lat]);
    }

    // the selected route might have changed, so it's important not to skip its redraw
    this.draw(false);
  }

  // the public interface begins here

  /**
   * The interactivity state of the instance. When `true`, the user is allowed to interact with the features drawn on
   * the map and to add waypoints by clicking the map. Automatically set to `false` whenever there's an ongoing
   * routing request.
   *
   * @return {boolean}
   */
  get interactive() {
    return this._interactive;
  }

  set interactive(interactive) {
    this._interactive = interactive;

    if (interactive) {
      this.map.on("touchstart", this.onMoveHandler);
      this.map.on("touchstart", this.onDragDownHandler);
      this.map.on("mousemove", this.onMoveHandler);
      this.map.on("mousedown", this.onDragDownHandler);
      this.map.on("click", this.onClickHandler);
    } else {
      this.map.off("touchstart", this.onMoveHandler);
      this.map.off("touchstart", this.onDragDownHandler);
      this.map.off("mousemove", this.onMoveHandler);
      this.map.off("mousedown", this.onDragDownHandler);
      this.map.off("click", this.onClickHandler);
    }
  }

  /**
   * Replaces all the waypoints with the specified ones and re-fetches the routes.
   *
   * @param {[number, number][]} waypoints The coordinates at which the waypoints should be added
   * @return {Promise<void>} Resolved after the routing request has finished
   */
  async setWaypoints(waypoints: [number, number][]) {
    this.waypoints = waypoints.map((waypoint) => {
      return this.buildPoint(waypoint, "WAYPOINT");
    });

    this.draw();
    await this.fetchDirections();
  }

  /**
   * Adds a waypoint at the specified coordinates to the map and re-fetches the routes.
   *
   * @param {[number, number]} waypoint The coordinates at which the waypoint should be added
   * @param {number?} index The index the waypoint should be inserted at. If omitted, the waypoint is inserted at the end
   * @return {Promise<void>} Resolved after the routing request has finished
   */
  async addWaypoint(waypoint: [number, number], index?: number) {
    index = index ?? this.waypoints.length;
    this.waypoints.splice(index, 0, this.buildPoint(waypoint, "WAYPOINT"));

    this.draw();
    await this.fetchDirections();
  }

  /**
   * Removes a waypoint and its related snappoint by the waypoint's index from the map and re-fetches the routes.
   *
   * @param {number} index The index of the waypoint to remove
   * @return {Promise<void>} Resolved after the routing request has finished
   */
  async removeWaypoint(index: number) {
    this.waypoints.splice(index, 1);
    this.snappoints.splice(index, 1);

    this.draw();
    await this.fetchDirections();
  }

  /**
   * Clears the map from all the instance's traces: waypoints, snappoints, routes, etc.
   */
  clear() {
    this.setWaypoints([]);
    this.routelines = [];
  }

  /**
   * Removes all the added `MaplibreGlDirections`-specific layers and sources. Must be called manually before
   * de-initializing the instance.
   */
  destroy() {
    this.options.layers.forEach((layer) => {
      this.map.removeLayer(layer.id);
    });

    this.map.removeSource("maplibre-gl-directions");
  }
}
