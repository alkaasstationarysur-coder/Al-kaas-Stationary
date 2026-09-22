/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        tadaruk: {
          bg: '#080E21',
          card: '#0F1A36',
          cardHover: '#15234A',
          border: '#1E2F5D',
          gold: '#E0A96D',
          goldLight: '#F3DFC1',
          goldDark: '#B88246',
          emerald: '#10B981',
          emeraldDark: '#064E3B',
          amber: '#F59E0B',
          navy: '#0B132B',
          slate: '#1C2541',
          muted: '#94A3B8',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        arabic: ['"Amiri"', 'serif'],
        bangla: ['"Hind Siliguri"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
