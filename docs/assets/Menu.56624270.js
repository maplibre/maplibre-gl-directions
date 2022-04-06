import { A as c } from "./AppSidebar.cac49fd5.js";
import { e as i } from "./index.4cc48e26.js";
import {
  f as d,
  o as t,
  c as a,
  a as o,
  w as s,
  g as m,
  F as r,
  h as p,
  u,
  i as n,
  j as f,
  r as x,
  t as _,
} from "./vendor.291e7853.js";
const h = n("Examples"),
  g = f(
    '<div class="p-10 flex flex-col gap-10 justify-center items-center rounded-3xl shadow-xl"><h1 class="text-center max-w-3xl">Please, choose an example at the sidebar on the left</h1><span class="text-slate-500">or navigate to</span><div class="flex flex-col gap-5 justify-center items-center"><a href="">GitHub</a><a href="">API Docs</a></div></div>',
    1,
  ),
  b = d({
    setup(v) {
      return (k, w) => {
        const l = x("router-link");
        return (
          t(),
          a(
            r,
            null,
            [
              o(
                c,
                { "no-header": "" },
                {
                  title: s(() => [h]),
                  default: s(() => [
                    m("ul", null, [
                      (t(!0),
                      a(
                        r,
                        null,
                        p(
                          u(i),
                          (e) => (
                            t(),
                            a("li", { key: e.name }, [
                              o(l, { to: { name: e.name } }, { default: s(() => [n(_(e.name), 1)]), _: 2 }, 1032, [
                                "to",
                              ]),
                            ])
                          ),
                        ),
                        128,
                      )),
                    ]),
                  ]),
                  _: 1,
                },
              ),
              g,
            ],
            64,
          )
        );
      };
    },
  });
export { b as default };
