import { extendTheme, ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

const theme = extendTheme({
  config,
  components: {
    Button: {
      baseStyle: {
        fontWeight: '500',
        _loading: {
          opacity: 0.6,
          background: '#4A3AFF',
          cursor: 'not-allowed',
        },
      },
      sizes: {
        xl: {
          fontSize: 'lg',
          px: '24px',
          py: '14px',
        },
      },
      variants: {
        'primary-outline': {
          border: '1px solid #4A3AFF',
          borderRadius: '32px',
          background: '#4A3AFF',
          color: '#FFFFFF',
          _active: {
            color: '#4A3AFF',
            border: '1px solid #4A3AFF',
            background: '#0D0D0D',
          },
        },
        'primary-dark-border': {
          border: '1px solid #4A3AFF',
          borderRadius: '32px',
          background: '#0D0D0D',
          color: '#4A3AFF',
        },
        'primary-dark': {
          borderRadius: '32px',
          background: '#6254FF',
          color: '#fff',
          _hover: {
            background: '#6254FF !important',
          },
          _disabled: {
            background: "#D1D0DE",
            opacity: 1
          }
          // _active: {
          //   color: '#E0E2F6',
          //   // border: '1px solid #4A3AFF',
          //   background: '#4A3AFF',
          // },
        },
      },
    },
  },
})

export default theme
