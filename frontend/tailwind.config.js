/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Atmospheric base
        atmo: {
          bg:      '#eef3f2',   // Soft atmospheric mint-grey background
          surface: '#f8fafb',   // Cloud white surface
          mid:     '#e2eaec',   // Mist grey
          border:  '#c8d8db',   // Pale atmospheric border
          deep:    '#1a2e35',   // Deep atmospheric text
          muted:   '#5c7a82',   // Muted label text
        },
        // Sky blues
        sky: {
          pale:    '#daeef5',   // Pale sky tint
          DEFAULT: '#5a9db5',   // Sky blue
          deep:    '#2a6f8a',   // Deep sky
        },
        // Teal (primary accent)
        teal: {
          light:   '#4da8a9',   // Light teal
          DEFAULT: '#2a7a7b',   // Deep atmospheric teal
          dark:    '#1a5557',   // Darkest teal
        },
        // Mint / healthy green
        mint: {
          light:   '#a8dbc9',   // Light mint
          DEFAULT: '#4caf8a',   // Natural green
          dark:    '#2d7a5f',   // Dark green
        },
        // Warning amber
        amber: {
          light:   '#fef3c7',
          DEFAULT: '#d97706',
          dark:    '#92400e',
        },
        // Critical red
        critical: {
          light:   '#fde8e8',
          DEFAULT: '#c0392b',
          dark:    '#7b1c14',
        },
        // Anomaly score purple-ish muted
        score: {
          low:     '#4caf8a',
          medium:  '#d97706',
          high:    '#c0392b',
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
        glass:    '0 4px 24px 0 rgba(42,122,123,0.06), 0 1px 4px 0 rgba(26,46,53,0.04)',
        'glass-md': '0 8px 32px 0 rgba(42,122,123,0.1), 0 2px 8px 0 rgba(26,46,53,0.06)',
        'glass-lg': '0 16px 48px 0 rgba(42,122,123,0.14), 0 4px 16px 0 rgba(26,46,53,0.08)',
        glow:     '0 0 12px 2px rgba(76,175,138,0.25)',
        'glow-amber': '0 0 12px 2px rgba(217,119,6,0.3)',
        'glow-red':   '0 0 12px 2px rgba(192,57,43,0.3)',
        'glow-teal':  '0 0 16px 4px rgba(42,122,123,0.2)',
        inner:    'inset 0 1px 3px 0 rgba(26,46,53,0.08)',
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
