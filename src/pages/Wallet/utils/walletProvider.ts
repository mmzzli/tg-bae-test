import { UserState, UserType } from '@/store/wallet/type'
import { initUserInfo, initUserState } from '@/store/wallet/walletUser'
import { useEffect, useState } from 'react'
import { useInitData } from '@vkruglikov/react-telegram-web-app'
import { retrieveLaunchParams } from '@telegram-apps/sdk'
import { DEV_INIT_DATA_RAW } from '@/utils/constants'
import useInitUser from '@/store/wallet/hooks/useInitUser'

export const useAccount = () => {
  const [initDataUnsafe] = useInitData()

  const [status, setStatus] = useState<'disconnected' | 'connected'>('disconnected')
  const [address, setAddress] = useState('')

  useEffect(() => {
    const walletUserState: UserState = initUserState()
    const walletUserInfo: UserType = initUserInfo()
    if (
      walletUserState.tgId &&
      walletUserState.tgId === initDataUnsafe?.user?.id &&
      walletUserInfo.ethereumAddress
    ) {
      setStatus('connected')
      setAddress(walletUserInfo.ethereumAddress)
    }
  }, [])

  return {
    status,
    address,
  }
}

export const useConnect = () => {
  const [connectStatus, setConnectStatus] = useState< 'connecting' | 'waiting'>('waiting')
  const { tgLogin, getUserInfo } = useInitUser()
  const connect = async () => {
    setConnectStatus('connecting')
    let userInfo
    try {
      const { initDataRaw } = retrieveLaunchParams()
      userInfo = import.meta.env.VITE_APP_ENV === 'dev' ? DEV_INIT_DATA_RAW : initDataRaw
    } catch (error) {
      userInfo = DEV_INIT_DATA_RAW
    }

    await tgLogin(userInfo)
    await getUserInfo()
    setConnectStatus('waiting')
  }

  return {
    connect,
    connectStatus
  }
}
