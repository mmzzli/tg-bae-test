/** @type {import('tailwindcss').Config} */
export default {
  corePlugins: {
    preflight: false,
  },
  // add data-mode="dark" in body tag to enable dark mode
  darkMode: ['selector', '[data-mode="dark"]'],
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  important: true,
  theme: {
    extend: {
      colors: {
        'white-opacity-15': 'rgba(255, 255, 255, 0.15)', // 自定义颜色
        'white-close': '#E0E2F6',
        /** for wallet page start */
        t1: '#000000',
        b1: '#333333',
        b2: '#666666',
        b3: '#999999',
        bg2: '#F7F9FC',
        bg3: '#f5f5fa',
        green: '#04C159',
        red: '#F21F7F',
        red2: '#EB4B6D',
        orange: '#FF9142',
        yellow: '#FFB904',
        blue: '#2B6BFF',
        blue3: '#3478F6',
        /** for wallet page end */
      },
      backgroundImage: {
        'video-gradient':
          'linear-gradient(180deg, rgba(0, 0, 0, 0.70) 0%, rgba(0, 0, 0, 0.30) 14.22%, rgba(0, 0, 0, 0.10) 30.87%, rgba(0, 0, 0, 0.00) 48.98%, rgba(0, 0, 0, 0.10) 68.55%, rgba(0, 0, 0, 0.30) 86.66%, rgba(0, 0, 0, 0.70) 100%)',
      },
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
      fontSize: {
        /** for wallet page start */
        n2: [
          '42px',
          {
            lineHeight: '1.2',
          },
        ],
        n3: [
          '36px',
          {
            lineHeight: '1.2',
          },
        ],
        h1: [
          '32px',
          {
            lineHeight: '1.2',
          },
        ],
        h2: [
          '28px',
          {
            lineHeight: '1.2',
          },
        ],
        h3: [
          '24px',
          {
            lineHeight: '1.4',
          },
        ],
        /** for wallet page end */
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
