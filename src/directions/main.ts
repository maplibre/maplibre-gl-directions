import type { Map, MapGeoJSONFeature, MapMouseEvent, MapTouchEvent } from "maplibre-gl";
import type { Directions, MapLibreGlDirectionsConfiguration } from "./types";
import type { Feature, FeatureCollection, LineString, Point } from "geojson";
import {
  MapLibreGlDirectionsEvented,
  MapLibreGlDirectionsRoutingEvent,
  MapLibreGlDirectionsWaypointEvent,
} from "./events";
import {
  buildConfiguration,
  buildRequest,
  buildPoint,
  buildSnaplines,
  buildRoutelines,
  type RequestData,
} from "./utils";
import { getWaypointsBearings, getWaypointsCoordinates } from "./helpers";

/**
 * The main class responsible for all the user interaction and for the routing itself.
 */
export default class MapLibreGlDirections extends MapLibreGlDirectionsEvented {
  constructor(map: Map, configuration?: Partial<MapLibreGlDirectionsConfiguration>) {
    super(map);

    this.map = map;
    this.configuration = buildConfiguration(configuration);

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
    this.liveRefreshHandler = this.liveRefresh.bind(this);

    this.init();
  }

  /*
   * Everything is `protected` to allow access from a subclass.
   */
  protected declare readonly map: Map;
  protected readonly configuration: MapLibreGlDirectionsConfiguration;

  protected _interactive = false;
  protected _hoverable = false;
  protected buildRequest = buildRequest;
  protected buildPoint = buildPoint;
  protected buildSnaplines = buildSnaplines;
  protected buildRoutelines = buildRoutelines;

  protected onMoveHandler: (e: MapMouseEvent | MapTouchEvent) => void;
  protected onDragDownHandler: (e: MapMouseEvent | MapTouchEvent) => void;
  protected onDragMoveHandler: (e: MapMouseEvent | MapTouchEvent) => void;
  protected onDragUpHandler: (e: MapMouseEvent | MapTouchEvent) => void;
  protected onClickHandler: (e: MapMouseEvent | MapTouchEvent) => void;
  protected liveRefreshHandler: (e: MapMouseEvent | MapTouchEvent) => void;

  protected profiles: string[] = [];
  protected _waypoints: Feature<Point>[] = [];
  protected snappoints: Feature<Point>[] = [];
  protected routelines: Feature<LineString>[][] = [];
  protected selectedRouteIndex = 0;
  protected hoverpoint: Feature<Point> | undefined = undefined;

  /**
   * @alias {@link waypoints}
   *
   * Aliased for the sakes of naming-consistency.
   */
  protected get waypointsCoordinates(): [number, number][] {
    return getWaypointsCoordinates(this._waypoints);
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
    this.map.addSource(this.configuration.sourceName, {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
    });

    this.configuration.layers.forEach((layer) => {
      this.map.addLayer(layer);
    });
  }

  protected async fetch({ method, url, payload }: RequestData) {
    const response = (await (method === "get"
      ? await fetch(`${url}?${payload}`, { signal: this.abortController.signal })
      : await fetch(`${url}`, {
          signal: this.abortController.signal,
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: payload,
        })
    ).json()) as Directions;

    if (response.code !== "Ok") throw new Error(response.message ?? "An unexpected error occurred.");

    return response;
  }

  protected async fetchDirections(originalEvent: MapLibreGlDirectionsWaypointEvent) {
    /*
     * If a request from a previous fetchDirections is already running,
     * we abort it as we don't need the previous value anymore
     */
    this.abortController?.abort();
    const prevInteractive = this.interactive;

    if (this._waypoints.length >= 2) {
      this.fire(new MapLibreGlDirectionsRoutingEvent("fetchroutesstart", originalEvent));

      this.abortController = new AbortController();
      const signal = this.abortController.signal;
      signal.onabort = () => {
        this.interactive = prevInteractive;
      };

      this.interactive = false;

      let timer;
      if (this.configuration.requestTimeout !== null) {
        timer = setTimeout(() => this.abortController?.abort(), this.configuration.requestTimeout);
      }

      if (!this.profiles.length) {
        this.profiles = [this.configuration.profile];
      }

      // Profiles for requests
      const profiles: string[] = [];
      // Waypoints split by profile
      const waypoints: Feature<Point>[][] = [];

      /**
       * Prepares data for the requests
       */
      this.profiles.reduce((waypointsIndex, profile, index) => {
        const isLast = index === this.profiles.length - 1;
        const prevProfile = index > 0 ? this.profiles[index - 1] : undefined;
        const isSameProfile = profile === prevProfile;
        const waypointsEnd = isLast
          ? /**
             * If it's the last supplied profile include all remaining waypoints
             */
            this._waypoints.length
          : isSameProfile
            ? /**
               * If profile is same as previous one add a slice of one element only
               */
              waypointsIndex + 1
            : /**
               * If profile is different slice corresponding pair of coordinates
               */
              waypointsIndex + 2;

        if (isSameProfile) {
          /**
           * If route to the next waypoint is to be found with the same profile, add waypoints to the previous chunk to
           * fetch them in one request
           */
          waypoints[waypoints.length - 1].push(...this._waypoints.slice(waypointsIndex, waypointsEnd));
        } else {
          /**
           * Otherwise add waypoints as the next chunk and push new profile
           */
          waypoints.push(this._waypoints.slice(waypointsIndex, waypointsEnd));
          profiles.push(profile);
        }

        return waypointsEnd;
      }, 0);

      const requests = profiles.map((profile, index) => {
        return this.buildRequest(
          { ...this.configuration, profile },
          getWaypointsCoordinates(waypoints[index]),
          this.configuration.bearings ? getWaypointsBearings(waypoints[index]) : undefined,
        );
      });

      let responses: Directions[];

      try {
        responses = await Promise.all(
          requests.map(async (request) => {
            let response: Directions;
            try {
              response = await this.fetch(request);
            } finally {
              this.fire(new MapLibreGlDirectionsRoutingEvent("fetchroutesend", originalEvent, response));
            }
            return response;
          }),
        );
      } finally {
        // see #189 (https://github.com/maplibre/maplibre-gl-directions/issues/189)
        if (this.abortController?.signal.reason !== "DESTROY") this.interactive = prevInteractive;

        this.abortController = undefined;

        clearTimeout(timer);
      }

      const features = responses.flatMap((response, index) => {
        const profile = profiles[index];

        const snappoints = response.waypoints.map((snappoint, i) =>
          this.buildPoint(snappoint.location, "SNAPPOINT", {
            profile,
            waypointProperties: waypoints[index][i].properties ?? {},
          }),
        );

        const routelines = this.buildRoutelines(
          this.configuration.requestOptions,
          response.routes,
          this.selectedRouteIndex,
          snappoints,
        );

        return { snappoints, routelines };
      });
      const routes = responses.flatMap((response) => response.routes);

      this.snappoints = features.flatMap((features) => features.snappoints);
      this.routelines = features.flatMap((features) => features.routelines);
      if (routes.length <= this.selectedRouteIndex) this.selectedRouteIndex = 0;
    } else {
      this.snappoints = [];
      this.routelines = [];
    }

    // the selected route index might have changed
    this.draw(false);
  }

  protected draw(skipSelectedRouteRedraw = true) {
    const features = [
      ...this._waypoints,
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

    if (this.map.getSource(this.configuration.sourceName)) {
      (this.map.getSource(this.configuration.sourceName) as maplibregl.GeoJSONSource).setData(geoJson);
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

  protected onMove(e: MapMouseEvent) {
    const feature: MapGeoJSONFeature | undefined = this.map.queryRenderedFeatures(e.point, {
      layers: [
        ...this.configuration.sensitiveWaypointLayers,
        ...this.configuration.sensitiveSnappointLayers,
        ...this.configuration.sensitiveRoutelineLayers,
        ...this.configuration.sensitiveAltRoutelineLayers,
      ],
    })[0];

    /*
     * De-highlight everything first in order to be able to highlight only the necessary features.
     */
    this.deHighlight();

    if (this.configuration.sensitiveWaypointLayers.includes(feature?.layer.id ?? "")) {
      /*
       *  If the cursor moves over a waypoint then change its shape to "pointer", disable the map's standard drag-pan
       *  functionality (the user should be able to drag the waypoint itself, not the map), set the waypoint's
       *  "highlight" property to `true`. Set its respective snappoint's "highlight" property to `true` as well. Save
       *  the highlighted features outside to be able to de-highlight them the next time the `onMove` is called. Remove
       *  the existing hoverpoint.
       */

      this.map.getCanvas().style.cursor = "pointer";
      this.map.dragPan.disable();

      const highlightedWaypointIndex = this._waypoints.findIndex((waypoint) => {
        return waypoint.properties?.id === feature?.properties?.id;
      });

      this.highlightedWaypoints = [this._waypoints[highlightedWaypointIndex]];
      this.highlightedSnappoints = [this.snappoints[highlightedWaypointIndex]];

      if (this.highlightedWaypoints[0]?.properties) {
        this.highlightedWaypoints[0].properties.highlight = true;
      }

      if (this.highlightedSnappoints[0]?.properties) {
        this.highlightedSnappoints[0].properties.highlight = true;
      }

      if (this.hoverpoint) this.hoverpoint = undefined;
    } else if (this.configuration.sensitiveSnappointLayers.includes(feature?.layer.id ?? "")) {
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
      this.highlightedWaypoints = [this._waypoints[highlightedSnappointIndex]];

      if (this.highlightedSnappoints[0].properties) {
        this.highlightedSnappoints[0].properties.highlight = true;
      }

      if (this.highlightedWaypoints[0].properties) {
        this.highlightedWaypoints[0].properties.highlight = true;
      }

      if (this.hoverpoint) this.hoverpoint = undefined;
    } else if (this.configuration.sensitiveRoutelineLayers.includes(feature?.layer.id ?? "")) {
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
    } else if (this.configuration.sensitiveAltRoutelineLayers.includes(feature?.layer.id ?? "")) {
      /*
       * If the cursor moves over an alternative route line then change its shape to "pointer" and set the routeline's
       * "highlight" property to `true`. Remove the existing hoverpoint.
       */

      this.map.getCanvas().style.cursor = "pointer";

      this.routelines.forEach((routeline) => {
        routeline.forEach((leg) => {
          if (leg.properties && leg.properties?.id === feature?.properties?.id) {
            leg.properties.highlight = true;
          }
        });
      });

      if (this.hoverpoint) this.hoverpoint = undefined;
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

  protected dragDownPosition = {
    x: 0,
    y: 0,
  };
  protected waypointBeingDragged?: Feature<Point>;
  protected waypointBeingDraggedInitialCoordinates?: [number, number];
  protected departSnappointIndex = -1;
  protected currentMousePosition = {
    x: 0,
    y: 0,
  };

  protected onDragDown(e: MapMouseEvent | MapTouchEvent) {
    if (e.type === "touchstart" && e.originalEvent.touches.length !== 1) return;
    if (e.type === "mousedown" && e.originalEvent.which !== 1) return;

    const features: MapGeoJSONFeature[] | undefined = this.map.queryRenderedFeatures(e.point);
    // check if the user is trying to drag a layer from our source
    if (features.length && features[0].source === this.configuration.sourceName) {
      // he is. let's find the top most feature that might interest us

      const feature: MapGeoJSONFeature | undefined = features.filter((feature) => {
        return (
          this.configuration.sensitiveWaypointLayers.includes(feature?.layer.id ?? "") ||
          this.configuration.sensitiveSnappointLayers.includes(feature?.layer.id ?? "") ||
          this.configuration.sensitiveRoutelineLayers.includes(feature?.layer.id ?? "")
        );
      })[0];
      /*
       * Save the cursor's position to be able to check later whether the dragged feature moved at all.
       */
      this.dragDownPosition = e.point;
      this.currentMousePosition = e.point;

      if (this.configuration.sensitiveWaypointLayers.includes(feature?.layer.id ?? "")) {
        /*
         * When a waypoint is being dragged, save it and its current coordinates outside.
         */

        this.waypointBeingDragged = this._waypoints.find((waypoint) => {
          return waypoint.properties?.id === feature?.properties?.id;
        });

        this.waypointBeingDraggedInitialCoordinates = this.waypointBeingDragged?.geometry.coordinates as
          | [number, number]
          | undefined;
      } else if (this.configuration.sensitiveRoutelineLayers.includes(feature?.layer.id ?? "")) {
        /*
         * When a routeline (a leg in particular) is being dragged, find its respective depart snappoint's index and save
         * it outside. Since a route is divided into legs by the snappoints, the leg's index is always equal to the
         * depart snappoint's index.
         */
        this.departSnappointIndex = JSON.parse(feature?.properties?.legIndex);

        /*
         * the "touchstart" event ("mousemove" equivalent) is not always fired before this `onDragDown` (which is also the
         * "touchstart"), therefore the hoverpoint might not exist yet. If it indeed does not, then create it and then
         * enable showing its snaplines.
         */

        if (this.hoverpoint) {
          if (this.configuration.refreshOnMove) {
            /*
             * If dragging a hoverpoint and refreshOnMove is active, we must convert it to a waypoint instead
             */
            const departedSnapPointIndex =
              this.departSnappointIndex !== undefined ? this.departSnappointIndex + 1 : undefined;
            this._addWaypoint([e.lngLat.lng, e.lngLat.lat], departedSnapPointIndex, e);
            /*
             * This new waypoint is set as the one now being dragged, in order to not interrupt the user's dragging action
             */
            this.waypointBeingDragged = this._waypoints[departedSnapPointIndex];
            this.hoverpoint = undefined;
          } else {
            this.hoverpoint.geometry.coordinates = [e.lngLat.lng, e.lngLat.lat];
          }
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

        if (this.hoverpoint?.properties) {
          this.hoverpoint.properties.showSnaplines = true;
        }

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
  }

  protected refreshOnMoveIsRefreshing = false;

  protected onDragMove(e: MapMouseEvent | MapTouchEvent) {
    /*
     * when updateOnMove is active, if this timeout ever triggers it means we are dragging,
     * but not moving the mouse.
     */
    if (this.configuration.refreshOnMove) {
      clearTimeout(this.noMouseMovementTimer);
      this.noMouseMovementTimer = setTimeout(this.liveRefreshHandler, 300, e);
    }

    /*
     * `preventDefault` here prevents drag down gesture in mobile Chrome from updating the page.
     */
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
    this.currentMousePosition = e.point;
    this.draw();

    /*
     * If the user selected a waypoint or a routeline and routes should update while dragging,
     * we initiate the live updating process.
     */
    if (this.configuration.refreshOnMove && !this.refreshOnMoveIsRefreshing) {
      this.liveRefreshHandler(e);
    }
  }

  protected noMouseMovementTimer: ReturnType<typeof setTimeout>;

  protected async onDragUp(e: MapMouseEvent | MapTouchEvent) {
    /*
     * if routes should update while dragging, there's some cleanup to do when releasing the mouse
     */
    if (this.configuration.refreshOnMove) {
      clearTimeout(this.noMouseMovementTimer);
    }

    if (e.type === "mouseup" && e.originalEvent.which !== 1) return;

    if (this.hoverpoint?.properties) this.hoverpoint.properties.showSnaplines = false;

    /*
     * Only add a new waypoint or change the dragged one's position if the mouse has been dragged for more than the
     * specified threshold. If the specified threshold's value is less than zero then treat it as if it was zero.
     */
    if (
      Math.abs(e.point.x - this.dragDownPosition?.x) >
        (this.configuration.dragThreshold >= 0 ? this.configuration.dragThreshold : 0) ||
      Math.abs(e.point.y - this.dragDownPosition?.y) >
        (this.configuration.dragThreshold >= 0 ? this.configuration.dragThreshold : 0)
    ) {
      if (this.waypointBeingDragged) {
        /*
         * If a waypoint has been dragged, update its position accordingly and re-fetch the directions.
         */

        this.waypointBeingDragged.geometry.coordinates = [e.lngLat.lng, e.lngLat.lat];

        const waypointEvent = new MapLibreGlDirectionsWaypointEvent("movewaypoint", e, {
          index: this._waypoints.indexOf(this.waypointBeingDragged),
          initialCoordinates: this.waypointBeingDraggedInitialCoordinates,
        });
        this.fire(waypointEvent);

        /*
         * If the routing request has failed for some reason, restore the waypoint's original position.
         */
        try {
          await this.fetchDirections(waypointEvent);
        } catch (err) {
          if (!(err instanceof DOMException && err.name == "AbortError")) {
            if (this.waypointBeingDraggedInitialCoordinates) {
              this.waypointBeingDragged.geometry.coordinates = this.waypointBeingDraggedInitialCoordinates;
            }
          }
        }

        this.waypointBeingDragged = undefined;
        this.waypointBeingDraggedInitialCoordinates = undefined;
      } else if (this.hoverpoint) {
        /*
         * If the selected route line has been dragged then add a waypoint at the previously saved index and remove the
         * hoverpoint.
         */

        this._addWaypoint(
          [e.lngLat.lng, e.lngLat.lat],
          this.departSnappointIndex !== undefined ? this.departSnappointIndex + 1 : undefined,
          e,
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

    // Re-enable original dragPan functionality. Might have already been re-enabled, but there are cases when it's
    // not the case. See https://github.com/maplibre/maplibre-gl-directions/issues/186
    this.map.dragPan.enable();

    this.draw();
  }

  protected lastRequestMousePosition = {
    x: 0,
    y: 0,
  };

  protected async liveRefresh(e: MapMouseEvent | MapTouchEvent) {
    if (
      Math.abs(this.lastRequestMousePosition?.x - this.currentMousePosition?.x) >
        (this.configuration.dragThreshold >= 0 ? this.configuration.dragThreshold : 0) ||
      Math.abs(this.lastRequestMousePosition?.y - this.currentMousePosition?.y) >
        (this.configuration.dragThreshold >= 0 ? this.configuration.dragThreshold : 0)
    ) {
      this.refreshOnMoveIsRefreshing = true;
      this.lastRequestMousePosition = this.currentMousePosition;

      /*
       * During liveRefresh, we only care about waypoints, because if dragging a hoverpoint
       * then it has already been converted to a waypoint on dragDown
       */
      if (this.waypointBeingDragged) {
        /*
         * If a waypoint has been dragged, we fire a "movewaypoint" just like "onDragUp" does.
         */
        const waypointEvent = new MapLibreGlDirectionsWaypointEvent("movewaypoint", e, {
          index: this._waypoints.indexOf(this.waypointBeingDragged),
          initialCoordinates: this.waypointBeingDraggedInitialCoordinates,
        });
        this.fire(waypointEvent);

        try {
          await this.fetchDirections(waypointEvent);
        } catch (err) {
          // noop
        }
      }
      this.refreshOnMoveIsRefreshing = false;
    }
  }

  protected onClick(e: MapMouseEvent) {
    const feature: MapGeoJSONFeature | undefined = this.map.queryRenderedFeatures(e.point, {
      layers: [
        ...this.configuration.sensitiveWaypointLayers,
        ...this.configuration.sensitiveSnappointLayers,
        ...this.configuration.sensitiveAltRoutelineLayers,
        ...this.configuration.sensitiveRoutelineLayers,
      ],
    })[0];

    if (this.configuration.sensitiveWaypointLayers.includes(feature?.layer.id ?? "")) {
      /*
       * If a waypoint is clicked, remove it.
       */

      const respectiveWaypointIndex = this._waypoints.findIndex((waypoint) => {
        return waypoint.properties?.id === feature?.properties?.id;
      });

      if (~respectiveWaypointIndex) {
        this._removeWaypoint(respectiveWaypointIndex, e);
      }
    } else if (this.configuration.sensitiveSnappointLayers.includes(feature?.layer.id ?? "")) {
      /*
       * If a snappoint is clicked, find its respective waypoint and remove it.
       */

      const respectiveWaypointIndex = this.snappoints.findIndex((snappoint) => {
        return snappoint.properties?.id === feature?.properties?.id;
      });

      if (~respectiveWaypointIndex) {
        this._removeWaypoint(respectiveWaypointIndex, e);
      }
    } else if (this.configuration.sensitiveAltRoutelineLayers.includes(feature?.layer.id ?? "")) {
      /*
       * If an alternative route line is clicked, set its index as the selected route's one.
       */

      this.selectedRouteIndex = this.routelines.findIndex((routeline) => {
        return !!routeline.find((segment) => {
          return segment.properties?.id === feature?.properties?.id;
        });
      });
    } else if (!this.configuration.sensitiveRoutelineLayers.includes(feature?.layer.id ?? "")) {
      /*
       * If the selected route line is clicked, don't add a new waypoint. Else do.
       */

      this._addWaypoint([e.lngLat.lng, e.lngLat.lat], undefined, e);
    }

    // the selected route might have changed, so it's important not to skip its redraw
    this.draw(false);
  }

  protected assignWaypointsCategories() {
    this._waypoints.forEach((waypoint, index) => {
      const category = index === 0 ? "ORIGIN" : index === this._waypoints.length - 1 ? "DESTINATION" : undefined;

      if (waypoint.properties) {
        waypoint.properties.index = index;
        waypoint.properties.category = category;
      }
    });
  }

  protected async _addWaypoint(
    waypoint: [number, number],
    index?: number,
    originalEvent?: MapMouseEvent | MapTouchEvent,
  ) {
    this.abortController?.abort();

    index = index ?? this._waypoints.length;

    this._waypoints.splice(
      index,
      0,
      this.buildPoint(
        waypoint,
        "WAYPOINT",
        this.configuration.bearings
          ? {
              bearing: undefined,
            }
          : undefined,
      ),
    );

    this.assignWaypointsCategories();

    const waypointEvent = new MapLibreGlDirectionsWaypointEvent("addwaypoint", originalEvent, {
      index,
    });
    this.fire(waypointEvent);

    this.draw();

    try {
      await this.fetchDirections(waypointEvent);
    } catch (err) {
      // noop
    }
  }

  protected async _removeWaypoint(index: number, originalEvent?: MapMouseEvent | MapTouchEvent) {
    this.abortController?.abort();

    this._waypoints.splice(index, 1);
    this.snappoints.splice(index, 1);

    this.assignWaypointsCategories();

    const waypointEvent = new MapLibreGlDirectionsWaypointEvent("removewaypoint", originalEvent, {
      index,
    });
    this.fire(waypointEvent);

    this.draw();

    try {
      await this.fetchDirections(waypointEvent);
    } catch (err) {
      // noop
    }
  }

  // the public interface begins here

  /**
   * The interactivity state of the instance. When `true`, the user is allowed to interact with the features drawn on
   * the map and to add waypoints by clicking the map. Automatically set to `false` whenever there's an ongoing
   * routing request.
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
   * Returns all the waypoints' coordinates in the order they appear.
   */
  get waypoints() {
    return this.waypointsCoordinates;
  }

  /**
   * @alias Synchronous analogue of {@link setWaypoints}.
   */
  set waypoints(waypoints: [number, number][]) {
    this.setWaypoints(waypoints);
  }

  /**
   * Returns all the waypoints' bearings values or an empty array if the `bearings` configuration option is not
   * enabled.
   */
  get waypointsBearings(): ([number, number] | undefined)[] {
    if (!this.configuration.bearings) {
      console.warn(
        "The `waypointsBearings` getter was referred to, but the `bearings` configuration option is not enabled!",
      );
      return [];
    }

    return getWaypointsBearings(this._waypoints);
  }

  /**
   * Sets the waypoints' bearings values. Does not produce any effect in case the `bearings` configuration option is
   * disabled.
   */
  set waypointsBearings(bearings: [number, number | undefined][]) {
    if (!this.configuration.bearings) {
      console.warn(
        "The `waypointsBearings` setter was referred to, but the `bearings` configuration option is not enabled!",
      );
      return;
    }

    this._waypoints.forEach((waypoint, i) => {
      waypoint.properties.bearing = bearings[i];
    });

    const waypointEvent = new MapLibreGlDirectionsWaypointEvent("rotatewaypoints", undefined);
    this.fire(waypointEvent);

    this.draw();

    try {
      this.fetchDirections(waypointEvent);
    } catch (err) {
      // noop
    }
  }

  /**
   * Replaces all the waypoints with the specified ones and re-fetches the routes.
   *
   * @param waypoints The coordinates at which the waypoints should be added
   * @param profiles Profiles for fetching directions between waypoints.
   * @return Resolved after the routing request has finished
   */
  async setWaypoints(waypoints: [number, number][], profiles: string[] = []) {
    this.abortController?.abort();

    this.profiles = profiles.slice(0, waypoints.length - 1);

    if (this.profiles.length === 0) {
      /**
       * Set profile from config if override is not provided
       */
      this.profiles.push(this.configuration.profile);
    }

    this._waypoints = this.profiles.flatMap((profile, index) => {
      const isLast = index === this.profiles.length - 1;
      const prevProfile = index > 0 ? this.profiles[index - 1] : undefined;
      const isSameProfile = profile === prevProfile;
      const waypointsStart = isSameProfile ? index + 1 : index;
      const waypointsEnd = isLast ? waypoints.length : index + 2;

      return waypoints.slice(waypointsStart, waypointsEnd).map((waypoint, index) => {
        return this.buildPoint(waypoint, "WAYPOINT", {
          profile,
          ...(this.configuration.bearings
            ? {
                bearing: this.waypointsBearings[index],
              }
            : undefined),
        });
      });
    });

    this.assignWaypointsCategories();

    const waypointEvent = new MapLibreGlDirectionsWaypointEvent("setwaypoints", undefined);
    this.fire(waypointEvent);

    this.draw();

    try {
      await this.fetchDirections(waypointEvent);
    } catch (err) {
      // noop
    }
  }

  /**
   * Adds a waypoint at the specified coordinates to the map and re-fetches the routes.
   *
   * @param waypoint The coordinates at which the waypoint should be added
   * @param index The index the waypoint should be inserted at. If omitted, the waypoint is inserted at the end
   * @return Resolved after the routing request has finished
   */
  async addWaypoint(waypoint: [number, number], index?: number) {
    await this._addWaypoint(waypoint, index);
  }

  /**
   * Removes a waypoint and its related snappoint by the waypoint's index from the map and re-fetches the routes.
   *
   * @param index The index of the waypoint to remove
   * @return Resolved after the routing request has finished
   */
  async removeWaypoint(index: number) {
    await this._removeWaypoint(index);
  }

  /**
   * A publicly-available abort-controller that allows to manually abort an ongoing routing-request.
   *
   * Only exists (`!== undefined`) when there's an ongoing routing-request.
   *
   * @example
   * ```
   * direсtions.abortController.abort();
   * ```
   */
  abortController: AbortController | undefined;

  /**
   * Clears the map from all the instance's traces: waypoints, snappoints, routes, etc.
   */
  clear() {
    this.setWaypoints([]);
    this.routelines = [];
  }

  /**
   * Removes all the added `MapLibreGlDirections`-specific layers and sources. Must be called manually before
   * de-initializing the instance.
   */
  destroy() {
    // see #189 (https://github.com/maplibre/maplibre-gl-directions/issues/189)
    this.abortController?.abort("DESTROY");

    this.clear();
    this.interactive = false;

    this.configuration.layers.forEach((layer) => {
      this.map.removeLayer(layer.id);
    });

    this.map.removeSource(this.configuration.sourceName);
  }
}
