import NiceModal, { useModal } from '@ebay/nice-modal-react'
import Oauth from '../index'
import { TPopup } from '@/components/tmd'

export const OauthModal = NiceModal.create(() => {
  const modal = useModal()

  // const handleResolve = (mfa: string, pass: string) => {
  //   modal.resolve(mfa)
  //   modal.hide()
  //   return
  // }

  const handleCancel = () => {
    // modal.reject(new Error('Cancelled'))
    modal.hide()
  }

  return (
    <TPopup
      visible={modal.visible}
      onMaskClick={handleCancel}
      onClose={handleCancel}
      bodyStyle={{ height: '40vh' }}
      destroyOnClose
      showCloseButton
    >
      <Oauth />
    </TPopup>
  )
})
