import type { Map, MapMouseEvent, MapTouchEvent } from "maplibre-gl";
import type { Directions } from "./types";

export class MapLibreGlDirectionsEvented {
  constructor(map: Map) {
    this.map = map;
  }

  protected readonly map: Map;

  private listeners: ListenersStore = {};
  private oneTimeListeners: ListenersStore = {};

  protected fire<T extends keyof MapLibreGlDirectionsEventType>(event: MapLibreGlDirectionsEventType[T]) {
    event.target = this.map;

    const type: T = event.type as T;

    this.listeners[type]?.forEach((listener) => listener(event));
    this.oneTimeListeners[type]?.forEach((listener) => {
      listener(event);

      const index = this.oneTimeListeners[type]?.indexOf(listener);
      if (index !== undefined && ~index) this.oneTimeListeners[type]?.splice(index, 1);
    });
  }

  /**
   * Registers an event listener.
   */
  on<T extends keyof MapLibreGlDirectionsEventType>(type: T, listener: MapLibreGlDirectionsEventListener<T>) {
    this.listeners[type] = this.listeners[type] ?? [];
    this.listeners[type]!.push(listener);
  }

  /**
   * Un-registers an event listener.
   */
  off<T extends keyof MapLibreGlDirectionsEventType>(type: T, listener: (e: MapLibreGlDirectionsEventType[T]) => void) {
    const index = this.listeners[type]?.indexOf(listener);
    if (index !== undefined && ~index) this.listeners[type]?.splice(index, 1);
  }

  /**
   * Registers an event listener to be invoked only once.
   */
  once<T extends keyof MapLibreGlDirectionsEventType>(type: T, listener: MapLibreGlDirectionsEventListener<T>) {
    this.oneTimeListeners[type] = this.oneTimeListeners[type] ?? [];
    this.oneTimeListeners[type]!.push(listener);
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
   * Emitted after the waypoints' bearings values are changed using the
   * {@link default.waypointsBearings|`waypointsBearings`} setter.
   */
  rotatewaypoints: MapLibreGlDirectionsWaypointEvent;

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

export type MapLibreGlDirectionsEventListener<T extends keyof MapLibreGlDirectionsEventType> = (
  event: MapLibreGlDirectionsEventType[T],
) => void;

type ListenersStore = Partial<{
  [T in keyof MapLibreGlDirectionsEventType]: MapLibreGlDirectionsEventListener<T>[];
}>;

export interface MapLibreGlDirectionsEvent<TOrig, T extends keyof MapLibreGlDirectionsEventType> {
  type: T;
  target: Map;
  originalEvent: TOrig;
}

export interface MapLibreGlDirectionsWaypointEventData {
  /**
   * Index of the added/removed/moved waypoint.
   *
   * Never presents for {@link MapLibreGlDirectionsEventType.setwaypoints|`setwaypoints`} and
   * {@link MapLibreGlDirectionsEventType.rotatewaypoints|`rotatewaypoints`} events.
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
  implements
    MapLibreGlDirectionsEvent<
      MapMouseEvent | MapTouchEvent | undefined,
      "setwaypoints" | "rotatewaypoints" | "addwaypoint" | "removewaypoint" | "movewaypoint"
    >
{
  /**
   * @private
   */
  constructor(
    type: "setwaypoints" | "rotatewaypoints" | "addwaypoint" | "removewaypoint" | "movewaypoint",
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

export class MapLibreGlDirectionsRoutingEvent
  implements MapLibreGlDirectionsEvent<MapLibreGlDirectionsWaypointEvent, "fetchroutesstart" | "fetchroutesend">
{
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
   * Only presents when it's the {@link MapLibreGlDirectionsEventType.fetchroutesend|`fetchroutesend`} event, but might
   * be `undefined` in case the request to fetch directions failed.
   *
   * @see http://project-osrm.org/docs/v5.24.0/api/#responses
   */
  data?: MapLibreGlDirectionsRoutingEventData;
}
