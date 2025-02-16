import useInitUser from '@/store/wallet/hooks/useInitUser'
import { retrieveLaunchParams } from '@telegram-apps/sdk'
import { DEV_INIT_DATA_RAW } from '@/utils/constants'
import { InitData } from '@vkruglikov/react-telegram-web-app'
import { useEffect } from 'react'
import { useUserStore } from '@/store/wallet/walletUser'
import { UserState } from '@/store/wallet/type'
import { loginJavaApi } from '@/api/wallet'

export default () => {
  const { getUserInfo } = useInitUser()
  const { updateUserStateAction } = useUserStore()
  const startWallet = async () => {
    let userInfo
    try {
      const { initDataRaw } = retrieveLaunchParams()
      userInfo = import.meta.env.VITE_APP_ENV === 'dev' ? DEV_INIT_DATA_RAW : initDataRaw
    } catch (error) {
      userInfo = DEV_INIT_DATA_RAW
    }
    const resp = await loginJavaApi(userInfo as InitData)
    if (resp.code === 10000) {
      const userState = {
        ...resp.result,
        tgId: Number(resp.result?.tgId),
        tokenExpiredAt: (resp.result?.tokenExpiredAt || 0) * 1000,
      }
      updateUserStateAction(userState as UserState)
      await getUserInfo()
    }
  }
  useEffect(() => {
    startWallet()
  }, [])
  return <></>
}
