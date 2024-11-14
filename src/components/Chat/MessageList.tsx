import { cn } from '@/utils/utils'
import { memo, useEffect, useMemo, useRef } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import dayjs from 'dayjs'
import Image from '@/components/Image/Image'
import { WrappedMessage } from './types'
import { MessageRender } from './MessageRender'
import { OthersUserInfo } from '@/types/postTypes'
interface MessageListProps {
  messages: WrappedMessage[]
  loadMore: () => void
  hasMore: boolean
  className?: string
  channelInfo: OthersUserInfo | null
}

export const MessageList = ({
  messages,
  loadMore,
  hasMore,
  className,
  channelInfo,
}: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollPositionKey = 'chat-scroll-position'
  const { getCurrentUid } = useTMAUtils()
  const current_uid = getCurrentUid()

  const messageGroups = useMemo(() => {
    const groups: { timestamp: number; messages: WrappedMessage[] }[] = []
    let currentGroup: WrappedMessage[] = []
    let currentTimestamp: number | null = null

    ;[...messages].forEach((message) => {
      const messageTime = dayjs(message.timestamp * 1000)

      if (currentTimestamp === null) {
        currentTimestamp = messageTime.valueOf()
        currentGroup.push(message)
      } else {
        const diff = Math.abs(messageTime.diff(currentTimestamp, 'minute'))

        if (diff <= 2) {
          currentGroup.push(message)
        } else {
          groups.push({
            timestamp: currentTimestamp,
            messages: currentGroup,
          })
          currentGroup = [message]
          currentTimestamp = messageTime.valueOf()
        }
      }
    })

    if (currentGroup.length > 0 && currentTimestamp !== null) {
      groups.push({
        timestamp: currentTimestamp,
        messages: currentGroup,
      })
    }

    return groups
  }, [messages])

  const MessageItem = memo(
    ({
      message,
      isCurrentUser,
      channelInfo,
    }: {
      message: WrappedMessage
      isCurrentUser: boolean
      channelInfo: OthersUserInfo | null
    }) => (
      <div
        className={`flex items-end gap-2 mx-4 my-2 text-white ${
          isCurrentUser ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        {!isCurrentUser && (
          <div className="flex-shrink-0">
            <Image
              type="avatar"
              width={26}
              height={26}
              src={channelInfo?.avatar}
              alt="Avatar"
              className="w-[26px] h-[26px] rounded-full"
            />
          </div>
        )}
        <div
          className={`p-3 rounded-lg ${
            isCurrentUser ? 'bg-[#4A3AFF] max-w-[255px]' : 'bg-[#303030] max-w-[255px]'
          }`}
        >
          <div className="text-sm">
            <MessageRender message={message} />
          </div>
        </div>
      </div>
    )
  )

  const TimeDevider = memo(({ timestamp }: { timestamp: number }) => (
    <div className="flex items-center justify-center my-4">
      <div className="text-xs text-[#8E8E93] bg-[#1C1C1E] px-2 py-1 rounded">
        {dayjs(timestamp).format('MM-DD HH:mm')}
      </div>
    </div>
  ))

  // restore scroll position
  useEffect(() => {
    const savedScrollPos = localStorage.getItem(scrollPositionKey)
    if (savedScrollPos && scrollRef.current) {
      scrollRef.current.scrollTop = Number(savedScrollPos)
    }
  }, [])

  // save scroll position
  const handleScroll = () => {
    if (scrollRef.current) {
      localStorage.setItem(scrollPositionKey, scrollRef.current.scrollTop.toString())
    }
  }

  return (
    <div
      id="scrollableDiv"
      ref={scrollRef}
      onScroll={handleScroll}
      className={cn('overflow-auto flex flex-col-reverse', className)}
    >
      <InfiniteScroll
        dataLength={messages.length}
        next={loadMore}
        hasMore={hasMore}
        loader={<div className="text-center py-4">Loading...</div>}
        scrollableTarget="scrollableDiv"
        style={{ display: 'flex', flexDirection: 'column' }} // start from bottom
      >
        {messageGroups.map((group) => (
          <div key={`group-${group.timestamp}`}>
            <TimeDevider timestamp={group.timestamp} />
            {group.messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                isCurrentUser={message.sender === current_uid}
                channelInfo={channelInfo}
              />
            ))}
          </div>
        ))}
      </InfiniteScroll>
    </div>
  )
}
