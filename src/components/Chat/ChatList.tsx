import { FC, useEffect, useState } from 'react'
import { ChatListProps } from './types'
import ChatListItem from './ChatListItem'
import { AnimationControls } from 'framer-motion'

const useDragControls = (resetTrigger: number) => {
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

  useEffect(() => {
    controlsMap.forEach((control) => control.start({ x: 0 }))
    setHasAnyItemDragged(false)
  }, [resetTrigger])

  return {
    hasAnyItemDragged,
    controlsMap,
    handleDragStateChange,
  }
}

const ChatList: FC<ChatListProps & { resetTrigger: number }> = ({ chats, resetTrigger }) => {
  const { hasAnyItemDragged, controlsMap, handleDragStateChange } = useDragControls(resetTrigger)
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
