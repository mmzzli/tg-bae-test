import { Popup } from 'antd-mobile'
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import PaypinVerify from '../components/PaypinVerify'

export const PromiseModal = NiceModal.create(() => {
  const modal = useModal()

  const handleResolve = (mfa: string, pass: string) => {
    modal.resolve(mfa)
    modal.hide()
    return
  }

  const handleCancel = () => {
    modal.reject(new Error('Cancelled'))
    modal.hide()
  }

  return (
    <Popup
      visible={modal.visible}
      onMaskClick={handleCancel}
      onClose={handleCancel}
      bodyStyle={{ height: '40vh' }}
      destroyOnClose
      bodyClassName="px-4 py-3 overflow-y-auto bg-[#fff] dark:bg-[#1C1C1C] text-[#E0E2F6] rounded-t-2xl rounded-b-none border-[#1c1c1c]"
      showCloseButton
      closeIcon={
        <div
          className="flex items-center justify-center bg-[#F5F5FA] rounded-full ml-auto no-tap mb-3"
          style={{ height: '36px', width: '36px' }}
        >
          <i className="iconfont icon-icon_close text-[#12122A] dark:text-[#E0E2F6] text-[20px]"></i>
        </div>
      }
    >
      <PaypinVerify onSuccess={handleResolve} onFailed={handleCancel} />
    </Popup>
  )
})
