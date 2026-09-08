/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        atmo: {
          bg:      'rgb(var(--color-atmo-bg) / <alpha-value>)',
          surface: 'rgb(var(--color-atmo-surface) / <alpha-value>)',
          mid:     'rgb(var(--color-atmo-mid) / <alpha-value>)',
          border:  'rgb(var(--color-atmo-border) / <alpha-value>)',
          deep:    'rgb(var(--color-atmo-deep) / <alpha-value>)',
          muted:   'rgb(var(--color-atmo-muted) / <alpha-value>)',
        },
        sky: {
          pale:    'rgb(var(--color-sky-pale) / <alpha-value>)',
          DEFAULT: 'rgb(var(--color-sky) / <alpha-value>)',
          deep:    'rgb(var(--color-sky-deep) / <alpha-value>)',
        },
        teal: {
          light:   'rgb(var(--color-teal-light) / <alpha-value>)',
          DEFAULT: 'rgb(var(--color-teal) / <alpha-value>)',
          dark:    'rgb(var(--color-teal-dark) / <alpha-value>)',
        },
        mint: {
          light:   'rgb(var(--color-mint-light) / <alpha-value>)',
          DEFAULT: 'rgb(var(--color-mint) / <alpha-value>)',
          dark:    'rgb(var(--color-mint-dark) / <alpha-value>)',
        },
        amber: {
          light:   'rgb(var(--color-amber-light) / <alpha-value>)',
          DEFAULT: 'rgb(var(--color-amber) / <alpha-value>)',
          dark:    'rgb(var(--color-amber-dark) / <alpha-value>)',
        },
        critical: {
          light:   'rgb(var(--color-critical-light) / <alpha-value>)',
          DEFAULT: 'rgb(var(--color-critical) / <alpha-value>)',
          dark:    'rgb(var(--color-critical-dark) / <alpha-value>)',
        },
        score: {
          low:     'rgb(var(--color-mint) / <alpha-value>)',
          medium:  'rgb(var(--color-amber) / <alpha-value>)',
          high:    'rgb(var(--color-critical) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': '0.625rem',
        xs:    '0.75rem',
        sm:    '0.8125rem',
        base:  '0.875rem',
        lg:    '1rem',
        xl:    '1.125rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '1.875rem',
        '5xl': '2.25rem',
        '6xl': '3rem',
      },
      letterSpacing: {
        widest: '0.2em',
        wider:  '0.12em',
        wide:   '0.06em',
      },
      boxShadow: {
        glass:    '0 4px 24px 0 rgba(0,0,0,0.4), 0 1px 4px 0 rgba(20,184,166,0.15)',
        'glass-md': '0 8px 32px 0 rgba(0,0,0,0.5), 0 2px 8px 0 rgba(20,184,166,0.2)',
        'glass-lg': '0 16px 48px 0 rgba(0,0,0,0.6), 0 4px 16px 0 rgba(20,184,166,0.25)',
        glow:     '0 0 12px 2px rgba(34,197,94,0.4)',
        'glow-amber': '0 0 12px 2px rgba(234,179,8,0.4)',
        'glow-red':   '0 0 15px 4px rgba(239,68,68,0.5)',
        'glow-teal':  '0 0 16px 4px rgba(20,184,166,0.4)',
        inner:    'inset 0 1px 3px 0 rgba(0,0,0,0.5)',
      },
      backdropBlur: {
        xs: '2px',
        sm: '8px',
        DEFAULT: '12px',
        lg: '20px',
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        DEFAULT: '8px',
        md: '10px',
        lg: '14px',
        xl: '18px',
        '2xl': '24px',
      },
      animation: {
        'pulse-slow':   'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'breathe':      'breathe 3s ease-in-out infinite',
        'fade-up':      'fadeUp 0.4s ease-out forwards',
        'fade-in':      'fadeIn 0.3s ease-out forwards',
        'slide-right':  'slideRight 0.25s ease-out forwards',
        'jump':         'jump 0.4s ease-out',
        'glow-pulse':   'glowPulse 2s ease-in-out infinite',
        'shimmer':      'shimmer 1.5s infinite',
        'count-up':     'countUp 0.6s ease-out forwards',
        'draw-line':    'drawLine 1s ease-out forwards',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.6', transform: 'scale(0.92)' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(14px)', filter: 'blur(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideRight: {
          '0%':   { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        jump: {
          '0%':   { transform: 'scale(1) translateY(0)' },
          '30%':  { transform: 'scale(1.04) translateY(-4px)' },
          '60%':  { transform: 'scale(0.98) translateY(0)' },
          '100%': { transform: 'scale(1) translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 6px 1px rgba(76,175,138,0.2)' },
          '50%':      { boxShadow: '0 0 18px 4px rgba(76,175,138,0.45)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        drawLine: {
          '0%':   { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};
