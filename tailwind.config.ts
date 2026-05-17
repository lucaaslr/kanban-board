import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Neutral surface scale (warm slate)
        surface: {
          0:   '#ffffff',
          50:  '#f8f8f9',
          100: '#f0f0f3',
          200: '#e2e3e8',
          600: '#6b7280',
          700: '#4b5563',
          800: '#1e1f26',
          900: '#131419',
          950: '#0c0d11',
        },
        // Indigo accent scale
        accent: {
          50:  '#eef2ff',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          900: '#312e81',
        },
        board: {
          50:  '#f7f7f8',
          100: '#ededf0',
          200: '#dcdde2',
          800: '#1e1f26',
          850: '#17181e',
          900: '#101116',
          950: '#0b0c11',
        },
      },
      animation: {
        'fade-in':    'fadeIn 0.15s ease-out',
        'slide-down': 'slideDown 0.18s ease-out',
        'scale-in':   'scaleIn 0.12s ease-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(-6px) scale(0.98)' },
          to:   { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
      },
      boxShadow: {
        card:         '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-md':    '0 4px 12px 0 rgb(0 0 0 / 0.10), 0 2px 4px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.12), 0 2px 6px -1px rgb(0 0 0 / 0.08)',
        'card-drag':  '0 16px 40px 0 rgb(0 0 0 / 0.18), 0 4px 12px -2px rgb(0 0 0 / 0.12)',
        overlay:      '0 20px 60px 0 rgb(0 0 0 / 0.22), 0 8px 20px -4px rgb(0 0 0 / 0.14)',
        col:          '0 2px 8px 0 rgb(0 0 0 / 0.06)',
      },
    },
  },
  plugins: [],
} satisfies Config
