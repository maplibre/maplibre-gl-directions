import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],

  root: "demo",

  build: {
    outDir: "demo/dist",
    emptyOutDir: false,
  },
});
