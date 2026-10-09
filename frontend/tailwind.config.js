/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Palette - White + Sky Blue + Natural Green Eco Theme
        sky: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7', // Primary Sky Blue
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        ecoGreen: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a', // Natural Green Accent
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        surface: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          hover: '#F1F5F9',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Kannada', 'Segoe UI', 'Roboto', 'sans-serif'],
        kannada: ['Noto Sans Kannada', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(2, 132, 199, 0.08), 0 2px 6px -1px rgba(22, 163, 74, 0.05)',
        'card': '0 10px 25px -5px rgba(0, 0, 0, 0.04), 0 8px 10px -6px rgba(0, 0, 0, 0.02)',
        'glass': '0 8px 32px 0 rgba(2, 132, 199, 0.12)',
      },
    },
  },
  plugins: [],
};
