import NiceModal, { useModal } from '@ebay/nice-modal-react'
import PaypinVerify from '../components/PaypinVerify'
import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { TPopup } from '@/components/tmd'

export const PromiseModal = NiceModal.create(() => {
  const modal = useModal()
  const location = useLocation()
  const isOpen = useRef<boolean>(false)

  const handleResolve = (mfa: string, pass: string) => {
    modal.resolve(mfa)
    modal.hide()
    return
  }

  const handleCancel = () => {
    modal.reject(new Error('Cancelled'))
    modal.hide()
  }

  useEffect(() => {
    if (isOpen.current) {
      modal.hide()
    }
  }, [location])

  useEffect(() => {
    isOpen.current = modal.visible
  }, [modal.visible])

  return (
    <TPopup
      visible={modal.visible}
      onMaskClick={handleCancel}
      onClose={handleCancel}
      bodyStyle={{ height: '80vh' }}
      destroyOnClose
      showCloseButton
      bodyClassName="flex flex-col px-4 py-3"
      safeArea
    >
      <PaypinVerify onSuccess={handleResolve} onFailed={() => {}} />
    </TPopup>
  )
})
