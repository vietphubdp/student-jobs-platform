/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#38a9f6',
          500: '#0065c9',
          600: '#0054a6',
          700: '#004385',
          800: '#003569',
          900: '#00254d',
          DEFAULT: '#0065c9',
        },
        primary: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#38a9f6',
          500: '#0065c9',
          600: '#0054a6',
          700: '#004385',
          800: '#003569',
          900: '#00254d',
          DEFAULT: '#0065c9',
        },
      },
    },
  },
  plugins: [],
}
