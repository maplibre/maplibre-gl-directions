import Menu from "./Menu.svelte";
import type { ComponentType } from "svelte";

export const examples = Object.entries(import.meta.glob("./examples/**.svelte", { eager: true })).map(
  ([path, component]) => {
    const parsedFileName = path.match(/\/(\d+)\s([^/]+)\./)!;
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

const routes: Record<string, ComponentType> = {};

examples.forEach((example) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  routes[example.path] = example.component.default;
});

routes["*"] = Menu;

export { routes };
