/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc',
        surface: '#ffffff',
        primary: '#0f172a',
        secondary: '#64748b',
        accent: '#1e3a8a', // Deep minimalist cobalt blue
        tealAccent: '#0d9488', // Vibrant modern teal
        border: '#e2e8f0', // ultra-light gray
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
      letterSpacing: {
        tight: '-0.01em',
        tighter: '-0.02em',
      }
    },
  },
  plugins: [],
}
