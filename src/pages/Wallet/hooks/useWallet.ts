import NiceModal from '@ebay/nice-modal-react'
import { OauthModal } from '../oauth/modals/OauthModal'
import { WalletRequestType } from '@/store/wallet/type'
import { useWalletRequestStore } from '@/store/wallet/walletRequest'

const useWallet = () => {
  const { requestParamActions } = useWalletRequestStore()

  const hanleWalletAction = async (params: WalletRequestType) => {
    requestParamActions(params)

    return new Promise((resolve, reject) => {
      NiceModal.show(OauthModal)
        .then((data) => resolve(data))
        .catch((err) => reject(err))
    })
  }

  return {
    hanleWalletAction,
  }
}

export default useWallet
