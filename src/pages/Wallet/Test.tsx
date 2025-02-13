import useInitUser from "@/store/wallet/hooks/useInitUser"
import { DEV_INIT_DATA_RAW } from "@/utils/constants"
import { retrieveLaunchParams } from "@telegram-apps/sdk"

const WalletTest = () => {
  const {tgLogin} = useInitUser()

  const connect = async () => {
    let userInfo
    try {
      const { initDataRaw } = retrieveLaunchParams()
      userInfo = import.meta.env.VITE_APP_ENV === 'dev' ? DEV_INIT_DATA_RAW : initDataRaw
      // log('userInfo finally', userInfo)
    } catch (error) {
      userInfo = DEV_INIT_DATA_RAW
    }

    await tgLogin(userInfo);
  }

  return <button onClick={connect}>connect</button>
}

export default WalletTest
