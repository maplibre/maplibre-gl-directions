import { Evented, Map, MapMouseEvent, MapTouchEvent } from "maplibre-gl";
import { Directions } from "./types";

export class MaplibreGlDirectionsEvented extends Evented {
  constructor(map: Map) {
    super();

    this.map = map;
  }

  protected map: Map;

  // hide the following intrinsics from the docs
  /**
   * @private
   */
  declare _eventedParent;
  /**
   * @private
   */
  declare _eventedParentData;
  /**
   * @private
   */
  declare _listeners;
  /**
   * @private
   */
  declare _oneTimeListeners;

  /**
   * @private
   */
  fire<T extends keyof MaplibreGlDirectionsEventType>(event: MaplibreGlDirectionsEventType[T]): this {
    event.target = this.map;
    return super.fire(event.type, event);
  }

  /**
   * Registers an event listener.
   */
  on<T extends keyof MaplibreGlDirectionsEventType>(type: T, listener: (ev: MaplibreGlDirectionsEventType[T]) => void) {
    return super.on(type, listener);
  }

  /**
   * Un-registers an event listener.
   */
  off<T extends keyof MaplibreGlDirectionsEventType>(type: T, listener: (e: MaplibreGlDirectionsEventType[T]) => void) {
    return super.off(type, listener);
  }

  /**
   * Registers an event listener to be invoked only once.
   */
  once<T extends keyof MaplibreGlDirectionsEventType>(
    type: T,
    listener: (e: MaplibreGlDirectionsEventType[T]) => void,
  ) {
    return super.once(type, listener);
  }
}

/**
 * Supported event types.
 */
export interface MaplibreGlDirectionsEventType {
  /**
   * Emitted after the waypoints are set using the {@link default.setWaypoints|`setWaypoints`} method.
   */
  setwaypoints: MaplibreGlDirectionsWaypointEvent;

  /**
   * Emitted when a waypoint is added.
   */
  addwaypoint: MaplibreGlDirectionsWaypointEvent;

  /**
   * Emitted when a waypoint is removed.
   */
  removewaypoint: MaplibreGlDirectionsWaypointEvent;

  /**
   * Emitted when a waypoint is moved. __Note__ that the event is not emitted if the waypoint has been dragged for an
   * amount of pixels less than specified by the {@link MapLibreGlDirectionsConfiguration.dragThreshold|`dragThreshold`}
   * configuration property.
   */
  movewaypoint: MaplibreGlDirectionsWaypointEvent;

  /**
   * Emitted when there appears an ongoing routing-request.
   */
  fetchroutesstart: MaplibreGlDirectionsRoutingEvent;

  /**
   * Emitted after the ongoing routing-request has finished.
   */
  fetchroutesend: MaplibreGlDirectionsRoutingEvent;
}

export interface MaplibreGlDirectionsEvent<TOrig = undefined> {
  type: keyof MaplibreGlDirectionsEventType;
  target: Map;
  originalEvent: TOrig;
}

export interface MaplibreGlDirectionsWaypointEventData {
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

export class MaplibreGlDirectionsWaypointEvent
  implements MaplibreGlDirectionsEvent<MapMouseEvent | MapTouchEvent | undefined>
{
  /**
   * @private
   */
  constructor(
    type: "setwaypoints" | "addwaypoint" | "removewaypoint" | "movewaypoint",
    originalEvent: MapMouseEvent | MapTouchEvent | undefined,
    data?: Partial<MaplibreGlDirectionsWaypointEventData>,
  ) {
    this.type = type;
    this.originalEvent = originalEvent;
    this.data = data;
  }

  type;
  target!: Map;
  originalEvent: MapMouseEvent | MapTouchEvent | undefined;
  data?: Partial<MaplibreGlDirectionsWaypointEventData>;
}

export interface MaplibreGlDirectionsRoutingEventData {
  /**
   * The server response's code.
   *
   * @see http://project-osrm.org/docs/v5.24.0/api/#responses
   */
  code: Directions["code"];
}

export class MaplibreGlDirectionsRoutingEvent implements MaplibreGlDirectionsEvent<MaplibreGlDirectionsWaypointEvent> {
  /**
   * @private
   */
  constructor(
    type: "fetchroutesstart" | "fetchroutesend",
    originalEvent: MaplibreGlDirectionsWaypointEvent,
    data?: Partial<MaplibreGlDirectionsRoutingEventData>,
  ) {
    this.type = type;
    this.originalEvent = originalEvent;
    this.data = data;
  }

  type;
  target!: Map;
  originalEvent: MaplibreGlDirectionsWaypointEvent;
  data?: Partial<MaplibreGlDirectionsRoutingEventData>;
}
