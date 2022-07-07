import { describe, it, expect } from "vitest";
import maplibregl, { type StyleSpecification } from "maplibre-gl";
import MapLibreGlDirections from "../src/main";
import style from "../demo/src/assets/map/style/style.json";

describe("public interface", () => {
  it("creates an instance", () => {
    function noOp() {}

    const map = new maplibregl.Map({
      container: document.createElement("div"),
      style: style as StyleSpecification,
    });

    const directions = new MapLibreGlDirections(map);
    expect(directions).toBeInstanceOf(MapLibreGlDirections);
  });
});
