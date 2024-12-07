import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { retrieveLaunchParams } from '@telegram-apps/sdk'
import { logIn, getUnreadNotificationCount, getFollowingList } from '@/api'
import { DEV_INIT_DATA_RAW } from '@/utils/constants'
import { isLocalEnv } from '@/utils/env'
import { useStore } from '@/store'
import { useRequest } from 'ahooks'
import { Outlet } from 'react-router-dom'
import { log } from 'console'
import { Spinner } from '@chakra-ui/react'
import Menu from '../Menu'
import { postEvent } from '@telegram-apps/sdk'
import { PostProgressBar } from '../NewPost/PostProgressBar'
import VideoDialog from '@/components/ResourceList/VideoDialog'
import ImageDialog from '@/components/ResourceList/ImageDialog'
import { useTMAUtils } from '@/hooks/useTMAUtils'
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

const HIDE_BACK_BUTTON_PATHS = ['/home', '/chat', '/profile', '/', '/ageGate']

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
  const setVideoResource = useStore((state) => state.setVideoResource)
  const videoResource = useStore((state) => state.videoResource)
  const imageResource = useStore((state) => state.imageResource)
  const setImageResource = useStore((state) => state.setImageResource)
  const virtualRoutePage = useStore((state) => state.virtualRoutePage)
  const setUnreadNotificationCount = useStore((state) => state.setUnreadNotificationCount)
  const myFollow = useStore((state) => state.myFollow)
  const setMyFollow = useStore((state) => state.setMyFollow)
  const { getCurrentUid } = useTMAUtils()
  const current_uid = getCurrentUid()

  const { run: runGetUnreadNotificationCount } = useRequest(getUnreadNotificationCount, {
    pollingInterval: 6000,
    manual: true,
    pollingWhenHidden: false,
    pollingErrorRetryCount: 6,
    onSuccess({ amount }) {
      setUnreadNotificationCount(amount)
    },
  })

  const updateMyFollow = () => {
    if (!useStore.getState().token) {
      setTimeout(() => {
        updateMyFollow()
      }, 150)
      return
    }
    if (myFollow.length === 0) {
      getFollowingList(current_uid).then((res) => setMyFollow(res))
    }
  }

  const { run: runLogin } = useRequest(logIn, {
    manual: true,
    onSuccess({ token, api_token, user_info }) {
      setToken(token)
      setUserInfo({ ...user_info, api_token })
      runGetUnreadNotificationCount(current_uid)
      updateMyFollow()
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
        tgApp.requestFullscreen()
      } catch (err) {
        console.warn('######    web_app_request_fullscreen error    ######', err)
      }

      postEvent('web_app_setup_swipe_behavior', {
        allow_vertical_swipe: false,
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
        if (useStore.getState().virtualRoutePage) {
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
    onLogin()
  }, [])

  useEffect(() => {
    console.log('pathname-------------------------------_>', location.pathname)
    // handle page refresh or open app from share link
    const BASE_PATHS = ['/home', '/chat', '/profile', '/ageGate']
    if (BASE_PATHS.includes(location.pathname)) {
      setBackToHome(false)
    }

    // handle chat page
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

      if (HIDE_BACK_BUTTON_PATHS.includes(location.pathname)) {
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
      } else if (HIDE_BACK_BUTTON_PATHS.includes(location.pathname)) {
        tgApp.BackButton.hide()
      }
    }
  }, [videoResource, imageResource, virtualRoutePage])

  return (
    <div className="absolute inset-0 top-0 right-0 bottom-0 left-0overflow-hidden flex pb-[84px] transition-all duration-300 bg-white dark:bg-black no-tap">
      <div
        className="absolute left-0 right-0 top-0 bottom-[84px] flex-col bg-white dark:bg-[#0D0D0D] overflow-hidden"
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
          paddingTop: 'calc(var(--tg-safe-area-inset-top) + var(--tg-content-safe-area-inset-top))',
        }}
      >
        <Outlet />
      </div>
      <PostProgressBar />
      <Menu />
      <VideoDialog></VideoDialog>
      <ImageDialog></ImageDialog>
    </div>
  )
}
