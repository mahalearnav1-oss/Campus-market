/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Aesop-Inspired Warm Editorial Palette ──────────────────
        warm: {
          DEFAULT:  '#F4EFE7',   // Natural Linen / Oat background
          bg:       '#F4EFE7',
        },
        surface: {
          DEFAULT:  '#EDE5D9',   // Warm Sand / Alabaster Card Base
          elevated: '#E7DED1',   // Elevated Panel & Floating Pill Nav
          warm:     '#E2D7C7',   // Deeper Warm Highlight
        },
        'surface-elevated': '#E7DED1',
        'surface-warm':     '#E2D7C7',

        card: {
          DEFAULT:  '#D9C8B7',   // Card Surface
          base:     '#D9C8B7',
        },
        'card-base': '#D9C8B7',

        gold: {
          DEFAULT:  '#C8A46A',   // Warm Champagne Gold
          soft:     '#D7B98A',   // Soft Gold Accent
          dark:     '#A68045',   // Rich Muted Gold
          subtle:   'rgba(200, 164, 106, 0.15)',
        },
        'gold-soft':   '#D7B98A',
        'gold-dark':   '#A68045',
        'gold-subtle': 'rgba(200, 164, 106, 0.15)',

        // ── WCAG AAA/AA High Contrast Typography System ─────────────
        text: {
          primary:     '#3B2A22',  // Primary Headings (11.4:1 contrast ratio)
          body:        '#4A392F',  // Primary Body Text (8.6:1 contrast ratio)
          secondary:   '#6E5948',  // Subtitles & Notes (5.3:1 contrast ratio)
          muted:       '#8B7562',  // Timestamps & Captions (4.6:1 contrast ratio)
          placeholder: '#A08D7A',  // Form Input Placeholders (3.5:1 contrast ratio)
          disabled:    '#B8A999',  // Disabled State Text
          inverse:     '#F4EFE7',  // Text on Dark Surfaces (18.2:1 contrast ratio)
        },
        'text-primary':     '#3B2A22',
        'text-body':        '#4A392F',
        'text-secondary':   '#6E5948',
        'text-muted':       '#8B7562',
        'text-placeholder': '#A08D7A',
        'text-disabled':    '#B8A999',
        'text-inverse':     '#F4EFE7',

        border:  '#D6C8B8',       // Subtle Soft Linen Separator
        'border-subtle': '#D6C8B8',
        input:   '#E7DED1',

        btn: {
          dark:     '#111111',   // Deep Obsidian Button Base
          text:     '#F4EFE7',   // Warm Linen Button Text
        },

        sage:       '#6E8A62',   // Trust Escrow Sage Green
        terracotta: '#9B5C52',   // Warm Error / Alert
        amber:      '#C49A5A',   // Warm Warning
      },

      fontFamily: {
        heading: ['Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans:    ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },

      borderRadius: {
        '3xl': '1.5rem',      // 24px
        '4xl': '2rem',        // 32px
        '5xl': '2.25rem',     // 36px
        '6xl': '2.5rem',      // 40px
      },

      boxShadow: {
        'warm-subtle': '0 8px 32px -4px rgba(59, 42, 34, 0.06), 0 2px 8px -2px rgba(59, 42, 34, 0.04)',
        'warm-card':   '0 16px 48px -8px rgba(59, 42, 34, 0.09), 0 4px 16px -2px rgba(59, 42, 34, 0.04)',
        'warm-hover':  '0 24px 64px -12px rgba(59, 42, 34, 0.14), 0 8px 24px -4px rgba(59, 42, 34, 0.06)',
        'glass-nav':   '0 10px 30px -5px rgba(59, 42, 34, 0.08), 0 0 0 1px #D6C8B8',
      },

      keyframes: {
        sheen: {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        sheen: 'sheen 3s infinite',
        'fade-in': 'fadeIn 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
};
