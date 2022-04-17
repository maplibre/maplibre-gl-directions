import { Evented, Map, MapMouseEvent, MapTouchEvent } from "maplibre-gl";

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
  addwaypoint: MaplibreGlDirectionsWaypointEvent;
  removewaypoint: MaplibreGlDirectionsEventType;
};

export interface MaplibreGlDirectionsEvent<TOrig = undefined> {
  type: keyof MaplibreGlDirectionsEventType;
  target: Map;
  originalEvent: TOrig;
}

export class MaplibreGlDirectionsWaypointEvent
  implements MaplibreGlDirectionsEvent<MapMouseEvent | MapTouchEvent | undefined>
{
  constructor(
    type: "addwaypoint" | "removewaypoint",
    originalEvent: MapMouseEvent | MapTouchEvent | undefined,
    index: number,
  ) {
    this.type = type;
    this.originalEvent = originalEvent;
    this.index = index;
  }

  type;
  target!: Map;
  originalEvent: MapMouseEvent | MapTouchEvent | undefined;
  index: number;
}
