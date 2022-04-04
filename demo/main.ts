import { createApp } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";
import App from "./App.vue";
import "./index.css";

const Default = () => import("./views/Default.vue");
const Custom = () => import("./views/Custom.vue");

const routes = [
  { path: "/", component: Default },
  { path: "/custom", component: Custom },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

createApp(App).use(router).mount("#app");
