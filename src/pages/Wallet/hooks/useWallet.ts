import NiceModal from '@ebay/nice-modal-react'
import { OauthModal } from '../oauth/modals/OauthModal'

const useWallet = () => {
  const hanleWalletAction = async ({}) => {
    // todo... store action.

    return await NiceModal.show(OauthModal)
  }

  return {
    hanleWalletAction,
  }
}

export default useWallet
