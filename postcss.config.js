/** @type {import('postcss').Config} */
module.exports = {
  plugins: {
    tailwindcss: {}, // ← v3 はこれで OK
    autoprefixer: {},
  },
};
