import { lazy, Suspense, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { retrieveLaunchParams } from '@telegram-apps/sdk'
import { logIn, getFollowingList } from '@/api'
import { DEV_INIT_DATA_RAW } from '@/utils/constants'
import { useStore } from '@/store'
import { useRequest } from 'ahooks'
import { Outlet } from 'react-router-dom'
import { log } from 'console'
import Menu from '../Menu'
import { postEvent } from '@telegram-apps/sdk'
import { PostProgressBar } from '../NewPost/PostProgressBar'
import VideoDialog from '@/components/ResourceList/VideoDialog'
import ImageDialog from '@/components/ResourceList/ImageDialog'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { useInitDailyTask } from '@/hooks/useDailyTask'
import WsHandler from './WsHandler'
const HomePage = lazy(() => import('@/pages/Home'))

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

const waitForTelegramWebApp = () => {
  return new Promise<typeof window.Telegram.WebApp>((resolve) => {
    if (window.Telegram?.WebApp) {
      resolve(window.Telegram.WebApp)
      return
    }

    const maxAttempts = 50
    let attempts = 0
    const checkInterval = setInterval(() => {
      attempts++
      if (window.Telegram?.WebApp) {
        clearInterval(checkInterval)
        resolve(window.Telegram.WebApp)
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval)
        console.error('无法加载 Telegram WebApp')
      }
    }, 100)
  })
}
const BASE_PATHS = ['/home', '/chat', '/profile', '/ageGate', '/task']
const HIDE_BACK_BUTTON_PATHS = ['/home', '/chat', '/profile', '/ageGate', '/task', '/']

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
  const [hiddenHomePage, setHiddenHomePage] = useState(false)
  const setExpanded = useStore((state) => state.setExpand)
  const isExpanded = useStore((state) => state.expand)
  const navigate = useNavigate()
  const setVideoResource = useStore((state) => state.setVideoResource)
  const videoResource = useStore((state) => state.videoResource)
  const imageResource = useStore((state) => state.imageResource)
  const setImageResource = useStore((state) => state.setImageResource)
  const virtualRoutePage = useStore((state) => state.virtualRoutePage)
  const myFollow = useStore((state) => state.myFollow)
  const setMyFollow = useStore((state) => state.setMyFollow)
  const { getCurrentUid } = useTMAUtils()
  const current_uid = getCurrentUid()
  const { runInitDailyTask } = useInitDailyTask()

  const updateMyFollow = () => {
    if (myFollow.length === 0) {
      getFollowingList(current_uid).then((res) => setMyFollow(res))
    }
  }

  const { run: runLogin } = useRequest(logIn, {
    manual: true,
    onSuccess({ token, api_token, user_info }) {
      setToken(token)
      setUserInfo({ ...user_info, api_token })
      updateMyFollow()
      // Daily Task [Daily Login + Init Daily Task Store]
      runInitDailyTask()
    },
  })

  const onLogin = async () => {
    let userInfo
    try {
      const { initDataRaw } = retrieveLaunchParams()
      // userInfo = initDataRaw
      userInfo = DEV_INIT_DATA_RAW
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
    const initTelegramApp = async () => {
      const tgApp = await waitForTelegramWebApp()

      document.getElementById('root')?.classList.add('root-wrap')
      tgApp.ready()
      try {
        tgApp.requestFullscreen()
      } catch (err) {
        console.warn('######    web_app_request_fullscreen error    ######', err)
      }
      // ... 其余 WebApp 相关代码 ...
      postEvent('web_app_setup_swipe_behavior', {
        allow_vertical_swipe: false,
      })

      postEvent('web_app_setup_closing_behavior', {
        need_confirmation: true,
      })
      tgApp.expand()
      tgApp.headerColor = '#ffffff'
      tgApp.MainButton.hide()
      tgApp.onEvent('viewportChanged', () => {
        if (!tgApp.isExpanded) {
          tgApp.expand()
          setExpanded(true)
        }
      })
      window.Telegram.WebView.onEvent(
        'visibility_changed',
        (eventType: string, eventData: { is_visible: boolean }) => {
          if (eventData.is_visible) {
            window.Telegram.WebApp.setHeaderColor('#000')
            setTimeout(() => {
              window.Telegram.WebApp.setHeaderColor('#ffffff')
            }, 100)
          }
        }
      )
      tgApp.BackButton.onClick(() => {
        console.log('location.pathname', location.pathname)
        console.log('window.location.pathname', window.location.pathname)
        console.log('location previous', location.state?.from)
        console.log('location previous backToHome', useStore.getState().backToHome)
        console.log(useStore.getState().videoResource, '=================')

        if (useStore.getState().videoResource) {
          setVideoResource(null)
          return // navigate('/home')
        }

        if (useStore.getState().imageResource) {
          setImageResource(null)
          return // navigate('/home')
        }

        // low priority then media dialog
        if (
          useStore.getState().virtualRoutePage &&
          useStore.getState().virtualRoutePage?.enterFrom === window.location.pathname
        ) {
          useStore.getState().resetVirtualRoutePage()
          return
        }

        if (useStore.getState().backToHome) {
          setBackToHome(false)
          return navigate('/home')
        }

        navigate(-1)
      })
      setExpanded(window.Telegram.WebApp.isExpanded)
      console.log(window.Telegram.WebApp.isExpanded, 'window.Telegram.WebApp.isExpanded')
    }
    initTelegramApp()
    onLogin()
    // remove page loading
    setTimeout(() => {
      window.loading = false
      document.getElementById('splash_video')?.remove()
    }, 4200)
  }, [])

  useEffect(() => {
    console.log('pathname------------------------------->', location.pathname)
    // handle page refresh or open app from share link
    if (BASE_PATHS.includes(location.pathname)) {
      setBackToHome(false)
    }

    // handle chat page start
    if (location.pathname.startsWith('/chat') && !shouldLoadChat) {
      setShouldLoadChat(true)
    }
    if (location.pathname === '/chat') {
      setHiddenChatPage(false)
    } else {
      setHiddenChatPage(true)
    }

    if (location.pathname === '/home') {
      setHiddenHomePage(false)
    } else {
      setHiddenHomePage(true)
    }
    // handle chat page end

    if (window.Telegram?.WebApp) {
      const tgApp = window.Telegram.WebApp
      if (
        HIDE_BACK_BUTTON_PATHS.includes(location.pathname) &&
        !(videoResource || imageResource || virtualRoutePage)
      ) {
        tgApp.BackButton.hide()
      } else {
        tgApp.BackButton.show()
      }
    }
  }, [location.pathname])

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tgApp = window.Telegram.WebApp
      if (videoResource || imageResource || virtualRoutePage) {
        tgApp.BackButton.show()
        window.Telegram.WebApp.setHeaderColor('#000')
      } else if (HIDE_BACK_BUTTON_PATHS.includes(location.pathname)) {
        tgApp.BackButton.hide()
      }
      if (!videoResource && !imageResource && !virtualRoutePage) {
        window.Telegram.WebApp.setHeaderColor('#fff')
      }
    }
  }, [videoResource, imageResource, virtualRoutePage])

  return (
    <div className="absolute inset-0 top-0 right-0 bottom-0 left-0 overflow-hidden flex pb-[84px] transition-all duration-300 bg-white dark:bg-black no-tap">
      <div
        className="absolute left-0 right-0 top-0 bottom-[84px] flex-col bg-white dark:bg-[#0D0D0D] overflow-hidden"
        style={{
          opacity: hiddenChatPage ? 0 : 1,
          zIndex: hiddenChatPage ? -1 : 200,
        }}
      >
        <Suspense
          fallback={
            <div className="h-screen flex items-center justify-center">
              <i
                className="iconfont icon-loading animate-spin text-[#6254FF]"
                style={{ fontSize: '40px' }}
              />
            </div>
          }
        >
          <ChatListPageLoader.Component />
        </Suspense>
      </div>

      <div
        className="absolute left-0 right-0 top-0 bottom-[84px] flex-col bg-white dark:bg-[#0D0D0D] overflow-hidden"
        style={{
          opacity: hiddenHomePage ? 0 : 1,
          zIndex: hiddenHomePage ? -1 : 200,
          paddingTop: 'calc(var(--tg-safe-area-inset-top) + var(--tg-content-safe-area-inset-top))',
        }}
      >
        <Suspense
          fallback={
            <div className="h-screen flex items-center justify-center">
              <i
                className="iconfont icon-loading animate-spin text-[#6254FF]"
                style={{ fontSize: '40px' }}
              />
            </div>
          }
        >
          <HomePage />
        </Suspense>
      </div>

      <div
        className={`absolute inset-0 top-0 bottom-[84px] z-1`}
        style={{
          paddingTop: 'calc(var(--tg-safe-area-inset-top) + var(--tg-content-safe-area-inset-top))',
        }}
      >
        <Outlet />
      </div>
      <PostProgressBar />
      <Menu />
      <VideoDialog></VideoDialog>
      <ImageDialog></ImageDialog>
      <WsHandler />
    </div>
  )
}
