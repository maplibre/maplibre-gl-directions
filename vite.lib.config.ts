import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: false,

    lib: {
      entry: "src/main.ts",
      name: "MaplibreGlDirections",
      formats: ["es"],
      fileName: "maplibre-gl-directions",
    },
  },
});
