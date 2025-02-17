import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter, useRoutes } from 'react-router-dom'
import NiceModal from '@ebay/nice-modal-react'
import { AliveScope } from 'react-activation'

import { WagmiProvider } from 'wagmi'
import { config } from '@/config/wagmi-config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import { TomoWalletTgSdkV2, TomoProvider } from '@tomo-inc/tomo-telegram-sdk'
import PriceService from '@/utils/wallet/PriceService'

import theme from '@/theme'
import { routes } from './router/routes'
import { AgeGateWrapper } from './router/AgeGateWrapper'
import './App.css'
import './types/window.d.ts'

import { mockTelegramEnv, parseInitData } from '@tma.js/sdk'
import { DEV_INIT_DATA_RAW } from './utils/constants'
import { useEffect } from 'react'
// import '@tomo-inc/tomo-telegram-sdk/dist/styles.css'

import { TOMO_META_DATA } from './config/tomo-config'

PriceService.init()

// new TomoWalletTgSdkV2({ injected: true, metaData: TOMO_META_DATA.metaData })
const queryClient = new QueryClient()

if (import.meta.env.MODE === 'dev') {
  mockTelegramEnv({
    themeParams: {
      accentTextColor: '#6ab2f2',
      bgColor: '#17212b',
      buttonColor: '#5288c1',
      buttonTextColor: '#ffffff',
      destructiveTextColor: '#ec3942',
      headerBgColor: '#17212b',
      hintColor: '#708499',
      linkColor: '#6ab3f3',
      secondaryBgColor: '#232e3c',
      sectionBgColor: '#17212b',
      sectionHeaderTextColor: '#6ab3f3',
      subtitleTextColor: '#708499',
      textColor: '#f5f5f5',
    },
    initData: parseInitData(DEV_INIT_DATA_RAW),
    initDataRaw: DEV_INIT_DATA_RAW,
    version: '7.2',
    platform: 'tdesktop',
  })
}

const AppRoutes = () => {
  const element = useRoutes(routes)
  return <AgeGateWrapper>{element}</AgeGateWrapper>
}

function App() {
  useEffect(() => {
    const root = document.querySelector('#root')
    if (root instanceof HTMLElement) {
      const onFocusIn = () => {
        root.style.paddingBottom = '300px' //键盘高度
      }
      const onFocusOut = () => {
        root.style.paddingBottom = '0px' //键盘高度
      }

      document.addEventListener('focusin', onFocusIn)
      document.addEventListener('focusout', onFocusOut)

      return () => {
        document.removeEventListener('focusin', onFocusIn)
        document.removeEventListener('focusout', onFocusOut)
      }
    }
  }, [])

  return (
    // <TomoProvider theme="light" supportedProviders={['EVM']} tomoOptions={TOMO_META_DATA}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <NiceModal.Provider>
              <ChakraProvider resetCSS theme={theme}>
                <AliveScope>
                  <AppRoutes />
                </AliveScope>
              </ChakraProvider>
            </NiceModal.Provider>
          </BrowserRouter>
        </QueryClientProvider>
      </WagmiProvider>
    // </TomoProvider>
  )
}

export default App
