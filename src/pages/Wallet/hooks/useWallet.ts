import NiceModal from '@ebay/nice-modal-react'
import { OauthModal } from '../oauth/modals/OauthModal'
import { WalletRequestType } from '@/store/wallet/type'
import { useState } from 'react'
import { useWalletRequestStore } from '@/store/wallet/walletRequest'

const useWallet = () => {
  const { requestParamActions } = useWalletRequestStore()
  const hanleWalletAction = async (params: WalletRequestType) => {
    requestParamActions(params)
    return await NiceModal.show(OauthModal)
  }

  return {
    hanleWalletAction,
  }
}

export default useWallet
