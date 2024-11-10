import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import theme from '@/theme'

import './App.css'
import './types/window.d.ts'

import { MainLayout } from '@/components/layout'
import Splash from '@/pages/Splash'
import HomePage from '@/pages/Home'
import { NewPost } from '@/pages/NewPost'
import Shares from '@/pages/Shares'
import Profile from '@/pages/Profile'
import ProfileEdit from '@/pages/Profile/edit'
import OthersProfile from '@/pages/OthersProfile'
import EarningsHistory from '@/components/PersonalDetails/Earnings/History'
import Follow from './pages/Follow'
import ProfileGuard from './pages/OthersProfile/routeGuard'

// import { mockTelegramEnv, parseInitData } from '@tma.js/sdk'
// import { DEV_INIT_DATA_RAW } from './utils/constants'

// mockTelegramEnv({
//   themeParams: {
//     accentTextColor: '#6ab2f2',
//     bgColor: '#17212b',
//     buttonColor: '#5288c1',
//     buttonTextColor: '#ffffff',
//     destructiveTextColor: '#ec3942',
//     headerBgColor: '#17212b',
//     hintColor: '#708499',
//     linkColor: '#6ab3f3',
//     secondaryBgColor: '#232e3c',
//     sectionBgColor: '#17212b',
//     sectionHeaderTextColor: '#6ab3f3',
//     subtitleTextColor: '#708499',
//     textColor: '#f5f5f5',
//   },
//   initData: parseInitData(DEV_INIT_DATA_RAW),
//   initDataRaw: DEV_INIT_DATA_RAW,
//   version: '7.2',
//   platform: 'tdesktop',
// })

function App() {
  return (
    <>
      <ChakraProvider resetCSS theme={theme}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Splash />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="post" element={<NewPost />} />
              <Route path="shares" element={<Shares />} />

              {/* Profile  */}
              <Route path="profile">
                <Route index element={<Profile />} />
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
            </Route>
          </Routes>
        </BrowserRouter>
      </ChakraProvider>
    </>
  )
}

export default App
