import { AnimationControls, motion, PanInfo, useAnimation } from 'framer-motion'
import { FC, memo, useEffect, useState } from 'react'
import Image from '@/components/Image/Image'
import { cn, getTimeStringAutoShort } from '@/utils/utils'
import { useIM } from '@/store/hook/userIM'
import { useNavigate } from 'react-router-dom'
import { Conversation } from '../SDK/BaeimSDK'
import { OthersUserInfo } from '@/types'
import { DeleteDialog } from './DeleteDialog'
import { useStore } from '@/store'
import { setUnread, deleteConversation } from '@/api'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { useToast } from '@chakra-ui/react'
import { CustomToast, typeOptions } from '../comm/Toast'
import { MessageType } from './types'

const ChatAvatar: FC<{ user: OthersUserInfo | null }> = ({ user }) => (
  <div className="relative w-12 h-12 mr-4">
    <Image
      rect
      type="avatar"
      src={user?.avatar}
      alt={user?.username}
      width={48}
      height={48}
      className="w-full h-full rounded-full"
    />
  </div>
)

const ChatContent: FC<{ user: OthersUserInfo | null; chat: Conversation }> = ({ user, chat }) => (
  <div className="flex-1 min-w-0">
    <div className="flex justify-between items-center">
      <h3 className="flex-1 dark:text-white text-[#0F1233] font-medium truncate">
        {user?.username}
      </h3>
      <span className="dark:text-gray-500 text-[#888888] text-xs">
        {chat.lastMessage?.timestamp
          ? getTimeStringAutoShort(chat.lastMessage?.timestamp * 1000, true)
          : ''}
      </span>
    </div>

    <div className="flex justify-between items-start min-h-[24px]">
      <p className="flex-1 text-[#666] text-sm truncate mt-1 font-normal">
        {chat?.lastMessage?.content?.entity?.type === MessageType.REWARD && '[Reward]'}
        {chat?.lastMessage?.content?.entity?.type === MessageType.IMAGE && '[Picture]'}
        {chat?.lastMessage?.content?.entity?.type === MessageType.VIDEO && '[Video]'}
        {chat?.lastMessage?.content?.entity?.type === MessageType.TEXT &&
          chat?.lastMessage?.content?.entity?.text}
      </p>
      {chat.unread ? (
        <div className="mt-1 ml-3 bg-[#6254FF] rounded-full w-[22px] h-[20px] flex items-center justify-center">
          <span className="text-white text-xs">{chat.unread}</span>
        </div>
      ) : null}
    </div>
  </div>
)

const ChatListItem: FC<{
  conversationId: string
  className?: string
  onDragStateChange?: (isDragging: boolean) => void
  hasAnyItemDragged: boolean
  controlsMap: Map<string, AnimationControls>
}> = ({ conversationId, className, onDragStateChange, hasAnyItemDragged, controlsMap }) => {
  const controls = useAnimation()
  const [isDragging, setIsDragging] = useState(false)
  const navigate = useNavigate()
  const { getChatPeopleInfo, initChatPeopleInfo } = useIM()
  const { connection, deleteConversationInStore } = useStore((state) => ({
    connection: state.connection,
    // updateChatListItem: state.updateChatListItem,
    deleteConversationInStore: state.deleteConversation,
  }))
  const [chatPeople, setChatPeople] = useState<OthersUserInfo | null>(null)

  const chat = useStore((state) => ({
    ...state.conversationMap[conversationId],
  })) as Conversation
  const { getCurrentUid } = useTMAUtils()
  const current_uid = getCurrentUid()
  const toast = useToast()

  useEffect(() => {
    const loadChatPeople = () => {
      const user = getChatPeopleInfo(Number(chat.channel.channelID))
      if (user) {
        setChatPeople(user)
      } else {
        if (Number(chat.channel.channelID)) {
          initChatPeopleInfo(Number(chat.channel.channelID), setChatPeople)
        }
      }
    }
    loadChatPeople()

    controlsMap.set(chat.channel.channelID, controls)
    return () => {
      controlsMap.delete(chat.channel.channelID)
    }
  }, [chat.channel.channelID, controls, controlsMap, getChatPeopleInfo, initChatPeopleInfo])

  const resetAllItems = () => {
    controlsMap.forEach((control) => {
      control.start({ x: 0 })
    })
    setIsDragging(false)
    onDragStateChange?.(false)
  }

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = -50
    const resetDragging = () => {
      setTimeout(() => {
        setIsDragging(false)
      }, 100)
    }

    if (info.offset.x < threshold) {
      controls.start({ x: -80 })
      setIsDragging(true)
      onDragStateChange?.(true)
      resetDragging()
    } else {
      controls.start({ x: 0 })
      resetDragging()
    }
  }

  const handleClick = () => {
    if (hasAnyItemDragged || isDragging) {
      resetAllItems()
      return
    }

    if (chatPeople?.uid) {
      // connection?.clearConversationUnread(chat.channel.channelID)
      setUnread({
        uid: current_uid + '',
        channel_id: chat.channel.channelID,
        channel_type: chat.channel.channelType,
        unread: 0,
      })
      connection?.clearConversationUnread(chat.channel.channelID)
      navigate(`/chat/${chatPeople?.uid}`)
    }
  }

  // console.warn('ChatListItem Render chat change', chat)

  return (
    <div className={cn('relative h-[64px] w-full overflow-hidden', className)}>
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -80, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        onDragStart={() => setIsDragging(true)}
        animate={controls}
        style={{ x: 0 }}
        onClick={handleClick}
        className="absolute top-0 left-0 right-0 bottom-0 dark:bg-black bg-white z-20"
      >
        <div className="flex items-center  h-[64px] px-[24px]">
          <ChatAvatar user={chatPeople} />
          <ChatContent user={chatPeople} chat={chat} />
        </div>
      </motion.div>
      <DeleteDialog
        onDelete={() => {
          deleteConversation({
            uid: current_uid + '',
            channel_id: chat.channel.channelID,
            channel_type: chat.channel.channelType,
          })
            .then((res) => {
              if (res && res.status === 200) {
                connection?.removeConversation(chat.channel.channelID)
                deleteConversationInStore(chat.channel.channelID)
              } else {
                toast({
                  render: () => {
                    return <CustomToast title="Delete failed" type={typeOptions.error} />
                  },
                  position: 'bottom',
                })
              }
            })
            .catch(() => {
              toast({
                render: () => {
                  return <CustomToast title="Delete failed" type={typeOptions.error} />
                },
                position: 'bottom',
              })
            })

          controls.start({ x: 0 })
        }}
        onCancel={() => {
          controls.start({ x: 0 })
        }}
      />
    </div>
  )
}

export default memo(ChatListItem)
