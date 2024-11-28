import { lazy, Suspense, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { retrieveLaunchParams } from '@telegram-apps/sdk'
import { logIn } from '@/api'
import { DEV_INIT_DATA_RAW } from '@/utils/constants'
import { isLocalEnv } from '@/utils/env'
import { useStore } from '@/store'
import { useRequest } from 'ahooks'
import { Outlet } from 'react-router-dom'
import { log } from 'console'
import { Spinner } from '@chakra-ui/react'
import { Menu } from '../Menu'
import { postEvent } from '@telegram-apps/sdk'
import { PostProgressBar } from '../NewPost/PostProgressBar'

const ChatListPageLoader = {
  preload: () =>
    import('@/pages/Chat').then((module) => ({
      default: module.ChatListPage,
    })),
  Component: lazy(() =>
    import('@/pages/Chat').then((module) => ({
      default: module.ChatListPage,
    }))
  ),
}

export const MainLayout: React.FC = () => {
  const location = useLocation()
  const setUserInfo = useStore((state) => state.setUserInfo)
  const setToken = useStore((state) => state.setToken)
  const resetAllLists = useStore((state) => state.resetAllLists)
  const resetUserInfo = useStore((state) => state.resetUserInfo)
  const resetToken = useStore((state) => state.resetToken)
  const setBackToHome = useStore((state) => state.setBackToHome)
  const [shouldLoadChat, setShouldLoadChat] = useState(false)
  const [hiddenChatPage, setHiddenChatPage] = useState(false)
  const setExpanded = useStore((state) => state.setExpand)
  const isExpanded = useStore((state) => state.expand)
  const navigate = useNavigate()
  const { run: runLogin } = useRequest(logIn, {
    manual: true,
    onSuccess({ token, api_token, user_info }) {
      setToken(token)
      setUserInfo({ ...user_info, api_token })
      // ChatListPageLoader.preload()
    },
  })

  const onLogin = async () => {
    let userInfo
    try {
      const { initDataRaw } = retrieveLaunchParams()
      log('userInfo retrieveLaunchParams', initDataRaw)
      log('userInfo DEV_INIT_DATA_RAW', initDataRaw)
      userInfo = isLocalEnv ? DEV_INIT_DATA_RAW : initDataRaw
      log('userInfo finally', userInfo)
    } catch (error) {
      userInfo = DEV_INIT_DATA_RAW
    }

    resetAllLists()
    resetUserInfo()
    resetToken()
    runLogin({ user: userInfo ?? '' })
  }

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      document.getElementById('root')?.classList.add('root-wrap')
      const tgApp = window.Telegram.WebApp
      tgApp.ready()
      try {
        window.TelegramWebviewProxy &&
          window.TelegramWebviewProxy.postEvent('web_app_request_fullscreen')
      } catch (err) {
        console.warn('######    web_app_request_fullscreen error    ######', err)
      }

      postEvent('web_app_setup_swipe_behavior', {
        allow_vertical_swipe: false,
      })
      tgApp.expand()
      tgApp.headerColor = '#000'
      tgApp.backgroundColor = '#0d0d0d'
      tgApp.MainButton.hide()
      tgApp.onEvent('viewportChanged', () => {
        if (!tgApp.isExpanded) {
          tgApp.expand()
          setExpanded(true)
        }
      })
      tgApp.BackButton.onClick(() => {
        console.log('location.pathname', location.pathname)
        console.log('window.location.pathname', window.location.pathname)
        console.log('location previous', location.state?.from)
        console.log('location previous backToHome', useStore.getState().backToHome)
        if (useStore.getState().backToHome) {
          setBackToHome(false)
          return navigate('/home')
        }
        if (window.location.pathname === '/home') {
          tgApp
            .showConfirm({
              message: 'Are you sure you want to Exit?',
              ok_button: 'Yes',
              cancel_button: 'No',
            })
            .then((result: boolean) => {
              if (result) {
                tgApp.close()
              } else {
                console.log(1)
              }
            })
            .catch((error: Error) => {
              console.error('Error showing confirmation:', error)
            })

          // tgApp.showConfirm("Changes that you m de may not besaved.", function (isConfirmed:boolean) {
          //   if (isConfirmed) {
          //     console.log("User confirmed the action.");
          //     tgApp.close();
          //   } else {
          //     console.log(1)
          //   }
          // });
          // window.history.back()
        } else {
          window.history.back()
        }
      })
      setExpanded(window.Telegram.WebApp.isExpanded)
      console.log(window.Telegram.WebApp.isExpanded, 'window.Telegram.WebApp.isExpanded')
    }
    onLogin()
  }, [])

  useEffect(() => {
    console.log('pathname-------------------------------_>', location.pathname)
    const BASE_PATHS = ['/home', '/chat', '/profile', '/ageGate']
    if (BASE_PATHS.includes(location.pathname)) {
      setBackToHome(false)
    }
    if (location.pathname.startsWith('/chat') && !shouldLoadChat) {
      setShouldLoadChat(true)
    }
    if (location.pathname === '/chat') {
      setHiddenChatPage(false)
    } else {
      setHiddenChatPage(true)
    }
    if (window.Telegram?.WebApp) {
      const tgApp = window.Telegram.WebApp
      const HIDE_BACK_BUTTON_PATHS = ['/home', '/chat', '/profile', '/', '/ageGate']
      if (HIDE_BACK_BUTTON_PATHS.includes(location.pathname)) {
        tgApp.BackButton.hide()
      } else {
        tgApp.BackButton.show()
      }
    }
  }, [location.pathname])

  return (
    <div className="absolute inset-0 top-0 right-0 bottom-0 left-0 bg-black overflow-hidden flex pb-[84px] transition-all duration-300">
      <div
        className="absolute left-0 right-0 top-0 bottom-[84px] flex-col bg-[#0D0D0D] overflow-hidden"
        style={{ display: hiddenChatPage ? 'none' : 'flex', zIndex: hiddenChatPage ? -1 : 200 }}
      >
        <Suspense
          fallback={
            <div className="h-screen flex items-center justify-center">
              <Spinner />
            </div>
          }
        >
          <ChatListPageLoader.Component />
        </Suspense>
      </div>

      <div
        className={`absolute inset-0 top-0 bottom-[84px] z-1`}
        style={{
          paddingTop: `calc(${window.getComputedStyle(document.documentElement).getPropertyValue('--tg-safe-area-inset-top') ? 'var(--tg-safe-area-inset-top) + 54px' : '0'})`,
          // paddingTop: 'var(--tg-safe-area-inset-top)',
        }}
      >
        <Outlet />
      </div>
      <PostProgressBar />
      <Menu />
    </div>
  )
}
