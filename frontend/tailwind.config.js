/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        yellow: {
          DEFAULT: "#e7d393", // brand yellow
          light: "#f2e4b0",
          dark: "#bfa76a",
        },
        primary: {
          50: "#f0fdf4",
          500: "#56d85c",
          600: "#197a23",
          700: "#15803d",
        },
      },
      fontFamily: {
        'modern-negra': ['"Modern Negra"', 'sans-serif'],
        'jost': ['"Jost"', 'sans-serif'],
        'ibarra': ['"Ibarra Real Nova"', 'serif'],
        'serif-dm': ['"DM Serif Text"', 'serif'],
      },
      maxWidth: {
        '2xs': '16rem', // custom size
      },
      borderRadius: {
        '4xl': '2rem', // custom large radius
      },
    },
  },
  plugins: [],
};
