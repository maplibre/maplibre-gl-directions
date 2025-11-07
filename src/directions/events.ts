import type { Map, MapMouseEvent, MapTouchEvent } from "maplibre-gl";
import type { Directions } from "./types";

/**
 * The base class that provides event functionality (`on`, `off`, `once` and `fire`).
 */
export class MapLibreGlDirectionsEvented {
  constructor(map: Map) {
    this.map = map;
  }

  protected readonly map: Map;

  private listeners: ListenersStore = {};
  private oneTimeListeners: ListenersStore = {};

  /**
   * Fires an event and notifies all listeners.
   *
   * @param event The event object to fire.
   * @returns `false` if the event's `preventDefault()` method was called, `true` otherwise.
   */
  protected fire<T extends keyof MapLibreGlDirectionsEventType>(event: MapLibreGlDirectionsEventType[T]): boolean {
    event.target = this.map;

    const type: T = event.type as T;

    // Fire one-time listeners.
    const oneTime = { ...this.oneTimeListeners[type] };
    if (oneTime && oneTime.length > 0) {
      // Clear the original listeners map.
      this.oneTimeListeners[type] = [];

      // Fire all listeners that were in the list.
      oneTime.forEach((listener) => {
        listener(event);
      });
    }

    // Fire persistent listeners.
    const persistent = this.listeners[type];
    if (persistent) {
      // Iterate over a copy in case listeners remove themselves (`off`).
      [...persistent].forEach((listener) => {
        listener(event);
      });
    }

    // Callers can check the method's result to act accordingly when it's needed to cancel some operation as a result of
    // default action being prevented.
    return !event.defaultPrevented;
  }

  /**
   * Registers an event listener.
   *
   * @param type The event type to listen for.
   * @param listener The listener function.
   * @returns `this` for method chaining.
   */
  on<T extends keyof MapLibreGlDirectionsEventType>(type: T, listener: MapLibreGlDirectionsEventListener<T>) {
    this.listeners[type] = this.listeners[type] ?? [];
    this.listeners[type]!.push(listener);

    return this;
  }

  /**
   * Un-registers an event listener.
   *
   * @param type The event type.
   * @param listener The listener function to remove.
   * @returns `this` for method chaining.
   */
  off<T extends keyof MapLibreGlDirectionsEventType>(type: T, listener: MapLibreGlDirectionsEventListener<T>) {
    const index = this.listeners[type]?.indexOf(listener);
    if (index !== undefined && index > -1) {
      this.listeners[type]?.splice(index, 1);
    }

    return this;
  }

  /**
   * Registers an event listener to be invoked only once.
   *
   * @param type The event type to listen for.
   * @param listener The listener function.
   * @returns `this` for method chaining.
   */
  once<T extends keyof MapLibreGlDirectionsEventType>(type: T, listener: MapLibreGlDirectionsEventListener<T>) {
    this.oneTimeListeners[type] = this.oneTimeListeners[type] ?? [];
    this.oneTimeListeners[type]!.push(listener);

    return this;
  }
}

/**
 * Internal type for storing listeners.
 */
type ListenersStore = Partial<{
  [T in keyof MapLibreGlDirectionsEventType]: MapLibreGlDirectionsEventListener<T>[];
}>;

/**
 * Defines the function signature for an event listener.
 */
export type MapLibreGlDirectionsEventListener<T extends keyof MapLibreGlDirectionsEventType> = (
  event: MapLibreGlDirectionsEventType[T],
) => void;

/**
 * Base marker interface for all event data payloads.
 * Events with no data use this directly.
 */
export interface MapLibreGlDirectionsEventData {
  // Intentionally empty. This ensures a common base type without allowing `any`.
}

/**
 * Data payload for the `addwaypoint` and `beforeaddwaypoint` events.
 */
export interface MapLibreGlDirectionsAddWaypointData extends MapLibreGlDirectionsEventData {
  /** The index at which the waypoint was added. */
  index: number;
  /** The added waypoint's coordinate. */
  coordinates: [number, number];
}

/**
 * Data payload for the `removewaypoint` and `beforeremovewaypoint` events.
 */
export interface MapLibreGlDirectionsRemoveWaypointData extends MapLibreGlDirectionsEventData {
  /** The index of the waypoint that was removed. */
  index: number;
}

/**
 * Data payload for the `movewaypoint` and `beforemovewaypoint` events.
 */
export interface MapLibreGlDirectionsMoveWaypointData extends MapLibreGlDirectionsEventData {
  /** The index of the waypoint that was moved. */
  index: number;
  /** The coordinates from which the waypoint was moved. */
  initialCoordinates?: [number, number];
  /**
   * The coordinates to which the waypoint was moved.
   *
   * Only present for the `movewaypoint` event.
   */
  newCoordinates?: [number, number];
}

/**
 * Data payload for routing-related events.
 */
export interface MapLibreGlDirectionsRoutingData extends MapLibreGlDirectionsEventData {
  /**
   * The server's response.
   *
   * Only present for the `fetchroutesend` event, and even them might be `undefined` if the request has failed.
   */
  directions?: Directions;
}

/**
 * The "any" event type exported to be used by clients when they need a type for a generic event listener.
 *
 * This is also used for the `originalEvent` property.
 */
export type AnyMapLibreGlDirectionsEvent = MapLibreGlDirectionsEvent<
  keyof MapLibreGlDirectionsEventType,
  MapLibreGlDirectionsEventData
>;

/**
 * The base event object, containing all common logic.
 * This is an abstract class, and it's not intended to be instantiated directly.
 *
 * @template T - The event type string (e.g., "addwaypoint").
 * @template D - The data payload interface for this event type.
 */
export abstract class MapLibreGlDirectionsEvent<
  T extends keyof MapLibreGlDirectionsEventType,
  D extends MapLibreGlDirectionsEventData = MapLibreGlDirectionsEventData,
> {
  /**
   * @private
   */
  protected constructor(
    type: T,
    originalEvent: MapMouseEvent | MapTouchEvent | AnyMapLibreGlDirectionsEvent | undefined,
    data: D,
    cancelable: boolean, // Internal flag set by subclasses.
  ) {
    this.type = type;
    this.originalEvent = originalEvent;
    this.data = data;
    this._cancelable = cancelable;
  }

  readonly type: T;
  target!: Map;
  originalEvent?: MapMouseEvent | MapTouchEvent | AnyMapLibreGlDirectionsEvent;
  data: D;

  protected readonly _cancelable: boolean;
  protected _defaultPrevented: boolean = false;

  /**
   * Whether `preventDefault()` has been called on this event.
   * This is readable by the `fire` method.
   */
  get defaultPrevented(): boolean {
    return this._defaultPrevented;
  }
}

/**
 * A non-cancelable event.
 * It does NOT have the `preventDefault()` method.
 */
export class MapLibreGlDirectionsNonCancelableEvent<
  T extends keyof MapLibreGlDirectionsEventType,
  D extends MapLibreGlDirectionsEventData = MapLibreGlDirectionsEventData,
> extends MapLibreGlDirectionsEvent<T, D> {
  /**
   * @private
   */
  constructor(
    type: T,
    originalEvent: MapMouseEvent | MapTouchEvent | AnyMapLibreGlDirectionsEvent | undefined,
    data: D,
  ) {
    super(type, originalEvent, data, false); // Always pass `false`.
  }

  declare readonly _cancelable: false;
}

/**
 * A cancelable event.
 * `preventDefault()` will stop the default action.
 */
export class MapLibreGlDirectionsCancelableEvent<
  T extends keyof MapLibreGlDirectionsEventType,
  D extends MapLibreGlDirectionsEventData = MapLibreGlDirectionsEventData,
> extends MapLibreGlDirectionsEvent<T, D> {
  /**
   * @private
   */
  constructor(
    type: T,
    originalEvent: MapMouseEvent | MapTouchEvent | AnyMapLibreGlDirectionsEvent | undefined,
    data: D,
  ) {
    super(type, originalEvent, data, true); // Always pass `true`.
  }

  declare readonly _cancelable: true;

  /**
   * Prevents the default action associated with this event.
   */
  preventDefault() {
    // This sets the protected property on the base class.
    this._defaultPrevented = true;
  }
}

/**
 * A registry mapping all supported event type strings to their
 * corresponding event object type (Cancelable or NonCancelable).
 */
export interface MapLibreGlDirectionsEventType {
  /**
   * Fired *before* a waypoint is added.
   *
   * This event is **cancelable**.
   *
   * Fired from `_addWaypoint`.
   */
  beforeaddwaypoint: MapLibreGlDirectionsCancelableEvent<"beforeaddwaypoint", MapLibreGlDirectionsAddWaypointData>;

  /**
   * Fired *after* a waypoint is added and drawn on the map, but before a new routes fetch has been triggered.
   *
   * This event is **not** cancelable.
   *
   * Fired from `_addWaypoint`.
   */
  addwaypoint: MapLibreGlDirectionsNonCancelableEvent<"addwaypoint", MapLibreGlDirectionsAddWaypointData>;

  /**
   * Fired *before* a waypoint is removed.
   *
   * This event is **cancelable**.
   *
   * Fired from `_removeWaypoint`.
   */
  beforeremovewaypoint: MapLibreGlDirectionsCancelableEvent<
    "beforeremovewaypoint",
    MapLibreGlDirectionsRemoveWaypointData
  >;

  /**
   * Fired *after* a waypoint is removed and the changes are drawn on the map, but before a new routes fetch has been
   * triggered.
   *
   * This event is **not** cancelable.
   *
   * Fired from `_removeWaypoint`.
   */
  removewaypoint: MapLibreGlDirectionsNonCancelableEvent<"removewaypoint", MapLibreGlDirectionsRemoveWaypointData>;

  /**
   * Fired *before* a waypoint has been moved by dragging.
   *
   * This event is **cancelable**.
   *
   * Fired from `onDragDown`.
   */
  beforemovewaypoint: MapLibreGlDirectionsCancelableEvent<"beforemovewaypoint", MapLibreGlDirectionsMoveWaypointData>;

  /**
   * Fired *after* a waypoint has been moved by dragging.
   *
   * This event is **not** cancelable.
   *
   * Fired from `onDragUp` and `liveRefresh`.
   */
  movewaypoint: MapLibreGlDirectionsNonCancelableEvent<"movewaypoint", MapLibreGlDirectionsMoveWaypointData>;

  /**
   * Fired right *before* a hoverpoint is created after starting to drag a routeline.
   *
   * This event is **cancelable**.
   *
   * Fired from `onMove`.
   */
  beforecreatehoverpoint: MapLibreGlDirectionsCancelableEvent<"beforecreatehoverpoint", MapLibreGlDirectionsEventData>;

  /**
   * Fired *after* waypoints are set programmatically.
   *
   * This event is **not** cancelable.
   *
   * Fired from `setWaypoints`.
   */
  setwaypoints: MapLibreGlDirectionsNonCancelableEvent<"setwaypoints", MapLibreGlDirectionsEventData>;

  /**
   * Fired *after* waypoints' bearings are rotated.
   *
   * This event is **not** cancelable.
   *
   * Fired from `waypointsBearings` setter.
   */
  rotatewaypoints: MapLibreGlDirectionsNonCancelableEvent<"rotatewaypoints", MapLibreGlDirectionsEventData>;

  /**
   * Fired when a routing request is about to be made.
   *
   * This event is  **cancelable**.
   *
   * Fired from `fetchDirections`.
   */
  fetchroutesstart: MapLibreGlDirectionsCancelableEvent<"fetchroutesstart", MapLibreGlDirectionsEventData>;

  /**
   * Fired *after* a routing request has finished (successfully or not).
   *
   * Check `event.data.directions` for the response.
   *
   * This event is **not** cancelable.
   *
   * Fired from `fetchDirections`.
   */
  fetchroutesend: MapLibreGlDirectionsNonCancelableEvent<"fetchroutesend", MapLibreGlDirectionsRoutingData>;
}
