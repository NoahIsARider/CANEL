/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#5B6CFF',
          hover: '#4A5BEB',
          soft: 'rgba(91,108,255,0.08)',
          border: 'rgba(91,108,255,0.2)',
        },
        canvas: 'var(--bg-canvas)',
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        line: 'var(--border-line)',
        ink: {
          DEFAULT: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'PingFang SC',
          'Hiragino Sans GB',
          'Microsoft YaHei',
          'Segoe UI',
          'sans-serif',
        ],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        'page-title': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'context-title': ['18px', { lineHeight: '26px', fontWeight: '600' }],
        'card-title': ['14px', { lineHeight: '20px', fontWeight: '600' }],
        body: ['13px', { lineHeight: '20px' }],
        caption: ['12px', { lineHeight: '18px' }],
      },
      borderRadius: {
        card: '6px',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        pop: 'var(--shadow-pop)',
        drag: 'var(--shadow-drag)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        fast: '150ms',
        standard: '300ms',
        slow: '500ms',
      },
      keyframes: {
        'fade-up-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'card-in': {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-dash': {
          '0%, 100%': { 'border-color': 'var(--border-dashed)' },
          '50%': { 'border-color': 'var(--border-dashed-active)' },
        },
      },
      animation: {
        'fade-up-in': 'fade-up-in 300ms cubic-bezier(0.16,1,0.3,1) both',
        'pop-in': 'pop-in 150ms cubic-bezier(0.16,1,0.3,1) both',
        'card-in': 'card-in 300ms cubic-bezier(0.16,1,0.3,1) both',
        'pulse-dash': 'pulse-dash 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
