import { resolve } from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],

  root: resolve(__dirname, "example"),

  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,

    lib: {
      entry: resolve(__dirname, "src/main.ts"),
      name: "maplibre-gl-directions",
      formats: ["es"],
      fileName: "maplibre-gl-directions",
    },
  },
});
