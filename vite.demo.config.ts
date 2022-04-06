import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],

  root: "demo",

  build: {
    base: "/maplibre-gl-directions/",
    outDir: "../docs",
  },
});
