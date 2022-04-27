import { Evented, Map, MapMouseEvent, MapTouchEvent } from "maplibre-gl";
import { Directions } from "./types";

export class MapLibreGlDirectionsEvented extends Evented {
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
  fire<T extends keyof MapLibreGlDirectionsEventType>(event: MapLibreGlDirectionsEventType[T]): this {
    event.target = this.map;
    return super.fire(event.type, event);
  }

  /**
   * Registers an event listener.
   */
  on<T extends keyof MapLibreGlDirectionsEventType>(type: T, listener: (ev: MapLibreGlDirectionsEventType[T]) => void) {
    return super.on(type, listener);
  }

  /**
   * Un-registers an event listener.
   */
  off<T extends keyof MapLibreGlDirectionsEventType>(type: T, listener: (e: MapLibreGlDirectionsEventType[T]) => void) {
    return super.off(type, listener);
  }

  /**
   * Registers an event listener to be invoked only once.
   */
  once<T extends keyof MapLibreGlDirectionsEventType>(
    type: T,
    listener: (e: MapLibreGlDirectionsEventType[T]) => void,
  ) {
    return super.once(type, listener);
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
   * Only presents when it's the {@link MapLibreGlDirectionsEventType.fetchroutesend|`fetchroutesend`} event.
   *
   * @see http://project-osrm.org/docs/v5.24.0/api/#responses
   */
  data?: MapLibreGlDirectionsRoutingEventData;
}
