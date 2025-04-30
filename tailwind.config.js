/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"], // ← App Router 以下を全部見る
  theme: {
    extend: {
      colors: {
        primary: "#4f46e5",
      },
    },
  },
  plugins: [],
};
