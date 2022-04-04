# Contributing Guide

1. Fork the repo
2. Clone the fork
3. Install the dependencies: `npm i`
4. Run `npm link`
5. Run `npm link maplibre-gl-directions`
6. Introduce some changes
7. Commit and push the changes
8. Create a PR

The steps 4 and 5 must be performed in order to have the `maplibre-gl-directions` as a local symlinked dependency, because the demo project uses not the sources of the lib, but the locally-built `dist` folder to make sure that the instance being tested is the same instance which is installed later as a dependence to other projects.

Because of the limitations of the `vue-tsc` however it's impossible for `vite` to constantly rebuild the dist types, so they're built only once each time the `npm run dev` or `npm run dev:lib` is run.

__Please, select the `dev` branch as a PR base.__

## NPM Scripts

* `npm run dev`

    Combines `npm run dev:lib`, `npm run dev:doc` and `npm run dev:demo` into a single call.
  * `npm run dev:lib` - starts a vite-powered development server for the library source files. Continuously rebuilds the contents of the `/dist` folder while you make changes to contents of the `/src` folder.
  * `npm run dev:doc` - starts a typedoc-powered development server for the API documentation. Continuously rebuilds the contents of the `/doc_dist` folder parsing the source code JSDoc-like comments.
  * `npm run dev:demo` - starts a Vite-powered development server for the Demo project. The Demo project targets the plugin from the `/dist` folder via a symlinked `maplibre-gl-directions` package.
* `npm run build`

    Combines `npm run build:lib`, `npm run build:doc` and `npm run build:demo` into a single call.
  * `npm run build:lib` - builds the `/src` folder contents and outputs the resulting es-module and its type declarations to the `/dist` folder.
  * `npm run build:doc` - builds the `/doc` folder contents using the TypeDoc compiler and outputs the result to the `/doc_dist` folder.
  * `npm run build:demo` - builds the Demo project and outputs the resulting static-site into the `/demo/dist` folder.

There's no build pipeline configured yet, so you don't have to build the library manually before creating the PR.