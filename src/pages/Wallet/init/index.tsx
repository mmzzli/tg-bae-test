import { useEffect, useState } from 'react'
import StartLogin from './StartLogin'
import StartTokens from './StartTokens'
import { InitData, useInitData, useWebApp } from '@vkruglikov/react-telegram-web-app'
import { initUserState } from '@/store/wallet/walletUser'
import { UserState } from '@/store/wallet/type'

enum WalletState {
  WAIT = 0,
  LOGIN = 1,
}

/**
 * Refresh Wallet Token and session
*/
export default () => {
  const [initDataUnsafe] = useInitData()

  const [walletState, setWalletState] = useState(WalletState.WAIT)
  useEffect(() => {
    const walletUserState: UserState = initUserState()
    if (walletUserState.tgId && walletUserState.tgId === initDataUnsafe?.user?.id) {
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
