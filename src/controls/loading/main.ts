import { Map, IControl } from "maplibre-gl";
import { createApp } from "vue";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import LoadingControlComponent from "./LoadingControlComponent.vue";
import MapLibreGlDirections from "../../directions/main";
import {
  MapLibreGlDirectionsLoadingControlConfiguration,
  MapLibreGlDirectionsLoadingControlDefaultConfiguration,
} from "./types";

/**
 * Creates an instance of MapLibreGlDirectionsLoadingControl that can be added to the map using the `addControl` method.
 *
 * @example
 * ```typescript
 * map.addControl(new MapLibreGlDirectionsLoadingControl(new MapLibreGlDirections(map)));
 * ```
 */
export default class MapLibreGlDirectionsLoadingControl implements IControl {
  constructor(
    directions: MapLibreGlDirections,
    configuration?: Partial<MapLibreGlDirectionsLoadingControlConfiguration>,
  ) {
    this.directions = directions;
    this.configuration = Object.assign({}, MapLibreGlDirectionsLoadingControlDefaultConfiguration, configuration);
  }

  private controlElement!: HTMLElement;
  private directions: MapLibreGlDirections;
  private configuration: MapLibreGlDirectionsLoadingControlConfiguration;

  /**
   * @private
   */
  onAdd(map: Map) {
    this.controlElement = document.createElement("div");

    createApp(LoadingControlComponent, {
      directions: this.directions,
      configuration: this.configuration,
    }).mount(this.controlElement);

    return this.controlElement;
  }

  /**
   * @private
   */
  onRemove() {
    this.controlElement.remove();
  }
}
