import NiceModal, { useModal } from '@ebay/nice-modal-react'
import Oauth from '../index'
import { TPopup } from '@/components/tmd'
import { WalletRequestType } from '@/store/wallet/type'

export const OauthModal = NiceModal.create((requestParams: WalletRequestType) => {
  const modal = useModal()

  const handleResolve = (data?: any) => {
    modal.resolve(data)
    modal.hide()
  }

  const handleCancel = () => {
    modal.reject('')
    modal.remove()
  }

  return (
    <TPopup
      visible={modal.visible}
      // onMaskClick={handleCancel1}
      onClose={handleCancel}
      bodyStyle={{ height: '80vh' }}
      destroyOnClose
      showCloseButton
      bodyClassName="flex flex-col"
    >
      <Oauth onSuccess={handleResolve} requestParams={requestParams} />
    </TPopup>
  )
})
