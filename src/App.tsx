import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { WagmiProvider } from 'wagmi'
import { config } from '@/config/wagmi-config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import theme from '@/theme'

import './App.css'
import './types/window.d.ts'

import { MainLayout } from '@/components/layout'
import Splash from '@/pages/Splash'
// import HomePage from '@/pages/Home'
import Searching from '@/pages/Home/Searching'
import Christmas from '@/pages/Home/Christmas'
import { NewPost } from '@/pages/NewPost'
import Shares from '@/pages/Shares'
import Profile from '@/pages/Profile'
import ProfileEdit from '@/pages/Profile/edit'
import OthersProfile from '@/pages/OthersProfile'
import EarningsHistory from '@/components/PersonalDetails/Earnings/History'
import Follow from './pages/Follow'
import ProfileGuard from './pages/OthersProfile/routeGuard'
import MessagePageRouteGuard from './pages/Chat/MessagePageRouteGuard'
import AgeGate from '@/pages/AgeGate'
import { lazy, Suspense, useEffect } from 'react'
import NiceModal from '@ebay/nice-modal-react'
import { TomoWalletTgSdkV2, TomoProvider } from '@tomo-inc/tomo-telegram-sdk'
import PriceService from '@/utils/wallet/PriceService'
import { mockTelegramEnv, parseInitData } from '@tma.js/sdk'
import { DEV_INIT_DATA_RAW } from './utils/constants'
import { AliveScope, KeepAlive } from 'react-activation'
import '@tomo-inc/tomo-telegram-sdk/dist/styles.css'

import { TOMO_META_DATA } from './config/tomo-config'

const Task = lazy(() => import('./pages/Task'))

PriceService.init()

new TomoWalletTgSdkV2({ injected: true, metaData: TOMO_META_DATA.metaData })
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

function App() {
  useEffect(() => {
    const root = document.querySelector('#root')
    if (root instanceof HTMLElement) {
      const onFocusIn = () => {
        root.style.paddingBottom = '300px' // 键盘高度
      }
      const onFocusOut = () => {
        root.style.paddingBottom = '0px' // 键盘高度
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
    <TomoProvider theme="light" supportedProviders={['EVM']} tomoOptions={TOMO_META_DATA}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <NiceModal.Provider>
            <ChakraProvider resetCSS theme={theme}>
              <AliveScope>
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<MainLayout />}>
                      <Route index element={<Splash />} />
                      <Route path="home" element={<div></div>}>
                        {/* <Route
                      index
                      element={
                        <KeepAlive name="home">
                          <HomePage />
                        </KeepAlive>
                      }
                    /> */}
                      </Route>

                      <Route path="searching" element={<Searching />} />
                      <Route path="christmas" element={<Christmas />} />

                      <Route path="post" element={<NewPost />} />
                      <Route path="shares" element={<Shares />} />

                      <Route
                        path="task"
                        element={
                          <Suspense
                            fallback={
                              <div className="flex items-center justify-center h-full pb-10">
                                <i
                                  className="iconfont icon-loading animate-spin text-[#6254FF]"
                                  style={{ fontSize: '40px' }}
                                />
                              </div>
                            }
                          >
                            <Task />
                          </Suspense>
                        }
                      />

                      {/* Profile  */}
                      <Route path="profile">
                        <Route
                          index
                          element={
                            <Suspense fallback={null}>
                              <KeepAlive name="profile">
                                <Profile />
                              </KeepAlive>
                            </Suspense>
                          }
                        />
                        <Route path="edit" element={<ProfileEdit />} />
                        <Route path="earningsHistory" element={<EarningsHistory />} />
                        <Route
                          path=":uid"
                          element={
                            <ProfileGuard>
                              <OthersProfile />
                            </ProfileGuard>
                          }
                        />
                      </Route>

                      {/* Follow */}
                      <Route path="follow/:uid" element={<Follow />} />

                      {/* Chat */}
                      <Route path="chat" element={<></>} />
                      <Route path="chat/:uid" element={<MessagePageRouteGuard />} />
                      <Route path="ageGate" element={<AgeGate />} />
                    </Route>
                  </Routes>
                </BrowserRouter>
              </AliveScope>
            </ChakraProvider>
          </NiceModal.Provider>
        </QueryClientProvider>
      </WagmiProvider>
    </TomoProvider>
  )
}

export default App
