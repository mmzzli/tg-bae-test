import { AnimationControls, motion, PanInfo, useAnimation } from 'framer-motion'
import { FC, useEffect, useState } from 'react'
import Image from '@/components/Image/Image'
import { cn, getTimeStringAutoShort } from '@/utils/utils'
import { useIM } from '@/store/hook/userIM'
import { useNavigate } from 'react-router-dom'
import { Conversation } from '../SDK/BaeimSDK'
import { OthersUserInfo } from '@/types'
import { DeleteDialog } from './DeleteDialog'
import { useStore } from '@/store'

const ChatListItem: FC<{
  chat: Conversation
  className?: string
  onDragStateChange?: (isDragging: boolean) => void
  hasAnyItemDragged: boolean
  controlsMap: Map<string, AnimationControls>
}> = ({ chat, className, onDragStateChange, hasAnyItemDragged, controlsMap }) => {
  const controls = useAnimation()
  const [isDragging, setIsDragging] = useState(false)
  const navigate = useNavigate()
  const { getChatPeopleInfo, initChatPeopleInfo } = useIM()
  const { connection } = useStore((state) => ({
    connection: state.connection,
    updateChatListItem: state.updateChatListItem,
  }))
  const [chatPeople, setChatPeople] = useState<OthersUserInfo | null>(null)

  const resetAllItems = () => {
    controlsMap.forEach((control) => {
      control.start({ x: 0 })
    })
    setIsDragging(false)
    onDragStateChange?.(false)
  }

  useEffect(() => {
    const loadChatPeople = () => {
      const user = getChatPeopleInfo(Number(chat.channel.channelID))
      if (user) {
        setChatPeople(user)
      } else {
        initChatPeopleInfo(Number(chat.channel.channelID), setChatPeople)
      }
    }
    loadChatPeople()

    controlsMap.set(chat.channel.channelID, controls)
    return () => {
      controlsMap.delete(chat.channel.channelID)
    }
  }, [chat.channel.channelID, controls, controlsMap, getChatPeopleInfo, initChatPeopleInfo])

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = -50
    if (info.offset.x < threshold) {
      controls.start({ x: -80 })
      setIsDragging(true)
      onDragStateChange?.(true)
      setTimeout(() => {
        setIsDragging(false)
      }, 100)
    } else {
      controls.start({ x: 0 })
      setTimeout(() => {
        setIsDragging(false)
        onDragStateChange?.(false)
      }, 100)
    }
  }

  const onDelete = (id: string) => {
    connection?.removeConversation(id)
  }

  const handleClick = () => {
    if (hasAnyItemDragged || isDragging) {
      resetAllItems()
      return
    }

    if (chatPeople?.uid) {
      connection?.clearConversationUnread(chat.channel.channelID)
      navigate(`/chat/${chatPeople?.uid}`)
    }
  }
  useEffect(() => {
    controlsMap.set(chat.channel.channelID, controls)
    return () => {
      controlsMap.delete(chat.channel.channelID)
    }
  }, [])

  return (
    <div className={cn('relative h-[64px] w-full overflow-hidden', className)}>
      {/* Chat Item */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -80, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        onDragStart={() => setIsDragging(true)}
        animate={controls}
        style={{ x: 0 }}
        onClick={handleClick}
        className="absolute top-0 left-0 right-0 bottom-0 z-10"
      >
        <div className="flex items-center bg-black border border-black h-[64px] px-[24px]">
          {/* Avatar */}
          <div className="relative w-12 h-12 mr-3">
            <Image
              rect
              type="avatar"
              src={chatPeople?.avatar}
              alt={chatPeople?.username}
              width={48}
              height={48}
              className="w-full h-full rounded-full"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h3 className="flex-1 text-white font-medium truncate">{chatPeople?.username}</h3>
              <span className="text-gray-500 text-sm">
                {chat.lastMessage?.timestamp
                  ? getTimeStringAutoShort(chat.lastMessage?.timestamp * 1000, true)
                  : ''}
              </span>
            </div>

            <div className="flex justify-between items-start min-h-[24px]">
              <p className="flex-1 text-gray-400 text-sm truncate mt-1">
                {chat?.lastMessage?.content?.entity?.text}
              </p>
              {/* Unread Count */}
              {chat.unread ? (
                <div className="mt-1 ml-3 bg-[#4A3AFF] rounded-full w-[22px] h-[20px] flex items-center justify-center">
                  <span className="text-white text-xs">{chat.unread}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </motion.div>
      {/* <div
        className="cursor-pointer absolute right-0 top-[1px] bottom-[1px] w-[64px] bg-[#FF5330] flex items-center justify-center -z-1"
        onClick={() => onDelete(chat.channel.channelID)}
      >
        <span className="text-white">
          <img style={{ width: '20px', height: '20px' }} src={deleteIcon} alt="delete" />
          <DeleteDialog />
        </span>
      </div> */}

      <DeleteDialog onDelete={() => onDelete(chat.channel.channelID)} />
    </div>
  )
}

export default ChatListItem
