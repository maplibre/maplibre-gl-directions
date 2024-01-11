import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { resolve } from "path";

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
    },
  },
});
