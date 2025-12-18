/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: ['class', '.dark'],
  theme: {
    extend: {
      colors: {
        first: '#2c2b2d',
        second: '#555555',
        third: '#495da7',
        fourth: '#f7f7f7',
        fifth: '#e6e6e6',
      },
    },
  },
  plugins: [],
};
