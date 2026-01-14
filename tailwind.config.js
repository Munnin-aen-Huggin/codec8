/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      // Unified Color Palette - Dark Theme with Emerald Accent
      colors: {
        // Base dark backgrounds
        dark: {
          900: '#09090b', // Deepest background
          800: '#111113', // Elevated surfaces
          700: '#18181b', // Cards, modals
          600: '#1f1f23', // Hover states
          500: '#27272a', // Borders, dividers
          400: '#3f3f46', // Subtle borders
        },
        // Accent colors
        accent: {
          DEFAULT: '#10b981', // Primary emerald
          hover: '#059669',   // Hover state
          light: '#34d399',   // Light variant
          dark: '#047857',    // Dark variant
          glow: 'rgba(16, 185, 129, 0.3)', // Glow effect
        },
        // Text hierarchy
        text: {
          primary: '#ffffff',
          secondary: '#a1a1aa',
          muted: '#71717a',
          disabled: '#52525b',
        },
        // Status colors
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },

      // Typography Scale
      fontSize: {
        'display': ['clamp(2.5rem, 6vw, 4rem)', { lineHeight: '1.1', fontWeight: '800', letterSpacing: '-0.03em' }],
        'h1': ['2.25rem', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['1.875rem', { lineHeight: '1.25', fontWeight: '700' }],
        'h3': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'h4': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'caption': ['0.75rem', { lineHeight: '1.4' }],
      },

      // Spacing Scale (4px baseline)
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },

      // Border Radius
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      },

      // Shadows with glow effects
      boxShadow: {
        'glow-sm': '0 4px 20px rgba(16, 185, 129, 0.15)',
        'glow': '0 8px 30px rgba(16, 185, 129, 0.25)',
        'glow-lg': '0 12px 40px rgba(16, 185, 129, 0.35)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
      },

      // Animation
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(16, 185, 129, 0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },

      // Transitions
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },

      // Backdrop blur
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    // Custom plugin for glass effect
    function({ addUtilities }) {
      addUtilities({
        '.glass': {
          'background': 'rgba(17, 17, 19, 0.8)',
          'backdrop-filter': 'blur(10px)',
          '-webkit-backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.glass-dark': {
          'background': 'rgba(9, 9, 11, 0.95)',
          'backdrop-filter': 'blur(10px)',
          '-webkit-backdrop-filter': 'blur(10px)',
        },
        '.text-gradient': {
          'background': 'linear-gradient(135deg, #10b981, #34d399)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.hover-lift': {
          'transition': 'transform 0.2s ease, box-shadow 0.2s ease',
        },
        '.hover-lift:hover': {
          'transform': 'translateY(-2px)',
        },
        '.btn-glow': {
          'transition': 'all 0.2s ease',
        },
        '.btn-glow:hover': {
          'box-shadow': '0 8px 30px rgba(16, 185, 129, 0.25)',
          'transform': 'translateY(-2px)',
        },
      })
    },
  ],
};
