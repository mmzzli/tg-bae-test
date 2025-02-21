import { UserState, UserType } from '@/store/wallet/type'
import { initUserInfo, initUserState } from '@/store/wallet/walletUser'
import { useEffect, useState } from 'react'
import { useInitData } from '@vkruglikov/react-telegram-web-app'
import { retrieveLaunchParams } from '@telegram-apps/sdk'
import { DEV_INIT_DATA_RAW } from '@/utils/constants'
import useInitUser from '@/store/wallet/hooks/useInitUser'
import { getCacheTokens } from '@/store/wallet/util/tokenHelper'
import { useStore } from '@/store'

export const useAccount = () => {
  const [initDataUnsafe] = useInitData()

  const walletUserInfo = useStore((state) => state.walletUserInfo)

  const [status, setStatus] = useState<'disconnected' | 'connected'>('disconnected')
  const [address, setAddress] = useState<`0x${string}` | undefined>(undefined)
  const [solAddress, setSolAddress] = useState<string | undefined>(undefined)
  const [tonAddress, setTonAddress] = useState<string | undefined>(undefined)

  useEffect(() => {
    checkUserInfo()
  }, [])

  useEffect(() => {
    checkUserInfo()
  }, [JSON.stringify(walletUserInfo)])

  const checkUserInfo = () => {
    const walletUserState: UserState = initUserState()
    const walletUserInfo: UserType = initUserInfo()
    if (
      walletUserState.tgId &&
      walletUserState.tgId === initDataUnsafe?.user?.id &&
      walletUserInfo.ethereumAddress
    ) {
      setStatus('connected')
      setAddress(walletUserInfo.ethereumAddress as `0x${string}`)
      setSolAddress(walletUserInfo.solanaAddress)
      setTonAddress(walletUserInfo.tonAddress)
    }
  }

  return {
    status,
    address,
    solAddress,
    tonAddress,
  }
}

export const useConnect = () => {
  const [connectStatus, setConnectStatus] = useState<'connecting' | 'waiting'>('waiting')
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
    connectStatus,
  }
}

export const useBalance = (
  address: string | undefined,
  chainId: number,
  tokenAddress: string | undefined
) => {
  const list = getCacheTokens() || []
  const find = list.find((i) => {
    if (tokenAddress) {
      return i.address?.toLowerCase() === tokenAddress?.toLowerCase() && i.chainId === chainId
    }
    return i.address === '' && i.chainId === chainId
  })
  return find
}

export const userefetchBalance = () => {
  const refreshTokenStore = useStore((state) => state.refreshTokenStore)
  return { refreshTokenStore }
}
