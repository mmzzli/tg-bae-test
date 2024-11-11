import { cn } from '@/utils/utils'
import { useEffect, useRef } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import dayjs from 'dayjs'
import Image from '@/components/Image/Image'

interface Message {
  id: string
  content: string
  sender: number
  timestamp: number
}

interface MessageListProps {
  messages: Message[]
  loadMore: () => void
  hasMore: boolean
  className?: string
}

export const MessageList = ({ messages, loadMore, hasMore, className }: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollPositionKey = 'chat-scroll-position'
  const { getCurrentUid } = useTMAUtils()
  const current_uid = getCurrentUid()

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

  useEffect(() => {
    console.log('messages', messages)
  }, [messages])

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
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-end gap-2 mx-4 my-2 text-white ${
              message.sender === current_uid ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {message.sender !== current_uid && (
              <div className="flex-shrink-0">
                <Image
                  type="avatar"
                  width={26}
                  height={26}
                  src="/"
                  alt="Avatar"
                  className="w-[26px] h-[26px] rounded-full"
                />
              </div>
            )}
            <div
              className={`p-3 rounded-lg ${
                message.sender === current_uid
                  ? 'bg-[#4A3AFF]  max-w-[255px]'
                  : 'bg-[#303030]  max-w-[255px]'
              }`}
            >
              <div className="text-sm">{message.content}</div>
              <div className="text-xs mt-1 opacity-70 text-[#8E8E93]">
                {dayjs(message.timestamp).format('HH:mm')}
              </div>
            </div>
          </div>
        ))}
      </InfiniteScroll>
    </div>
  )
}
