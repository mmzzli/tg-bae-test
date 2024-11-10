import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { retrieveLaunchParams } from '@telegram-apps/sdk'
import { logIn } from '@/api'
import { DEV_INIT_DATA_RAW } from '@/utils/constants'
import { isLocalEnv } from '@/utils/env'
import { useStore } from '@/store'
import { useRequest } from 'ahooks'
import { Outlet } from 'react-router-dom'
import { log } from 'console'

export const MainLayout: React.FC = () => {
  const location = useLocation()
  const setUserInfo = useStore((state) => state.setUserInfo)
  const setToken = useStore((state) => state.setToken)
  const resetAllLists = useStore((state) => state.resetAllLists)
  const resetUserInfo = useStore((state) => state.resetUserInfo)
  const resetToken = useStore((state) => state.resetToken)
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
          console.log(123)
          window.history.back()
        }
      })
    }
    onLogin()
  }, [])

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tgApp = window.Telegram.WebApp
      if (location.pathname === '/home') {
        tgApp.BackButton.hide()
      } else {
        tgApp.BackButton.show()
      }
    }
  }, [location.pathname])

  return <Outlet />
}
