import { o as m, c as f, a as p, r as d, b as _, d as h, e as g } from "./vendor.291e7853.js";
const v = function () {
  const n = document.createElement("link").relList;
  if (n && n.supports && n.supports("modulepreload")) return;
  for (const e of document.querySelectorAll('link[rel="modulepreload"]')) t(e);
  new MutationObserver((e) => {
    for (const o of e)
      if (o.type === "childList")
        for (const s of o.addedNodes) s.tagName === "LINK" && s.rel === "modulepreload" && t(s);
  }).observe(document, { childList: !0, subtree: !0 });
  function r(e) {
    const o = {};
    return (
      e.integrity && (o.integrity = e.integrity),
      e.referrerpolicy && (o.referrerPolicy = e.referrerpolicy),
      e.crossorigin === "use-credentials"
        ? (o.credentials = "include")
        : e.crossorigin === "anonymous"
        ? (o.credentials = "omit")
        : (o.credentials = "same-origin"),
      o
    );
  }
  function t(e) {
    if (e.ep) return;
    e.ep = !0;
    const o = r(e);
    fetch(e.href, o);
  }
};
v();
const y = "modulepreload",
  a = {},
  E = "/",
  i = function (n, r) {
    return !r || r.length === 0
      ? n()
      : Promise.all(
          r.map((t) => {
            if (((t = `${E}${t}`), t in a)) return;
            a[t] = !0;
            const e = t.endsWith(".css"),
              o = e ? '[rel="stylesheet"]' : "";
            if (document.querySelector(`link[href="${t}"]${o}`)) return;
            const s = document.createElement("link");
            if (
              ((s.rel = e ? "stylesheet" : y),
              e || ((s.as = "script"), (s.crossOrigin = "")),
              (s.href = t),
              document.head.appendChild(s),
              e)
            )
              return new Promise((l, u) => {
                s.addEventListener("load", l),
                  s.addEventListener("error", () => u(new Error(`Unable to preload CSS for ${t}`)));
              });
          }),
        ).then(() => n());
  };
var L = (c, n) => {
  const r = c.__vccOpts || c;
  for (const [t, e] of n) r[t] = e;
  return r;
};
const P = {},
  O = { class: "p-10 flex w-full gap-10" };
function x(c, n) {
  const r = d("router-view");
  return m(), f("main", O, [p(r)]);
}
var b = L(P, [["render", x]]);
const w = [
    {
      path: "/",
      name: "Menu",
      component: () =>
        i(
          () => import("./Menu.56624270.js"),
          [
            "assets/Menu.56624270.js",
            "assets/AppSidebar.cac49fd5.js",
            "assets/AppSidebar.88b70cc8.css",
            "assets/vendor.291e7853.js",
          ],
        ),
    },
  ],
  A = Object.entries({
    "./examples/1 User Interaction.vue": () =>
      i(
        () => import("./1 User Interaction.5d333660.js"),
        [
          "assets/1 User Interaction.5d333660.js",
          "assets/vendor.291e7853.js",
          "assets/AppSidebar.cac49fd5.js",
          "assets/AppSidebar.88b70cc8.css",
          "assets/maplibre-gl-directions.es.126a2c32.js",
          "assets/maplibre-gl-directions.es.4a9e6cca.css",
        ],
      ),
    "./examples/2 Programmatical Control.vue": () =>
      i(
        () => import("./2 Programmatical Control.6a643c7a.js"),
        [
          "assets/2 Programmatical Control.6a643c7a.js",
          "assets/vendor.291e7853.js",
          "assets/AppSidebar.cac49fd5.js",
          "assets/AppSidebar.88b70cc8.css",
          "assets/maplibre-gl-directions.es.126a2c32.js",
          "assets/maplibre-gl-directions.es.4a9e6cca.css",
        ],
      ),
  }).map(([c, n]) => {
    var t, e;
    const r = (e = (t = c.match(/\/\d+\s([^/]+)\./)) == null ? void 0 : t[1].toString()) != null ? e : "";
    return { path: "/" + r.toLowerCase().replaceAll(/\s/g, "-"), name: r, component: n, meta: { originPath: c } };
  }),
  C = _({ history: h(), routes: w.concat(A) });
g(b).use(C).mount("#app");
export { L as _, A as e };
