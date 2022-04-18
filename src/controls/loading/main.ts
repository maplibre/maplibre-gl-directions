import { Map, IControl } from "maplibre-gl";
import { createApp } from "vue";
import LoadingControlComponent from "./LoadingControlComponent.vue";
import MapLibreGlDirections from "../../directions/main";

export default class MapLibreGlDirectionsLoadingControl implements IControl {
  constructor(directions: MapLibreGlDirections) {
    this.directions = directions;
  }

  private directions: MapLibreGlDirections;
  private controlElement!: HTMLElement;

  onAdd(map: Map) {
    this.controlElement = document.createElement("div");

    createApp(LoadingControlComponent, {
      directions: this.directions,
    }).mount(this.controlElement);

    return this.controlElement;
  }

  onRemove() {
    this.controlElement.remove();
  }
}
