/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          glow: 'var(--color-primaryGlow)',
        },
        secondary: 'var(--color-secondary)',
        dark: {
          bg: 'var(--color-darkBg)',
          card: 'var(--color-card)',
          hover: 'var(--color-cardHover)',
        },
        light: {
          bg: 'var(--color-background)',
        },
        text: {
          main: 'var(--color-textMain)',
          dim: 'var(--color-textDim)',
          muted: 'var(--color-textMuted)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          focus: 'var(--color-borderFocus)',
        },
        accent: 'var(--color-accent)',
        error: 'var(--color-error)',
        success: 'var(--color-success)',
      },
      fontFamily: {
        sans: 'var(--font-main)',
        serif: 'var(--font-accent)',
      },
      borderRadius: {
        'lg': 'var(--radius-lg)',
        'md': 'var(--radius-md)',
        'sm': 'var(--radius-sm)',
      },
      transitionProperty: {
        'slow': 'var(--transition-slow)',
        'fast': 'var(--transition-fast)',
      }
    },
  },
  plugins: [],
}
