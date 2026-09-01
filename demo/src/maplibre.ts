import * as maplibreModule from "maplibre-gl";
import maplibreWorkerUrl from "maplibre-gl-worker-url";

type MapLibreModule = typeof maplibreModule;

// MapLibre 5 exports its API as default, while MapLibre 6 exposes named exports.
const maplibregl = (Reflect.get(maplibreModule, "default") as MapLibreModule | undefined) ?? maplibreModule;

// Point MapLibre 6 at the worker file that Vite emits with the production demo.
if (maplibreWorkerUrl) maplibregl.setWorkerUrl(maplibreWorkerUrl);

export default maplibregl;
