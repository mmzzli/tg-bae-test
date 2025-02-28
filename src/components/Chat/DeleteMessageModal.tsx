import { Checkbox, useBoolean, useToast } from '@chakra-ui/react'

import BaseButton from '@/components/BaseButton/BaseButton'
import { useEffect, useState } from 'react'
import { useStore } from '@/store/store'
import { OthersUserInfo } from '@/types'
import { useDialog } from '@/hooks/useDialog'
import { Dialog, DialogContent } from '../BaseDialog/BaseDialog'
import { deleteMsg, sendDeleteMsgNotification } from '@/api'
import { CustomToast, typeOptions } from '../comm/Toast'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { Buffer } from 'buffer'
import { Conversation } from '../SDK/BaeimSDK'
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
  const [pending, setPending] = useState(false)
  const deleteMessage = useStore((state) => state.deleteMessage)
  const setDeleteMessage = useStore((state) => state.setDeleteMessage)

  const { getCurrentUid } = useTMAUtils()
  const current_uid = getCurrentUid()
  const toast = useToast()

  const handleDelete = async () => {
    try {
      setPending(true)
      const res = await deleteMsg({
        message_id: deleteMessage?.messageId || '',
      })
      console.log(res)
      toast({
        render: () => {
          return <CustomToast title="Delete" type={typeOptions.success} />
        },
        position: 'bottom',
      })
      setPending(false)

      // 删除聊天窗口消息
      const messageWindow = useStore
        .getState()
        .messageWindowList.filter((item) => item.channel.channelID === String(receiver?.uid))
      if (messageWindow.length > 0) {
        const newMessages = messageWindow[0].messages.filter(
          (msg) => msg.messageId !== deleteMessage?.messageId
        )
        useStore
          .getState()
          .updateMessageWindowListItem({ ...messageWindow[0], messages: newMessages })
      }
      // 更新会话
      if (receiver && receiver.uid) {
        const conversation = useStore.getState().conversationMap[receiver.uid]
        console.log(conversation)
        if (conversation) {
          const recents = conversation.recents?.filter(
            (recent) => recent.messageID !== deleteMessage?.messageId
          )
          const newConversation = {
            ...conversation,
            recents,
            lastMessage: recents ? recents[0] : {},
          }
          useStore.getState().updateConversation(newConversation as Conversation)
        }
      }
    } catch (err) {
      console.log(err)
      setPending(false)
    }
    const buffer = Buffer.from(
      JSON.stringify({
        type: 99, // cmd固定type为99
        cmd: 'DeleteMessage',
        param: {
          from: current_uid,
          message_id: deleteMessage?.messageId,
          channel_id: String(receiver?.uid),
          channel_type: 1,
        },
      }),
      'utf-8'
    )
    const base64 = buffer.toString('base64')
    sendDeleteMsgNotification({
      header: {
        // 消息头
        no_persist: 1, // 是否不存储消息 0.存储 1.不存储
        red_dot: 0, // 是否显示红点计数，0.不显示 1.显示
        sync_once: 1, // 是否是写扩散，这里一般是0，只有cmd消息才是1
      },
      from_uid: String(current_uid), // 发送者uid
      channel_id: String(receiver?.uid), // 接收频道ID 如果channel_type=1 channel_id为个人uid 如果channel_type=2 channel_id为群id
      channel_type: 1, // 接收频道类型  1.个人频道 2.群聊频道
      payload: base64, // 消息内容，base64编码
      subscribers: [], // 订阅者 如果此字段有值，表示消息只发给指定的订阅者,没有值则发给频道内所有订阅者
    })
    setDeleteMessage(null)
    onDelete?.()
  }

  const handleCancel = () => {
    setDeleteMessage(null)
    setPending(false)
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
                  {/* <Checkbox
                    onChange={(e) => {
                      setDeleteForBoth(e.target.checked)
                    }}
                    variant="subtle"
                    className="rounded-checkbox"
                  >
                    <span className="text-sm">{`Delete for me and ${receiver?.username}`}</span>
                  </Checkbox> */}
                  <span className="text-sm">{`Delete for me and ${receiver?.username}`}</span>
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
              {/* <div
                className="cursor-pointer flex items-center justify-center w-[120px] h-[40px] dark:bg-[#FF5330] bg-[#EB4B6D] text-white dark:text-[] rounded-[20px] text-sm"
                onClick={handleDelete}
              >
                Delete
              </div> */}
              <BaseButton
                loading={pending}
                text="Delete"
                handler={handleDelete}
                className="cursor-pointer flex items-center justify-center w-[120px] h-[40px] dark:bg-[#FF5330] bg-[#EB4B6D] text-white dark:text-[] rounded-[20px] text-sm"
              ></BaseButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
