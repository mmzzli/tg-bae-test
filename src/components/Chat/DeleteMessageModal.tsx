import { useBoolean } from '@chakra-ui/react'

import BaseButton from '@/components/BaseButton/BaseButton'
import { useEffect, useRef, useState } from 'react'
import { useStore } from '@/store/store'
import { OthersUserInfo } from '@/types'

const sheetStyle: React.CSSProperties = {
  backgroundColor: '#1C1C1C',
  transition: `transform 400ms ease-in-out`,
  transform: 'translateZ(50px)',
}

const DeleteMessageModal = ({
  beforeClose,
  receiver,
}: {
  beforeClose?: () => void
  receiver: OthersUserInfo | null
}) => {
  const deleteMessage = useStore((state) => state.deleteMessage)
  const setDeleteMessage = useStore((state) => state.setDeleteMessage)

  const [isBaseModalOpen, { toggle, off }] = useBoolean(false)
  const handleClose = () => {
    beforeClose?.()
    setDeleteMessage(null)
  }

  useEffect(() => {
    if (deleteMessage) {
      toggle()
    } else {
      off()
    }
  }, [deleteMessage])

  useEffect(() => {
    if (isBaseModalOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isBaseModalOpen])

  useEffect(() => {
    setDeleteMessage(null)
  }, [])

  return (
    <div
      className={`fixed inset-0 z-[99] ${
        isBaseModalOpen ? 'visible dark:bg-black/80 bg-black/70' : 'invisible'
      } transition-all duration-300`}
      role="dialog"
      aria-modal="true"
      aria-hidden={!isBaseModalOpen}
      style={{ transform: 'translateZ(50px)' }}
    >
      <div
        className={`fixed z-50 bottom-0 left-0 right-0 rounded-t-2xl bg-white dark:bg-gray-800 transition-transform ${
          isBaseModalOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={sheetStyle}
      >
        <div
          className="relative px-[24px] overflow-y-auto dark:bg-[#1C1C1C] bg-white text-[#E0E2F6] rounded-t-2xl rounded-b-none border-[#1c1c1c] max-h-[70vh]"
          style={{
            paddingBottom:
              'calc(14px + var(--tg-safe-area-inset-bottom) + var(--tg-content-safe-area-inset-bottom)',
          }}
        >
          <div className="sticky top-0 flex items-center justify-end dark:bg-[#1C1C1C] bg-white z-10 h-[58px]">
            <button
              onClick={() => handleClose()}
              className="dark:text-white text-black w-9 h-9 flex items-center justify-center bg-[#F5F5FA] rounded-full"
            >
              <i className="iconfont icon-icon_close text-[#12122A] dark:text-[#E0E2F6] text-[20px]"></i>
            </button>
          </div>

          <h3 className="font-bold text-2xl mb-[10px] text-[24px] text-[#333] leading-[28px]">
            Delete message
          </h3>
          <div className="text-[15px] text-[#999] mb-[34px] font-normal">Delete this message?</div>
          {deleteMessage?.receiver === receiver?.uid && (
            <BaseButton
              text={`Delete for me and ${receiver?.username}`}
              className="w-full mt-[18px] h-[48px] text-[15px] mx-[18px] bg-[#EB4B6D]"
              handler={() => {}}
            />
          )}

          <BaseButton
            text="Delete for me"
            className="w-full mt-[18px] h-[48px] mb-4 text-[15px] mx-[18px] bg-[#EB4B6D]"
            handler={() => {}}
          />
        </div>
      </div>
    </div>
  )
}
export default DeleteMessageModal
