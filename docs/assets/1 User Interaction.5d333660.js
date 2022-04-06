import {
  f as p,
  k as o,
  l as m,
  q as d,
  s as v,
  o as f,
  c as h,
  a as w,
  w as r,
  i as s,
  t as y,
  g as e,
  v as _,
  x as g,
  u as k,
  y as b,
  F as x,
} from "./vendor.291e7853.js";
import { A as C } from "./AppSidebar.cac49fd5.js";
import { m as D, s as M, M as N } from "./maplibre-gl-directions.es.126a2c32.js";
import "./index.4cc48e26.js";
const R = { class: "flex items-center gap-3" },
  V = e("strong", null, "Interactivity enabled", -1),
  B = e(
    "ul",
    null,
    [
      e("li", null, "Click somewhere on the map to add a waypoint"),
      e("li", null, "Click a waypoint to remove it and its related snappoint"),
      e("li", null, "Click a snappoint to remove it and its related waypoint"),
      e("li", null, "Drag a waypoint somewhere to move it"),
      e("li", null, "Drag a routeline somewhere to add a waypoint in-between the 2 nearest ones"),
      e("li", null, [
        s(" Click an alternative routeline to select it"),
        e("br"),
        e("small", null, [
          e("strong", null, "Note"),
          s(", there's usually no alternative routelines in the server response if there are more than 2 waypoints"),
        ]),
      ]),
    ],
    -1,
  ),
  E = p({
    setup(q) {
      const u = o(m().matched[0].name),
        a = o(),
        i = o();
      d(() => {
        const t = new D.Map({ container: i.value, style: M, center: [-74.1197632, 40.6974034], zoom: 11 });
        t.on("load", () => {
          (a.value = new N(t, { requestOptions: { alternatives: "true" } })), (a.value.interactive = !0);
        });
      });
      const l = v({
        get() {
          var t, n;
          return (n = (t = a.value) == null ? void 0 : t.interactive) != null ? n : !1;
        },
        set(t) {
          a.value && (a.value.interactive = t);
        },
      });
      return (t, n) => (
        f(),
        h(
          x,
          null,
          [
            w(C, null, {
              title: r(() => [s(y(u.value), 1)]),
              default: r(() => [
                e("label", R, [
                  _(
                    e(
                      "input",
                      {
                        "onUpdate:modelValue": n[0] || (n[0] = (c) => (b(l) ? (l.value = c) : null)),
                        type: "checkbox",
                      },
                      null,
                      512,
                    ),
                    [[g, k(l)]],
                  ),
                  V,
                ]),
                B,
              ]),
              _: 1,
            }),
            e("div", { ref_key: "mapRef", ref: i, class: "shadow-xl" }, null, 512),
          ],
          64,
        )
      );
    },
  });
export { E as default };
