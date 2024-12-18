import { FC, memo, useEffect, useState } from 'react'
import Conversation from './ChatListItem'
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

const ConversationList: FC<{ ids: string[]; resetTrigger: number }> = memo(
  ({ ids, resetTrigger }) => {
    const { hasAnyItemDragged, controlsMap, handleDragStateChange } = useDragControls(resetTrigger)
    console.warn('ConversationList Render', ids)
    return (
      <>
        {ids.map((id) => (
          <Conversation
            key={id}
            conversationId={id}
            className="mb-[12px]"
            hasAnyItemDragged={hasAnyItemDragged}
            onDragStateChange={(isDragging: boolean) => handleDragStateChange(id, isDragging)}
            controlsMap={controlsMap}
          />
        ))}
      </>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.resetTrigger === nextProps.resetTrigger &&
      prevProps.ids.length === nextProps.ids.length &&
      prevProps.ids.every((id, index) => id === nextProps.ids[index])
    )
  }
)

export default ConversationList
