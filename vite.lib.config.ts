import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte({ configFile: "svelte.config.cjs" }), visualizer()],

  build: {
    outDir: "dist",
    emptyOutDir: false,
    sourcemap: true,

    lib: {
      entry: "src/main.ts",
      formats: ["es", "cjs"],
    },

    rollupOptions: {
      output: {
        // Because the plugin provides both the default and named exports.
        exports: "named",
      },
    },
  },
});
