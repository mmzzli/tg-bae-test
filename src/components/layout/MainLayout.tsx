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
import { Menu } from '../Menu'
import { postEvent } from '@telegram-apps/sdk'

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
      document.getElementById('root')?.classList.add('root-wrap')
      tgApp.headerColor = '#000'
      tgApp.backgroundColor = '#0d0d0d'
      tgApp.MainButton.hide()
      tgApp.onEvent('viewportChanged', () => {
        if (!tgApp.isExpanded) {
          tgApp.expand()
        }
      })
      tgApp.BackButton.onClick(() => {
        console.log('location.pathname', location.pathname)
        if (location.pathname === '/home') {
          tgApp.showConfirm("Changes that you made may not besaved.", function (isConfirmed:boolean) {
            if (isConfirmed) {
              console.log("User confirmed the action.");
              tgApp.close();
            } else {
              console.log(1)
            }
          });

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
      postEvent('web_app_setup_swipe_behavior', {
        allow_vertical_swipe: false,
      })
      if (location.pathname === '/home') {
        tgApp.BackButton.hide()
      } else {
        tgApp.BackButton.show()
      }
    }
  }, [location.pathname])

  return (
    <div className="bg-black h-screen w-screen overflow-hidden flex pb-[84px]">
      <div
        className="fixed w-screen top-0 bottom-[84px] flex-col bg-[#0D0D0D] overflow-hidden"
        style={{ display: hiddenChatPage ? 'none' : 'flex', zIndex: hiddenChatPage ? -1 : 200 }}
      >
        {shouldLoadChat && (
          <Suspense
            fallback={
              <div className="h-screen flex items-center justify-center">
                <Spinner />
              </div>
            }
          >
            <ChatListPage />
          </Suspense>
        )}
      </div>

      <div className="absolute inset-0 top-0 bottom-[84px] z-1">
        <Outlet />
      </div>

      <Menu />
    </div>
  )
}
