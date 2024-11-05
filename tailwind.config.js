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
      },
      animation: {
        ripple: 'ripple 1s ease-out infinite',
        'zoom-in': 'zoom-in 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
}
