import type { Map, IControl } from "maplibre-gl";
import LoadingIndicatorControlComponent from "./LoadingIndicatorControl.svelte";
import { LoadingIndicatorControlDefaultConfiguration } from "./types";
import type { LoadingIndicatorControlConfiguration } from "./types";
import type MapLibreGlDirections from "../../directions/main";

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
  constructor(directions: MapLibreGlDirections, configuration?: Partial<LoadingIndicatorControlConfiguration>) {
    this.directions = directions;
    this.configuration = Object.assign({}, LoadingIndicatorControlDefaultConfiguration, configuration);
  }

  private controlElement!: HTMLElement;
  private directions: MapLibreGlDirections;
  private configuration: LoadingIndicatorControlConfiguration;

  /**
   * @private
   */
  onAdd(map: Map) {
    this.controlElement = document.createElement("div");

    new LoadingIndicatorControlComponent({
      target: this.controlElement,
      props: { directions: this.directions, configuration: this.configuration },
    });

    return this.controlElement;
  }

  /**
   * @private
   */
  onRemove() {
    this.controlElement.remove();
  }
}
