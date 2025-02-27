import { Checkbox, useBoolean } from '@chakra-ui/react'

import BaseButton from '@/components/BaseButton/BaseButton'
import { useEffect, useState } from 'react'
import { useStore } from '@/store/store'
import { OthersUserInfo } from '@/types'
import { useDialog } from '@/hooks/useDialog'
import { Dialog, DialogContent } from '../BaseDialog/BaseDialog'
import { revokeMsg } from '@/api'

const sheetStyle: React.CSSProperties = {
  backgroundColor: '#1C1C1C',
  transition: `transform 400ms ease-in-out`,
  transform: 'translateZ(50px)',
}

const DeleteMessageModal = ({
  beforeClose,
  receiver,
  // message:
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

  const deleteMessageForBoth = () => {
    const deleteRequest = {
      channelId: '',
      messageId: '',
      messageClientId: '',
      deleteFor: [],
    }
  }
  const deleteMessageForMe = () => {
    const deleteRequest = {
      channelId: '',
      messageId: '',
      messageClientId: '',
      deleteFor: [],
    }
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
              handler={() => {
                deleteMessageForBoth()
              }}
            />
          )}

          <BaseButton
            text="Delete for me"
            className="w-full mt-[18px] h-[48px] mb-4 text-[15px] mx-[18px] bg-[#EB4B6D]"
            handler={() => {
              deleteMessageForMe()
            }}
          />
        </div>
      </div>
    </div>
  )
}
export default DeleteMessageModal

export function DeleteMessageDialog({
  onDelete,
  onCancel,
  title = 'Delete this message?',
  receiver,
}: {
  onDelete?: () => void
  onCancel?: () => void
  title?: string
  receiver: OthersUserInfo | null
}) {
  const [deleteForBoth, setDeleteForBoth] = useState(false)
  const { isOpen, onOpen, onClose } = useDialog()
  const deleteMessage = useStore((state) => state.deleteMessage)
  const setDeleteMessage = useStore((state) => state.setDeleteMessage)

  const handleDelete = async () => {
    console.log(deleteForBoth)
    try {
      // const res = await revokeMsg({
      //   message_id: deleteMessage?.messageId || '',
      //   channel_id: deleteMessage?.channelID || '',
      //   channel_type: 0,
      // })
      // console.log(res)
    } catch (err) {}

    // setDeleteMessage(null)
    onDelete?.()
  }

  const handleCancel = () => {
    setDeleteMessage(null)
  }

  useEffect(() => {
    if (deleteMessage) {
      onOpen()
      setDeleteForBoth(false)
    } else {
      onCancel?.()
      onClose()
    }
  }, [deleteMessage])

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleCancel}>
        <DialogContent>
          <div className="w-[312px] pb-[24px] pt-[30px] dark:bg-[#1C1C1C] text-base font-medium bg-white dark:text-white text-[#333] text-center rounded-[16px] ov">
            <div className="font-[500] text-[18px]">{title}</div>

            <div className="mt-[24px] text-sm font-normal text-[#666666]">
              {deleteMessage?.receiver === receiver?.uid ? (
                <div>
                  <Checkbox
                    onChange={(e) => {
                      setDeleteForBoth(e.target.checked)
                    }}
                    variant="subtle"
                    className="rounded-checkbox"
                  >
                    <span className="text-sm">{`Delete for me and ${receiver?.username}`}</span>
                  </Checkbox>
                </div>
              ) : (
                <span>It will only be removed on your side.</span>
              )}
            </div>
            <div className="flex justify-center gap-4 mt-[30px]">
              <div
                className="cursor-pointer flex items-center justify-center w-[120px] h-[40px] border dark:border-white border-[#ccc] rounded-[20px] text-sm"
                onClick={handleCancel}
              >
                Cancel
              </div>
              <div
                className="cursor-pointer flex items-center justify-center w-[120px] h-[40px] dark:bg-[#FF5330] bg-[#EB4B6D] text-white dark:text-[] rounded-[20px] text-sm"
                onClick={handleDelete}
              >
                Delete
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
