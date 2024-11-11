import { motion, PanInfo, useAnimation } from 'framer-motion'
import dayjs from 'dayjs'
import { type ChatListItem } from './types'
import { FC } from 'react'
import Image from '@/components/Image/Image'
import { cn } from '@/utils/utils'
import { useIM } from '@/store/hook/userIM'
import { useNavigate } from 'react-router-dom'

const ChatListItem: FC<{
  chat: ChatListItem
  onDelete: (id: string) => void
  className?: string
}> = ({ chat, onDelete, className }) => {
  const controls = useAnimation()
  const { getChatPeopleInfo } = useIM()
  const navigate = useNavigate()
  const chatPeople = getChatPeopleInfo(chat.users)
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = -50 // Swipe threshold to show delete button
    if (info.offset.x < threshold) {
      controls.start({ x: -80 }) // Show delete button
    } else {
      controls.start({ x: 0 }) // Reset position
    }
  }

  return (
    <div className={cn('relative h-[64px] w-full overflow-hidden', className)}>
      {/* Chat Item */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -80, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x: 0 }}
        className="absolute top-0 left-0 right-0 bottom-0 z-10"
      >
        <div
          className="flex items-center bg-black border border-black h-[64px] px-[24px]"
          onClick={() => {
            if (chatPeople?.uid) {
              navigate(`/chat/${chatPeople?.uid}`)
            }
          }}
        >
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
                {dayjs(chat.lastMessage?.timestamp).format('HH:mm')}
              </span>
            </div>

            <div className="flex justify-between items-start">
              <p className="flex-1 text-gray-400 text-sm truncate mt-1">
                {chat?.lastMessage?.text}
              </p>
              {/* Unread Count */}
              {chat.unreadCount ? (
                <div className="mt-1 ml-3 bg-[#4A3AFF] rounded-full w-[22px] h-[20px] flex items-center justify-center">
                  <span className="text-white text-xs">{chat.unreadCount}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </motion.div>
      <div
        className="absolute right-0 top-[1px] bottom-[1px] w-[64px] bg-red-500 flex items-center justify-center -z-1"
        onClick={() => onDelete(chat.id)}
      >
        <span className="text-white">Delete</span>
      </div>
    </div>
  )
}

export default ChatListItem
