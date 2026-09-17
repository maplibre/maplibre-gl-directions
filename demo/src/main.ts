import { setWorkerUrl } from "maplibre-gl";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import App from "./App.svelte";
import "./assets/styles/index.css";

setWorkerUrl(maplibreWorkerUrl);

export default new App({
  target: document.getElementById("app")!,
});
