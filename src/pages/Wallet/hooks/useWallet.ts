import NiceModal from '@ebay/nice-modal-react'
import { OauthModal } from '../oauth/modals/OauthModal'
import { WalletRequestType } from '@/store/wallet/type'

const useWallet = () => {
  const hanleWalletAction = async (params: WalletRequestType) => {
    return new Promise((resolve) => {
      NiceModal.show(OauthModal, params)
        .then((data) => resolve(data))
        .catch((err) => resolve(err))
    })
  }

  return {
    hanleWalletAction,
  }
}

export default useWallet
