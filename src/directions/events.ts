import type { Map, MapMouseEvent, MapTouchEvent } from "maplibre-gl";
import type { Directions } from "./types";

/**
 * The base class that provides event functionality (`on`, `off`, `fire`).
 */
export class MapLibreGlDirectionsEvented {
  protected readonly map: Map;

  private listeners: ListenersStore = {};
  private oneTimeListeners: ListenersStore = {};

  constructor(map: Map) {
    this.map = map;
  }

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
    const oneTime = this.oneTimeListeners[type];
    if (oneTime && oneTime.length > 0) {
      // Clear the list *before* calling listeners.
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

    // This still works because .defaultPrevented exists on the base class, but it can only be *set* by the
    // CancelableEvent subclass.
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
 * Defines the function signature for an event listener.
 */
export type MapLibreGlDirectionsEventListener<T extends keyof MapLibreGlDirectionsEventType> = (
  event: MapLibreGlDirectionsEventType[T],
) => void;

/**
 * Internal type for storing listeners.
 */
type ListenersStore = Partial<{
  [T in keyof MapLibreGlDirectionsEventType]: MapLibreGlDirectionsEventListener<T>[];
}>;

/**
 * Base marker interface for all event data payloads.
 * Events with no data use this directly.
 */
export interface MapLibreGlDirectionsEventData {
  // Intentionally empty.
  // This ensures a common base type without allowing `any`.
}

/**
 * Data payload for the `addwaypoint` event.
 */
export interface MapLibreGlDirectionsAddWaypointData extends MapLibreGlDirectionsEventData {
  /** The index at which the waypoint was added. */
  index: number;
}

/**
 * Data payload for the `removewaypoint` event.
 */
export interface MapLibreGlDirectionsRemoveWaypointData extends MapLibreGlDirectionsEventData {
  /** The index of the waypoint that was removed. */
  index: number;
}

/**
 * Data payload for the `movewaypoint` event.
 */
export interface MapLibreGlDirectionsMoveWaypointData extends MapLibreGlDirectionsEventData {
  /** The index of the waypoint that was moved. */
  index: number;
  /**
   * The coordinates from which the waypoint was moved.
   */
  initialCoordinates?: [number, number];
}

/**
 * Data payload for routing-related events.
 */
export interface MapLibreGlDirectionsRoutingData extends MapLibreGlDirectionsEventData {
  /**
   * The server's response.
   * Only present for the `fetchroutesend` event.
   * Might be `undefined` if the request failed.
   */
  directions?: Directions;
}

// The "any" event type, used for the `originalEvent` property.
export type AnyMapLibreGlDirectionsEvent = MapLibreGlDirectionsEvent<
  keyof MapLibreGlDirectionsEventType,
  MapLibreGlDirectionsEventData
>;

/**
 * The base event object, containing all common logic.
 * This class is not intended to be instantiated directly.
 *
 * @template T - The event type string (e.g., "addwaypoint").
 * @template D - The data payload interface for this event type.
 */
export abstract class MapLibreGlDirectionsEvent<
  T extends keyof MapLibreGlDirectionsEventType,
  D extends MapLibreGlDirectionsEventData = MapLibreGlDirectionsEventData,
> {
  readonly type: T;
  target!: Map;
  originalEvent?: MapMouseEvent | MapTouchEvent | AnyMapLibreGlDirectionsEvent;
  data: D;

  readonly cancelable: boolean;
  protected _defaultPrevented: boolean = false;

  protected constructor(
    type: T,
    originalEvent: MapMouseEvent | MapTouchEvent | AnyMapLibreGlDirectionsEvent | undefined,
    data: D,
    cancelable: boolean, // Internal flag set by subclasses
  ) {
    this.type = type;
    this.originalEvent = originalEvent;
    this.data = data;
    this.cancelable = cancelable;
  }

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
 * It does NOT have a `preventDefault()` method.
 */
export class MapLibreGlDirectionsNonCancelableEvent<
  T extends keyof MapLibreGlDirectionsEventType,
  D extends MapLibreGlDirectionsEventData = MapLibreGlDirectionsEventData,
> extends MapLibreGlDirectionsEvent<T, D> {
  declare readonly cancelable: false;

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
}

/**
 * A cancelable event.
 * `preventDefault()` will stop the default action.
 */
export class MapLibreGlDirectionsCancelableEvent<
  T extends keyof MapLibreGlDirectionsEventType,
  D extends MapLibreGlDirectionsEventData = MapLibreGlDirectionsEventData,
> extends MapLibreGlDirectionsEvent<T, D> {
  declare readonly cancelable: true;

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
   * This event is **cancelable**.
   *
   * Fired from `_addWaypoint`.
   */
  addwaypoint: MapLibreGlDirectionsCancelableEvent<"addwaypoint", MapLibreGlDirectionsAddWaypointData>;

  /**
   * Fired *before* a waypoint is removed.
   * This event is **cancelable**.
   *
   * Fired from `_removeWaypoint`.
   */
  removewaypoint: MapLibreGlDirectionsCancelableEvent<"removewaypoint", MapLibreGlDirectionsRemoveWaypointData>;

  /**
   * Fired *after* a waypoint has been moved by dragging.
   * This event is **not cancelable**.
   *
   * Fired from `onDragUp` and `liveRefresh`.
   */
  movewaypoint: MapLibreGlDirectionsNonCancelableEvent<"movewaypoint", MapLibreGlDirectionsMoveWaypointData>;

  /**
   * Fired *after* waypoints are set programmatically.
   * This event is **not cancelable**.
   *
   * Fired from `setWaypoints`.
   */
  setwaypoints: MapLibreGlDirectionsNonCancelableEvent<"setwaypoints", MapLibreGlDirectionsEventData>;

  /**
   * Fired *after* waypoints' bearings are rotated.
   * This event is **not cancelable**.
   *
   * Fired from `waypointsBearings` setter.
   */
  rotatewaypoints: MapLibreGlDirectionsNonCancelableEvent<"rotatewaypoints", MapLibreGlDirectionsEventData>;

  /**
   * Fired when a routing request is about to be made.
   * This event is **not cancelable**.
   *
   * Fired from `fetchDirections`.
   */
  fetchroutesstart: MapLibreGlDirectionsNonCancelableEvent<"fetchroutesstart", MapLibreGlDirectionsEventData>;

  /**
   * Fired *after* a routing request has finished (successfully or not).
   * This event is **not cancelable**. Check `event.data.directions`
   * for the response.
   *
   * Fired from `fetchDirections`.
   */
  fetchroutesend: MapLibreGlDirectionsNonCancelableEvent<"fetchroutesend", MapLibreGlDirectionsRoutingData>;
}
