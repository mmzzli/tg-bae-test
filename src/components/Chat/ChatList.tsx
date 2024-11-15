import { FC, useState } from 'react'
import { ChatListProps } from './types'
import ChatListItem from './ChatListItem'
import { AnimationControls } from 'framer-motion'

const ChatList: FC<ChatListProps> = ({ chats }) => {
  const [hasAnyItemDragged, setHasAnyItemDragged] = useState(false)
  const [controlsMap] = useState(new Map<string, AnimationControls>())

  const handleDragStateChange = (channelId: string, isDragging: boolean) => {
    setHasAnyItemDragged(isDragging)
    if (isDragging) {
      controlsMap.forEach((control, id) => {
        if (id !== channelId) {
          control.start({ x: 0 })
        }
      })
    }
  }

  return (
    <>
      {chats.map((chat) => (
        <ChatListItem
          key={chat.channel.channelID}
          chat={chat}
          className="mb-[12px]"
          hasAnyItemDragged={hasAnyItemDragged}
          onDragStateChange={(isDragging: boolean) =>
            handleDragStateChange(chat.channel.channelID, isDragging)
          }
          controlsMap={controlsMap}
        />
      ))}
    </>
  )
}

export default ChatList
