import useInitUser from '@/store/wallet/hooks/useInitUser'
import { DEV_INIT_DATA_RAW } from '@/utils/constants'
import { retrieveLaunchParams } from '@telegram-apps/sdk'
import { useMfa } from './Account/hooks/useMfa'
import useWallet from './hooks/useWallet'

const WalletTest = () => {
  const { tgLogin, getUserInfo } = useInitUser()
  const { hanleWalletAction } = useWallet()

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

  const handleSign = async () => {
    const data = await hanleWalletAction({
      method: 'eth_signTransaction',
      params: [
        {
          from: '0xdcf971dcc07fb220bf8b3001b903afc6ef58e635',
          to: '0xdcf971dcc07fb220bf8b3001b903afc6ef58e635',
          chainId: 56,
          value: '0.001',
        },
      ],
    })
    console.log('handleSign', data)
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <button onClick={connect}>connect</button>
      <button onClick={handleMfa}>useMfa</button>

      <button onClick={handleSign}>oauth</button>
    </div>
  )
}

export default WalletTest
