import { Event, Evented, Map, MapMouseEvent, MapTouchEvent } from "maplibre-gl";
import { Route, Snappoint } from "./types";

// console.log(new Event("test"));

export class MaplibreGlDirectionsEvented extends Evented {
  constructor() {
    super();
  }

  on<T extends keyof MaplibreGlDirectionsEventType>(type: T, listener: (ev: MaplibreGlDirectionsEventType[T]) => void) {
    return super.on(type, listener);
  }

  off<T extends keyof MaplibreGlDirectionsEventType>(
    type: T,
    listener: (ev: MaplibreGlDirectionsEventType[T]) => void,
  ) {
    return super.off(type, listener);
  }

  once<T extends keyof MaplibreGlDirectionsEventType>(
    type: T,
    listener: (ev: MaplibreGlDirectionsEventType[T]) => void,
  ) {
    return super.once(type, listener);
  }

  fire<T extends keyof MaplibreGlDirectionsEventType | Event>(event: T, properties?: any): this {
    return super.fire(event, properties);
  }
}

type MaplibreGlDirectionsEventType = {
  load: MaplibreGlDirectionsEvent;
  fetchdirections: MaplibreGlDirectionsRoutingEvent;
  addwaypoint: MaplibreGlDirectionsWaypointEvent;
};

export interface MaplibreGlDirectionsEvent<TOrig = undefined> {
  type: string;
  target: Map;
  originalEvent: TOrig;
}

export class MaplibreGlDirectionsRoutingEvent
  extends Event
  implements MaplibreGlDirectionsEvent<MapMouseEvent | MapTouchEvent | undefined>
{
  constructor(
    type: "fetchdirections",
    map: Map,
    originalEvent: MapMouseEvent | MapTouchEvent | undefined,
    data: {
      routes: Route[];
      snappoints: Snappoint[];
    },
  ) {
    super(type, data);
    this.originalEvent = originalEvent;
    this.target = map;
  }

  declare type: "addwaypoint" | "removewaypoint";

  target: Map;

  originalEvent: MapMouseEvent | MapTouchEvent | undefined;
}

export class MaplibreGlDirectionsWaypointEvent
  implements MaplibreGlDirectionsEvent<MapMouseEvent | MapTouchEvent | undefined>
{
  constructor(
    type: "addwaypoint" | "removewaypoint",
    map: Map,
    originalEvent: MapMouseEvent | MapTouchEvent | undefined,
    data?: any,
  ) {
    this.originalEvent = originalEvent;
    this.target = map;
  }

  declare type: "addwaypoint" | "removewaypoint";

  target: Map;

  originalEvent: MapMouseEvent | MapTouchEvent | undefined;
}
