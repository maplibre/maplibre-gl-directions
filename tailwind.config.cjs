const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./demo/index.html", "./demo/**/*.svelte", "./src/controls/**/*.svelte"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Noto Sans", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        accent: {
          400: "#7b32e7",
          500: "#6d26d7",
          600: "#6127b7",
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms")({
      strategy: "base",
    }),
  ],
};
