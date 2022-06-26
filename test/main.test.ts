import { test, expect } from "vitest";
import maplibregl from "maplibre-gl";
test("test", () => {
  const container = document.createElement("div");

  const map = new maplibregl.Map({
    container,
    style: "https://demotiles.maplibre.org/style.json",
  });
});
