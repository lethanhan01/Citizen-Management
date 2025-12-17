/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: ['class', '.dark'],
  theme: {
    extend: {
      colors: {
        first: '#2c2b2d',
        second: '#555555',
        third: '#95c6bd',
        fourth: '#f7f7f7',
        fifth: '#e2e2e2',
      },
    },
  },
  plugins: [],
};
