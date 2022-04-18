import { Evented, Map, MapMouseEvent, MapTouchEvent } from "maplibre-gl";
import { Directions } from "./types";

export class MaplibreGlDirectionsEvented extends Evented {
  constructor(map: Map) {
    super();

    this.map = map;
  }

  protected map: Map;

  fire<T extends keyof MaplibreGlDirectionsEventType>(event: MaplibreGlDirectionsEventType[T]): this {
    event.target = this.map;
    return super.fire(event.type, event);
  }

  on<T extends keyof MaplibreGlDirectionsEventType>(type: T, listener: (ev: MaplibreGlDirectionsEventType[T]) => void) {
    return super.on(type, listener);
  }

  off<T extends keyof MaplibreGlDirectionsEventType>(type: T, listener: (e: MaplibreGlDirectionsEventType[T]) => void) {
    return super.off(type, listener);
  }

  once<T extends keyof MaplibreGlDirectionsEventType>(
    type: T,
    listener: (e: MaplibreGlDirectionsEventType[T]) => void,
  ) {
    return super.once(type, listener);
  }
}

type MaplibreGlDirectionsEventType = {
  setwaypoints: MaplibreGlDirectionsWaypointEvent;
  addwaypoint: MaplibreGlDirectionsWaypointEvent;
  removewaypoint: MaplibreGlDirectionsWaypointEvent;
  movewaypoint: MaplibreGlDirectionsWaypointEvent;
  fetchroutesstart: MaplibreGlDirectionsRoutingEvent;
  fetchroutesend: MaplibreGlDirectionsRoutingEvent;
};

export interface MaplibreGlDirectionsEvent<TOrig = undefined> {
  type: keyof MaplibreGlDirectionsEventType;
  target: Map;
  originalEvent: TOrig;
}

type MaplibreGlDirectionsWaypointEventData = Partial<{
  index: number;
  initialCoordinates: [number, number];
}>;

export class MaplibreGlDirectionsWaypointEvent
  implements MaplibreGlDirectionsEvent<MapMouseEvent | MapTouchEvent | undefined>
{
  constructor(
    type: "setwaypoints" | "addwaypoint" | "removewaypoint" | "movewaypoint",
    originalEvent: MapMouseEvent | MapTouchEvent | undefined,
    data?: MaplibreGlDirectionsWaypointEventData,
  ) {
    this.type = type;
    this.originalEvent = originalEvent;
    this.data = data;
  }

  type;
  target!: Map;
  originalEvent: MapMouseEvent | MapTouchEvent | undefined;
  data?: MaplibreGlDirectionsWaypointEventData;
}

type MaplibreGlDirectionsRoutingEventData = Partial<{
  code: Directions["code"];
}>;

export class MaplibreGlDirectionsRoutingEvent implements MaplibreGlDirectionsEvent<MaplibreGlDirectionsWaypointEvent> {
  constructor(
    type: "fetchroutesstart" | "fetchroutesend",
    originalEvent: MaplibreGlDirectionsWaypointEvent,
    data?: MaplibreGlDirectionsRoutingEventData,
  ) {
    this.type = type;
    this.originalEvent = originalEvent;
    this.data = data;
  }

  type;
  target!: Map;
  originalEvent: MaplibreGlDirectionsWaypointEvent;
  data?: MaplibreGlDirectionsRoutingEventData;
}
