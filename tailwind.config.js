/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      width: {
        '70': '17.5rem', // 280px
      },
      marginLeft: {
        '70': '17.5rem', // 280px
      }
    },
  },
  plugins: [],
}