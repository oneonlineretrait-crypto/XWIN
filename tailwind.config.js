/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: '#070A12', surface: '#0D1220', elevated: '#131A2B', line: '#1F2839',
        paper: '#EEF2F8', muted: '#8A97AC',
        signal: { DEFAULT: '#1FD173', soft: '#0F3A28', deep: '#0B8F4D' },
        gold: { DEFAULT: '#F5B932', soft: '#3A2D0F' },
        alert: { DEFAULT: '#FF5C5C', soft: '#3A1517' },
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        body: ['"Manrope"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        num: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 0 rgba(255,255,255,.04) inset, 0 18px 40px -24px rgba(0,0,0,.9)',
        glow: '0 0 0 1px rgba(31,209,115,.35), 0 18px 45px -20px rgba(31,209,115,.45)',
      },
      keyframes: {
        fadeUp: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        pulseSoft: { '0%,100%': { opacity: '.45' }, '50%': { opacity: '1' } },
      },
      animation: { fadeUp: 'fadeUp .5s cubic-bezier(.22,1,.36,1) both', pulseSoft: 'pulseSoft 1.8s ease-in-out infinite' },
    },
  },
  plugins: [],
}
