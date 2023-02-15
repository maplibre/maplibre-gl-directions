import type { IControl } from "maplibre-gl";
import BearingsControlComponent from "./BearingsControl.svelte";
import { BearingsControlDefaultConfiguration } from "./types";
import type { BearingsControlConfiguration } from "./types";
import type MapLibreGlDirections from "../../directions/main";

/**
 * Creates an instance of BearingsControl that could be added to the map using the
 * {@link https://maplibre.org/maplibre-gl-js-docs/api/map/#map#addcontrol|`addControl`} method.
 *
 * @example
 * ```typescript
 * import MapLibreGlDirections, { BearingsControl } from "@maplibre/maplibre-gl-directions";
 * map.addControl(new BearingsControl(new MapLibreGlDirections(map)));
 * ```
 */
export default class BearingsControl implements IControl {
  constructor(directions: MapLibreGlDirections, configuration?: Partial<BearingsControlConfiguration>) {
    this.directions = directions;
    this.configuration = Object.assign({}, BearingsControlDefaultConfiguration, configuration);
  }

  private controlElement!: HTMLElement;
  private readonly directions: MapLibreGlDirections;
  private readonly configuration: BearingsControlConfiguration;

  /**
   * @private
   */
  onAdd() {
    this.controlElement = document.createElement("div");

    new BearingsControlComponent({
      target: this.controlElement,
      props: {
        directions: this.directions,
        configuration: this.configuration,
      },
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
