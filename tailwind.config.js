const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./demo/index.html", "./demo/**/*.{vue,ts}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Noto Sans", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};
