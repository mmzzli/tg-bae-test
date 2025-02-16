import useInitUser from '@/store/wallet/hooks/useInitUser'
import { DEV_INIT_DATA_RAW } from '@/utils/constants'
import { retrieveLaunchParams } from '@telegram-apps/sdk'
import { useMfa } from './Account/hooks/useMfa'

const WalletTest = () => {
  const { tgLogin, getUserInfo } = useInitUser()

  const connect = async () => {
    let userInfo
    try {
      const { initDataRaw } = retrieveLaunchParams()
      userInfo = import.meta.env.VITE_APP_ENV === 'dev' ? DEV_INIT_DATA_RAW : initDataRaw
      // log('userInfo finally', userInfo)
    } catch (error) {
      userInfo = DEV_INIT_DATA_RAW
    }

    await tgLogin(userInfo)
    await getUserInfo()
  }

  const { getMfaParams } = useMfa()

  const handleMfa = async () => {
    const { mfa, signature } = await getMfaParams({})
    console.log('mfa, signature', mfa, signature)
  }

  return (
    <div className="grid grid-cols-2">
      <button onClick={connect}>connect</button>
      <button onClick={handleMfa}>useMfa</button>
    </div>
  )
}

export default WalletTest
