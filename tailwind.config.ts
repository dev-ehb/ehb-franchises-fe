import type { Config } from 'tailwindcss';

/**
 * Shared EHB design tokens. The `primary` blue mirrors the PSS admin palette so
 * the franchise dashboards feel like part of the same product family.
 */
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // `primary` (blue) is kept so the existing dashboards stay on-brand
        // with the PSS admin family. The public landing page uses `brand` (green).
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Forest-green brand palette (reference-inspired marketing look).
        brand: {
          50: '#edf7f1',
          100: '#d2ecdc',
          200: '#a6d9bb',
          300: '#71bf95',
          400: '#43a373',
          500: '#2b885b',
          600: '#1f6e47',
          700: '#1a5739',
          800: '#163f2c',
          900: '#0f2e21',
          950: '#0a2018',
        },
        // Pastel accents used on feature cards / floating UI (peach, coral, lavender).
        lav:   { soft: '#ece3fb', DEFAULT: '#c8aef2', ink: '#4a2f7d' },
        coral: { soft: '#fbe2d6', DEFAULT: '#ef855a', ink: '#7c3a20' },
        peach: { soft: '#fbeadd', DEFAULT: '#f4c69e' },
        cream: '#f6f4ee',
        ink:   '#0f1a14',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,.06), 0 1px 2px -1px rgba(0,0,0,.04)',
        soft: '0 2px 8px -2px rgba(16,46,33,.10), 0 8px 24px -8px rgba(16,46,33,.12)',
        lift: '0 12px 32px -10px rgba(16,46,33,.22)',
        float: '0 16px 40px -12px rgba(16,46,33,.28)',
      },
      keyframes: {
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
