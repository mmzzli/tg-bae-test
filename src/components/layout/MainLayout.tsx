import { lazy, Suspense, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { retrieveLaunchParams } from '@telegram-apps/sdk'
import { logIn } from '@/api'
import { DEV_INIT_DATA_RAW } from '@/utils/constants'
import { isLocalEnv } from '@/utils/env'
import { useStore } from '@/store'
import { useRequest } from 'ahooks'
import { Outlet } from 'react-router-dom'
import { log } from 'console'
import { Spinner } from '@chakra-ui/react'

const ChatListPage = lazy(() =>
  import('@/pages/Chat').then((module) => ({
    default: module.ChatListPage,
  }))
)

export const MainLayout: React.FC = () => {
  const location = useLocation()
  const setUserInfo = useStore((state) => state.setUserInfo)
  const setToken = useStore((state) => state.setToken)
  const resetAllLists = useStore((state) => state.resetAllLists)
  const resetUserInfo = useStore((state) => state.resetUserInfo)
  const resetToken = useStore((state) => state.resetToken)
  const [shouldLoadChat, setShouldLoadChat] = useState(false)
  const [hiddenChatPage, setHiddenChatPage] = useState(false)
  const { run: runLogin } = useRequest(logIn, {
    manual: true,
    onSuccess({ token, api_token, user_info }) {
      setToken(token)
      setUserInfo({ ...user_info, api_token })
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
      const tgApp = window.Telegram.WebApp
      tgApp.ready()
      tgApp.expand()
      tgApp.headerColor = '#000'
      tgApp.MainButton.hide()
      tgApp.onEvent('viewportChanged', () => {
        if (!tgApp.isExpanded) {
          tgApp.expand()
        }
      })
      tgApp.BackButton.onClick(() => {
        console.log('location.pathname', location.pathname)
        if (location.pathname === '/home') {
          tgApp.close()
        } else {
          window.history.back()
        }
      })
    }
    onLogin()
  }, [])

  useEffect(() => {
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
      if (location.pathname === '/home') {
        tgApp.BackButton.hide()
      } else {
        tgApp.BackButton.show()
      }
    }
  }, [location.pathname])

  return (
    <div className="bg-black min-h-screen">
      {shouldLoadChat && (
        <Suspense
          fallback={
            <div className="h-screen flex items-center justify-center">
              <Spinner />
            </div>
          }
        >
          <ChatListPage className={hiddenChatPage ? 'hidden' : ''} />
        </Suspense>
      )}
      <Outlet />
    </div>
  )
}
