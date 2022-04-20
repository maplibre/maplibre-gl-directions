import { Map, IControl } from "maplibre-gl";
import { createApp } from "vue";
import LoadingControlComponent from "./LoadingControlComponent.vue";
import MapLibreGlDirections from "../../directions/main";
import {
  MapLibreGlDirectionsLoadingControlConfiguration,
  MapLibreGlDirectionsLoadingControlDefaultConfiguration,
} from "./types";

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
  configuration: MapLibreGlDirectionsLoadingControlConfiguration;

  onAdd(map: Map) {
    this.controlElement = document.createElement("div");

    createApp(LoadingControlComponent, {
      directions: this.directions,
      configuration: this.configuration,
    }).mount(this.controlElement);

    return this.controlElement;
  }

  onRemove() {
    this.controlElement.remove();
  }
}
