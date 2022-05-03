const sveltePreprocess = require("svelte-preprocess");

module.exports = {
  // consult https://github.com/sveltejs/svelte-preprocess for more information about preprocessors
  preprocess: [
    sveltePreprocess({
      typescript: true,
      postcss: true,
    }),
  ],
};
