import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte({ configFile: "../svelte.config.cjs" })],

  root: "demo",

  build: {
    outDir: "../docs",
  },
});
