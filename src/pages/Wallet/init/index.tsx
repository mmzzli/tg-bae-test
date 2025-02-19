import { useEffect, useState } from 'react'
import StartLogin from './StartLogin'
import StartTokens from './StartTokens'
import { InitData, useInitData, useWebApp } from '@vkruglikov/react-telegram-web-app'
import { initUserInfo, initUserState } from '@/store/wallet/walletUser'
import { UserState, UserType } from '@/store/wallet/type'
import { useTokenStore } from '@/store/wallet/walletToken'

enum WalletState {
  WAIT = 0,
  LOGIN = 1,
}

/**
 * Refresh Wallet Token and session
 */
export default () => {
  const [initDataUnsafe] = useInitData()
  const { refreshTime } = useTokenStore()
  const [walletState, setWalletState] = useState(WalletState.WAIT)

  useEffect(() => {
    if (refreshTime !== 0) {
      setWalletState(WalletState.LOGIN)
    }
  }, [refreshTime])

  useEffect(() => {
    const walletUserState: UserState = initUserState()
    const walletUserInfo: UserType = initUserInfo()
    if (
      walletUserState.tgId &&
      walletUserState.tgId === initDataUnsafe?.user?.id &&
      walletUserInfo.ethereumAddress
    ) {
      setWalletState(WalletState.LOGIN)
    }
  }, [])


  if (walletState === WalletState.LOGIN) {
    return (
      <>
        <StartLogin />
        <StartTokens />
      </>
    )
  }
  return <></>
}
