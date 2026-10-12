/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Every color below resolves through a CSS custom property that
      // ThemeContext swaps on <html data-theme="...">, so `bg-panel`,
      // `text-ink`, etc. instantly track the active theme with zero
      // JS re-styling logic — just React re-rendering as normal.
      colors: {
        ink: 'var(--ink)',
        ink2: 'var(--ink-2)',
        slate: 'var(--slate)',
        line: 'var(--line)',
        bg: 'var(--bg)',
        panel: 'var(--panel)',
        panelBorder: 'var(--panel-border)',
        gold: 'var(--gold)',
        red: 'var(--red)',
        green: 'var(--green)',
        blue: 'var(--blue)',
<<<<<<< HEAD
        violet: 'var(--violet)',
=======
>>>>>>> 812d07d3ece33f5b5111abf9043bd9e94e12176a
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        pulse2: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
        shimmer: { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        pulse2: 'pulse2 2.5s infinite',
        pulseFast: 'pulse2 1s infinite',
        shimmer: 'shimmer 1.4s infinite',
      },
    },
  },
  plugins: [],
};
