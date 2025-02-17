import { UserState, UserType } from '@/store/wallet/type'
import { initUserInfo, initUserState } from '@/store/wallet/walletUser'
import { useEffect, useState } from 'react'
import { useInitData } from '@vkruglikov/react-telegram-web-app'
import { retrieveLaunchParams } from '@telegram-apps/sdk'
import { DEV_INIT_DATA_RAW } from '@/utils/constants'
import useInitUser from '@/store/wallet/hooks/useInitUser'
import { getCacheTokens } from '@/store/wallet/util/tokenHelper'
import { useTokenStore } from '@/store/wallet/walletToken'

export const useAccount = () => {
  const [initDataUnsafe] = useInitData()

  const { walletUserInfo } = useTokenStore()

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
await tgLogin('query_id=AAGJJLUBAwAAAIkktQGG7XCv&user=%7B%22id%22%3A6471099529%2C%22first_name%22%3A%22sheep%22%2C%22last_name%22%3A%22web3%22%2C%22username%22%3A%22wagagahello%22%2C%22language_code%22%3A%22zh-hans%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2F0G8T-sXAWDMgfJQkeyen57L_KX96icCj9HQjp32SPZs1ZEs_qXCI4UjvpZhCquMQ.svg%22%7D&auth_date=1739706626&signature=FR1mdik56bQRNAD4eywkoJjPv1d7pkyqdHuv1GuFAl1F2OMyaXOpaALSv9dKUonFPo4Q9YmMvGcY_LGXrOrBDA&hash=00ae57c29106337902d73dd32ae1703fa5ba672967f1326aac321468af7d0c77')
    // await tgLogin(userInfo)
    await getUserInfo()
    setConnectStatus('waiting')
  }

  return {
    connect,
    connectStatus,
  }
}

export const useBalance = (address: string | undefined, chainId: number, tokenAddress: string | undefined) => {
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
  const { refreshTokenStore } = useTokenStore()
  return { refreshTokenStore }
}