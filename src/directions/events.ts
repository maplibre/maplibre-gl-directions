import { Evented, Map, MapMouseEvent, MapTouchEvent } from "maplibre-gl";
import { Directions } from "./types";

export class MapLibreGlDirectionsEvented extends Evented {
  constructor(map: Map) {
    super();

    this.map = map;
  }

  protected map: Map;

  fire<T extends keyof MapLibreGlDirectionsEventType>(event: MapLibreGlDirectionsEventType[T]): this {
    event.target = this.map;
    return super.fire(event.type, event);
  }

  on<T extends keyof MapLibreGlDirectionsEventType>(type: T, listener: (ev: MapLibreGlDirectionsEventType[T]) => void) {
    return super.on(type, listener);
  }

  off<T extends keyof MapLibreGlDirectionsEventType>(type: T, listener: (e: MapLibreGlDirectionsEventType[T]) => void) {
    return super.off(type, listener);
  }

  once<T extends keyof MapLibreGlDirectionsEventType>(
    type: T,
    listener: (e: MapLibreGlDirectionsEventType[T]) => void,
  ) {
    return super.once(type, listener);
  }
}

type MapLibreGlDirectionsEventType = {
  setwaypoints: MapLibreGlDirectionsWaypointEvent;
  addwaypoint: MapLibreGlDirectionsWaypointEvent;
  removewaypoint: MapLibreGlDirectionsWaypointEvent;
  movewaypoint: MapLibreGlDirectionsWaypointEvent;
  fetchroutesstart: MapLibreGlDirectionsRoutingEvent;
  fetchroutesend: MapLibreGlDirectionsRoutingEvent;
};

export interface MapLibreGlDirectionsEvent<TOrig = undefined> {
  type: keyof MapLibreGlDirectionsEventType;
  target: Map;
  originalEvent: TOrig;
}

type MapLibreGlDirectionsWaypointEventData = Partial<{
  index: number;
  initialCoordinates: [number, number];
}>;

export class MapLibreGlDirectionsWaypointEvent
  implements MapLibreGlDirectionsEvent<MapMouseEvent | MapTouchEvent | undefined>
{
  constructor(
    type: "setwaypoints" | "addwaypoint" | "removewaypoint" | "movewaypoint",
    originalEvent: MapMouseEvent | MapTouchEvent | undefined,
    data?: MapLibreGlDirectionsWaypointEventData,
  ) {
    this.type = type;
    this.originalEvent = originalEvent;
    this.data = data;
  }

  type;
  target!: Map;
  originalEvent: MapMouseEvent | MapTouchEvent | undefined;
  data?: MapLibreGlDirectionsWaypointEventData;
}

type MapLibreGlDirectionsRoutingEventData = Partial<{
  code: Directions["code"];
}>;

export class MapLibreGlDirectionsRoutingEvent implements MapLibreGlDirectionsEvent<MapLibreGlDirectionsWaypointEvent> {
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
  data?: MapLibreGlDirectionsRoutingEventData;
}
