import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import "./assets/styles/index.css";

const routes = [{ path: "/", name: "Menu", component: () => import("./Menu.vue") }];

export const examples = Object.entries(import.meta.glob("./examples/**.vue")).map(([path, component]) => {
  const name = path.match(/\/\d+\s([^/]+)\./)?.[1].toString() ?? "";

  return {
    path: "/" + name.toLowerCase().replaceAll(/\s/g, "-"),
    name: name,
    component: component as () => Promise<never>,
    meta: {
      originPath: path,
    },
  };
});

const router = createRouter({
  history: createWebHistory(),
  routes: routes.concat(examples),
});

createApp(App).use(router).mount("#app");
