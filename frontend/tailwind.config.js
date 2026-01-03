/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        background: '#0c0c0f', // Main dark background
        card: '#0c0c0f',      // Card background
        'card-border': 'rgba(255, 255, 255, 0.1)',
        primary: '#0099ff',   // Blue accent from reference
      },
      backgroundImage: {
        'gradient-card': 'linear-gradient(259deg, #242424 0%, #101010 100%)',
        'gradient-glow': 'radial-gradient(55% 59% at 50% 50%, rgba(255, 255, 255, 0.03) 0%, rgb(0, 0, 0) 100%)',
        'gradient-button': 'linear-gradient(259deg, #242424 0%, #101010 100%)',
      },
      boxShadow: {
        'glow': '0px 0px 60px -15px rgba(255, 255, 255, 0.05)',
      }
    },
  },
  plugins: [],
}