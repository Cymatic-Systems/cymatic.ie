module.exports = {
  purge: ["./templates/**/*.html", "./theme/**/*.html"],
  theme: {},
  variants: {},
  plugins: [
      require('@tailwindcss/typography'),
  ]
};
