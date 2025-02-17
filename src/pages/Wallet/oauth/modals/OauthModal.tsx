import NiceModal, { useModal } from '@ebay/nice-modal-react'
import Oauth from '../index'
import { TPopup } from '@/components/tmd'

export const OauthModal = NiceModal.create(() => {
  const modal = useModal()

  const handleResolve = (data?: any) => {
    modal.resolve(data)
    modal.hide()
  }

  const handleCancel = () => {
    modal.reject('')
    modal.hide()
  }

  return (
    <TPopup
      visible={modal.visible}
      onMaskClick={handleCancel}
      onClose={handleCancel}
      bodyStyle={{ height: '80vh' }}
      destroyOnClose
      showCloseButton
    >
      <Oauth onSuccess={handleResolve} />
    </TPopup>
  )
})
