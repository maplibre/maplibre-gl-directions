import { createApp } from "vue";
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import App from "./App.vue";
import "./assets/styles/index.css";

const routes = [
  {
    path: "/:pathMatch(.*)*",
    beforeEnter(to, from, next) {
      return next({ name: "Menu" });
    },
  },
  { path: "/", name: "Menu", component: () => import("./Menu.vue") },
] as RouteRecordRaw[];

export const examples = Object.entries(import.meta.glob("./examples/**.vue")).map(([path, component]) => {
  const name = path.match(/\/\d+\s([^/]+)\./)?.[1].toString() ?? "";
  console.log(path);

  return {
    path: "/examples/" + name.toLowerCase().replaceAll(/\s/g, "-"),
    name: name,
    component: component as () => Promise<never>,
    meta: {
      originPath: path,
    },
  };
});

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes.concat(examples),
});

createApp(App).use(router).mount("#app");
