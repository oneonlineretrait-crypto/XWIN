/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: '#0B1220',
        paper: '#F6F5F1',
        signal: '#22C55E',
        gold: '#FBBF24',
        alert: '#EF4444'
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif']
      }
    },
  },
  plugins: [],
}
