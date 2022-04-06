import {
  f as c,
  k as d,
  l as _,
  o as s,
  c as a,
  g as e,
  a as p,
  w as u,
  m as h,
  n as f,
  p as r,
  i as m,
  r as v,
} from "./vendor.291e7853.js";
import { _ as b } from "./index.4cc48e26.js";
const x = { class: "basis-1/3 overflow-hidden shadow-xl" },
  k = { class: "h-full flex flex-col bg-inherit overflow-x-hidden overflow-y-auto" },
  g = { key: 0, class: "p-10 pb-5 flex justify-between gap-5 sticky top-0 bg-inherit" },
  y = m("Back to Menu"),
  w = ["href"],
  B = { class: "break-all" },
  C = c({
    props: { noHeader: { type: Boolean } },
    setup(n) {
      const o = n,
        l = d(
          `https://github.com/smellyshovel/maplibre-gl-directions/tree/main/demo/src/${
            _().matched[0].meta.originPath
          }}`,
        );
      return (t, N) => {
        const i = v("router-link");
        return (
          s(),
          a("aside", x, [
            e("div", k, [
              o.noHeader
                ? h("", !0)
                : (s(),
                  a("header", g, [
                    p(i, { to: { name: "Menu" } }, { default: u(() => [y]), _: 1 }),
                    e("a", { href: l.value }, "Source", 8, w),
                  ])),
              e(
                "article",
                { class: f(["p-10 flex flex-col gap-3", { "pt-0": !o.noHeader }]) },
                [e("h1", B, [r(t.$slots, "title", {}, void 0, !0)]), r(t.$slots, "default", {}, void 0, !0)],
                2,
              ),
            ]),
          ])
        );
      };
    },
  });
var A = b(C, [["__scopeId", "data-v-3f9b3770"]]);
export { A };
