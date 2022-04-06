import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],

  root: "demo",
  base: "/maplibre-gl-directions/",

  build: {
    outDir: "../docs",
  },
});
