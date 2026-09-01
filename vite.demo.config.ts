import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { createRequire } from "module";
import { resolve } from "path";

const require = createRequire(import.meta.url);

// Vite must pre-bundle v5, but pre-bundling v6 turns its worker URL into the wrong value.
const maplibreMajorVersion = Number.parseInt(require("maplibre-gl/package.json").version.split(".")[0], 10);

// MapLibre 6 needs its separate worker bundled into the production demo.
const maplibreWorkerUrlModule =
  maplibreMajorVersion >= 6
    ? `${require.resolve("maplibre-gl/dist/maplibre-gl-worker.mjs")}?worker&url`
    : resolve(__dirname, "./demo/src/maplibre-worker-url.ts");

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte({ configFile: "../svelte.config.cjs" })],

  root: "demo",

  build: {
    outDir: "../docs",
  },
  resolve: {
    alias: {
      src: resolve(__dirname, "./src"),
      "maplibre-gl-worker-url": maplibreWorkerUrlModule,
    },
  },

  optimizeDeps: maplibreMajorVersion >= 6 ? { exclude: ["maplibre-gl", "maplibre-gl-worker-url"] } : undefined,
});
