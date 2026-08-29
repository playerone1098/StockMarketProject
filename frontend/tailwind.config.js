/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#10b981', // Emerald green
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        'navy': {
          50: '#f4f6fa',
          100: '#e9edf5',
          200: '#cbd5e8',
          300: '#9fb3d5',
          400: '#6c8bbd',
          500: '#47659f',
          600: '#374e83',
          700: '#2e3f6b',
          800: '#293559',
          900: '#1e253f',
          950: '#0f1322', // Deep navy
        }
      }
    },
  },
  plugins: [],
}
