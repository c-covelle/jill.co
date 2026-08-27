/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-dark': '#0A0E1A',
        'card-bg': '#121829',
        'card-border': '#1C253D',
        gold: {
          DEFAULT: '#E5B842',
          hover: '#F2C94C',
          muted: 'rgba(229, 184, 66, 0.15)',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}