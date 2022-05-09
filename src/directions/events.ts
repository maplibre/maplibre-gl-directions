import type { Map, MapMouseEvent, MapTouchEvent } from "maplibre-gl";
import type { Directions } from "./types";

export class MapLibreGlDirectionsEvented {
  constructor(map: Map) {
    this.map = map;
  }

  protected readonly map: Map;

  private listeners: Partial<Record<keyof MapLibreGlDirectionsEventType, ((ev: never) => void)[]>> = {};
  private oneTimeListeners: Partial<Record<keyof MapLibreGlDirectionsEventType, ((ev: never) => void)[]>> = {};

  protected fire<T extends keyof MapLibreGlDirectionsEventType>(event: MapLibreGlDirectionsEventType[T]) {
    event.target = this.map;

    this.listeners[event.type]?.forEach((listener) => listener(event));
    this.oneTimeListeners[event.type]?.forEach((listener) => {
      listener(event);

      const index = this.oneTimeListeners[event.type]?.indexOf(listener);
      if (index && ~index) this.oneTimeListeners[event.type]?.splice(index, 1);
    });
  }

  /**
   * Registers an event listener.
   */
  on<T extends keyof MapLibreGlDirectionsEventType>(type: T, listener: (ev: MapLibreGlDirectionsEventType[T]) => void) {
    (this.listeners[type] = this.listeners[type] ?? ([] as ((ev: never) => void)[])).push(listener);
  }

  /**
   * Un-registers an event listener.
   */
  off<T extends keyof MapLibreGlDirectionsEventType>(type: T, listener: (e: MapLibreGlDirectionsEventType[T]) => void) {
    const index = this.listeners[type]?.indexOf(listener);
    if (index && ~index) this.listeners[type]?.splice(index, 1);
  }

  /**
   * Registers an event listener to be invoked only once.
   */
  once<T extends keyof MapLibreGlDirectionsEventType>(
    type: T,
    listener: (e: MapLibreGlDirectionsEventType[T]) => void,
  ) {
    (this.oneTimeListeners[type] = this.oneTimeListeners[type] ?? ([] as ((ev: never) => void)[])).push(listener);
  }
}

/**
 * Supported event types.
 */
export interface MapLibreGlDirectionsEventType {
  /**
   * Emitted after the waypoints are set using the {@link default.setWaypoints|`setWaypoints`} method.
   */
  setwaypoints: MapLibreGlDirectionsWaypointEvent;

  /**
   * Emitted when a waypoint is added.
   */
  addwaypoint: MapLibreGlDirectionsWaypointEvent;

  /**
   * Emitted when a waypoint is removed.
   */
  removewaypoint: MapLibreGlDirectionsWaypointEvent;

  /**
   * Emitted when a waypoint is moved. __Note__ that the event is not emitted if the waypoint has been dragged for an
   * amount of pixels less than specified by the {@link MapLibreGlDirectionsConfiguration.dragThreshold|`dragThreshold`}
   * configuration property.
   */
  movewaypoint: MapLibreGlDirectionsWaypointEvent;

  /**
   * Emitted when there appears an ongoing routing-request.
   */
  fetchroutesstart: MapLibreGlDirectionsRoutingEvent;

  /**
   * Emitted after the ongoing routing-request has finished.
   */
  fetchroutesend: MapLibreGlDirectionsRoutingEvent;
}

export interface MapLibreGlDirectionsEvent<TOrig = undefined> {
  type: keyof MapLibreGlDirectionsEventType;
  target: Map;
  originalEvent: TOrig;
}

export interface MapLibreGlDirectionsWaypointEventData {
  /**
   * Index of the added/removed/moved waypoint.
   *
   * Never presents for the {@link MapLibreGlDirectionsEventType.setwaypoints|`setwaypoints`} event.
   */
  index: number;

  /**
   * Coordinates from which the waypoint has been moved.
   *
   * Only presents when it's the {@link MapLibreGlDirectionsEventType.movewaypoint|`movewaypoint`} event.
   */
  initialCoordinates: [number, number];
}

export class MapLibreGlDirectionsWaypointEvent
  implements MapLibreGlDirectionsEvent<MapMouseEvent | MapTouchEvent | undefined>
{
  /**
   * @private
   */
  constructor(
    type: "setwaypoints" | "addwaypoint" | "removewaypoint" | "movewaypoint",
    originalEvent: MapMouseEvent | MapTouchEvent | undefined,
    data?: Partial<MapLibreGlDirectionsWaypointEventData>,
  ) {
    this.type = type;
    this.originalEvent = originalEvent;
    this.data = data;
  }

  type;
  target!: Map;
  originalEvent: MapMouseEvent | MapTouchEvent | undefined;
  data?: Partial<MapLibreGlDirectionsWaypointEventData>;
}

export type MapLibreGlDirectionsRoutingEventData = Directions;

export class MapLibreGlDirectionsRoutingEvent implements MapLibreGlDirectionsEvent<MapLibreGlDirectionsWaypointEvent> {
  /**
   * @private
   */
  constructor(
    type: "fetchroutesstart" | "fetchroutesend",
    originalEvent: MapLibreGlDirectionsWaypointEvent,
    data?: MapLibreGlDirectionsRoutingEventData,
  ) {
    this.type = type;
    this.originalEvent = originalEvent;
    this.data = data;
  }

  type;
  target!: Map;
  originalEvent: MapLibreGlDirectionsWaypointEvent;
  /**
   * The server's response.
   *
   * Only presents when it's the {@link MapLibreGlDirectionsEventType.fetchroutesend|`fetchroutesend`} event, but is
   * `undefined` in case the request to fetch directions failed.
   *
   * @see http://project-osrm.org/docs/v5.24.0/api/#responses
   */
  data?: MapLibreGlDirectionsRoutingEventData;
}
