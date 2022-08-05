import type { ModuleNamespace } from "vite/types/hot";
import Menu from "./Menu.svelte";

export const examples = Object.entries(import.meta.glob<ModuleNamespace>("./examples/**.svelte", { eager: true })).map(
  ([path, component]) => {
    const parsedFileName = path.match(/\/(\d+)\s([^/]+)\./);
    const index = parseInt(parsedFileName[1]);
    const name = parsedFileName[2];

    return {
      path: "/examples/" + name.toLowerCase().replaceAll(/\s/g, "-"),
      index,
      name: name,
      component: component,
      sourceUrl: `https://github.com/maplibre/maplibre-gl-directions/tree/main/demo/src/${path}`,
    };
  },
);

const routes = {};

examples.forEach((example) => {
  routes[example.path] = example.component.default;
});

routes["*"] = Menu;

export { routes };
