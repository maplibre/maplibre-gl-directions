# Contributing Guide

1. Fork the repo
2. Clone the fork
3. Install the dependencies: `npm i`
4. Run `npm link`
5. Run `npm link maplibre-gl-directions`
6. Run `npm run build:lib`
7. Introduce some changes (see the section below)
8. Make sure the `npm run build` passes
9. Commit and push the changes
10. Create a PR

The steps 4 and 5 must be performed in order to have the `maplibre-gl-directions` as a local symlinked dependency, because the Demo project uses not the library sources, but the locally-built `/dist` folder to make sure that the instance being tested is the same instance which is deployed to the end user.

**Please, select the `dev` branch as a PR base.**

## Project Structure

The source files of the library itself are located under the `/src` folder. The `/src/main.ts` is the main entry point. The `/src/directions` folder contains everything related to the plugin's main purpose. The `/src/control` folder contains all the UI-Control-related source code (is currently WIP).

TypeDoc is responsible for building all the API documentation. The API documentation is built from the library sources and from the files located under the `/doc` folder.

The Demo project's source files are located under the `/demo` folder. See its README for more information.

## Making Changes

_All the processes mentioned in this section are described in more detail in the section below._

Changes to the library sources should be introduced while there's a running `dev:lib` process. You may also want to have a running `dev:doc` process to see how correctly your doc-comments are parsed. Notice however that `dev:doc` does not serve the built documentation static-website somewhere, it just continuously rebuilds it.

The Demo project might be used as a test-stand while working on the library sources. The `dev:demo` process serves the demo project at `localhost:3000` (by default). The Demo project uses the built `/dist` folder to refer to the library (instead of using sources from the `/src` directly), so you may also want to have a running `dev:lib` at the same time.

You may keep the any examples you add when creating a PR if you think the changes you were working on are worth a separate example. An additional example by itself (without modifying the library sources) is a good PR candidate as well. The only thing you should remember when introducing any changes to the Demo project is that they are about to be seen by any other person, a potential end-user, so don't go too crazy and provide human-readable explanations of what the example is really meant to show.

## NPM Scripts

- `npm run dev:lib` - starts a vite-powered development server for the library source files. Continuously rebuilds the contents of the `/dist` folder while you make changes to the `/src` folder. **Does not rebuild types!** Must be restarted in order to rebuild them.

- `npm run dev:doc` - continuously rebuilds the contents of the `/doc_dist` folder parsing comments inside the `/src` folder.

- `npm run dev:demo` - starts a vite-powered development server for the Demo project. The Demo project targets the library from the `/dist` folder via a symlinked `maplibre-gl-directions` package.

- `npm run build` - Combines `npm run format`, `npm run build:lib`, `npm run build:doc` and `npm run build:demo` into a single call.

  1. `npm run format` - lints (with `eslint --fix`) and formats (with `prettier --write`) all the necessary project source files.

  2. `npm run build:lib` - builds the library (the `/src` folder contents) and outputs the resulting es-module and its type declarations into the `/dist` folder.

  3. `npm run build:doc` - builds the documentation (the `/doc` folder contents) using the TypeDoc compiler and outputs the resulting static-website into the `/doc_dist` folder.

  4. `npm run build:demo` - builds the Demo project (the `/demo` folder contents) and outputs the resulting static-website into the `/demo/dist` folder.