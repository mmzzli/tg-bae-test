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
      <Oauth onSuccess={handleResolve} />
    </TPopup>
  )
})
