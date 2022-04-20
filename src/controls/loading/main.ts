import { Map, IControl } from "maplibre-gl";
import { createApp } from "vue";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import LoadingControlComponent from "./LoadingControlComponent.vue";
import MapLibreGlDirections from "../../directions/main";
import { LoadingControlConfiguration, LoadingControlDefaultConfiguration } from "./types";

/**
 * Creates an instance of LoadingControl that could be added to the map using the
 * {@link https://maplibre.org/maplibre-gl-js-docs/api/map/#map#addcontrol|`addControl`} method.
 *
 * @example
 * ```typescript
 * import MapLibreGlDirections, { LoadingControl } from "@maplibre/maplibre-gl-directions";
 * map.addControl(new LoadingControl(new MapLibreGlDirections(map)));
 * ```
 */
export default class LoadingControl implements IControl {
  constructor(directions: MapLibreGlDirections, configuration?: Partial<LoadingControlConfiguration>) {
    this.directions = directions;
    this.configuration = Object.assign({}, LoadingControlDefaultConfiguration, configuration);
  }

  private controlElement!: HTMLElement;
  private directions: MapLibreGlDirections;
  private configuration: LoadingControlConfiguration;

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
