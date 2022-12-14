module.exports = {
  parser: "@typescript-eslint/parser",
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
    extraFileExtensions: [".svelte"],
  },
  env: {
    es6: true,
    browser: true,
  },
  overrides: [
    {
      files: ["*.svelte"],
      processor: "svelte3/svelte3",
    },
  ],
  settings: {
    "svelte3/typescript": () => require("typescript"),
    // ignore style tags in Svelte because of Tailwind CSS
    // see https://github.com/sveltejs/eslint-plugin-svelte3/issues/70
    "svelte3/ignore-styles": () => true,
  },
  plugins: ["svelte3", "@typescript-eslint"],
  // ignore the node_modules folder and all the root-level .ts, .js and .cjs files because the custom eslint parser
  // doesn't know how to work with them for some reason and the stats.html file
  ignorePatterns: ["node_modules", "/*.ts", "/*.js", "/*.cjs", "/stats.html"],
};
