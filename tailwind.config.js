/** @type {import('tailwindcss').Config} */
export default {
  corePlugins: {
    preflight: false,
  },
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  important: true,
  theme: {
    extend: {
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0)', opacity: 1 },
          '100%': { transform: 'scale(1)', opacity: 0 },
        },
        'zoom-in': {
          '0%': {
            transform:
              'translate(var(--initial-x), var(--initial-y)) scale(calc(var(--initial-width) / 100%))',
            opacity: '0',
          },
          '100%': {
            transform: 'translate(0, 0) scale(1)',
            opacity: '1',
          },
        },
        shimmer: {
          '0%': {
            transform: `skew(-30deg) translateX(-60px)`,
          },
          '100%': {
            transform: `skew(-30deg) translateX(600px)`,
          },
        },
      },
      animation: {
        ripple: 'ripple 1s ease-out infinite',
        'zoom-in': 'zoom-in 0.5s ease-out forwards',
        'fade-in': 'fade-in 0.2s ease-out',
        shimmer: `shimmer 1s infinite`,
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          /* IE and Edge */
          '-ms-overflow-style': 'none',
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      })
    },
  ],
}
