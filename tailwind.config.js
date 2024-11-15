/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#28194b",
        // primary: '#7D49F8',
      },
    },
  },
  plugins: [require("@tailwindcss/aspect-ratio")],
};
