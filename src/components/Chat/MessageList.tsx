import { cn, getMessageTimeDivider, getWrappedMessage } from '@/utils/utils'
import { memo, Ref, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import dayjs from 'dayjs'
import Image from '@/components/Image/Image'
import { MessageType, WrappedMessage } from './types'
import { MessageRender } from './MessageRender'
import { OthersUserInfo } from '@/types/postTypes'
import { PullMode } from '../SDK/BaeimSDK'
import { useStore } from '@/store'
import { useIM } from '@/store/hook/userIM'
import Tooltip from '@/components/LoogPressToolTip'
import { IUserInfo } from '@/types'

interface MessageListProps {
  messages: WrappedMessage[]
  loadMore?: () => void
  className?: string
  channelInfo: OthersUserInfo | null
  channelId: string
  style?: React.CSSProperties
}

export const MessageList = ({
  messages,
  className,
  channelInfo,
  channelId,
  style,
}: MessageListProps) => {
  const { getCurrentUid } = useTMAUtils()
  const current_uid = getCurrentUid()
  const connection = useStore((state) => state.connection)
  const { updateMessage } = useIM()
  const [hasMore, setHasMore] = useState(true)

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

    return groups.reverse()
  }, [messages])

  const handleLoadMore = async () => {
    console.log('load more')
    if (messages[0].messageSeq === 1) {
      return setHasMore(false)
    }

    if (!hasMore) return
    setHasMore(false)

    try {
      const msgs = await connection?.getMessages(channelInfo?.uid.toString() || '', {
        limit: 5,
        startMessageSeq: messages[0].messageSeq - 1,
        endMessageSeq: 0,
        pullMode: PullMode.Down,
      })

      if (msgs && msgs.length > 0) {
        const result: WrappedMessage[] = msgs.map((message) => getWrappedMessage(message))
        updateMessage(result, Number(channelInfo?.uid), true)
      }
    } finally {
      setTimeout(() => {
        setHasMore(true)
      }, 300)
    }
  }

  return (
    <InfiniteList
      messages={messages}
      className={className}
      TimeDevider={TimeDevider}
      MessageItem={MessageItem}
      style={style}
      handleLoadMore={handleLoadMore}
      hasMore={hasMore}
      messageGroups={messageGroups}
      channelInfo={channelInfo}
      channelId={channelId}
      current_uid={current_uid}
    />
  )
}
const MessageItem = memo(
  ({
    message,
    isCurrentUser,
    channelInfo,
    userInfo,
    className,
    channelId,
  }: {
    message: WrappedMessage
    isCurrentUser: boolean
    channelInfo: OthersUserInfo | null
    userInfo: IUserInfo
    className?: string
    channelId: string
  }) => (
    <div
      id={message.id}
      className={cn(
        `flex items-end gap-2 mx-4 my-2 text-white ${
          isCurrentUser ? 'flex-row-reverse' : 'flex-row'
        }`,
        className
      )}
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
      <Tooltip
        content={message}
        user={isCurrentUser ? userInfo : channelInfo}
        channelId={channelId}
        delay={800}
        id={message.id}
        config={{ enableReply: true, enableCopy: true, enableDownload: false }}
      >
        <div
          className={`overflow-hidden rounded-lg max-w-[255px]
          ${isCurrentUser && message.type === MessageType.TEXT ? 'bg-[#6254ff] dark:bg-[#4A3AFF] text-white my-msg' : 'dark:bg-[#303030] bg-[#ffffff] text-[#333333] dark:text-white other-msg'}
          ${message.type === MessageType.TEXT ? 'p-3' : 'inline-block'}
        `}
        >
          <MessageRender message={message} />
        </div>
      </Tooltip>
    </div>
  )
)

const TimeDevider = memo(({ timestamp }: { timestamp: number }) => (
  <div className="flex items-center justify-center mt-[20px] mb-4">
    <div className="text-xs dark:text-[#ffffff99] text-[#999999] px-2 py-1 rounded">
      {getMessageTimeDivider(timestamp, true)}
    </div>
  </div>
))

const InfiniteList = ({
  messages,
  className,
  style,
  handleLoadMore,
  hasMore,
  messageGroups,
  MessageItem,
  TimeDevider,
  channelInfo,
  current_uid,
  channelId,
}: {
  messages: WrappedMessage[]
  className?: string
  style?: React.CSSProperties
  handleLoadMore: () => Promise<void>
  hasMore: boolean
  messageGroups: { timestamp: number; messages: WrappedMessage[] }[]
  channelInfo: OthersUserInfo | null
  current_uid: number
  TimeDevider: React.FC<{ timestamp: number }>
  MessageItem: React.FC<{
    message: WrappedMessage
    isCurrentUser: boolean
    channelInfo: OthersUserInfo | null
    userInfo: IUserInfo
    className?: string
    channelId: string
  }>
  channelId: string
}) => {
  const userInfo = useStore((state) => state.userInfo)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    const handleScrollToBottom = () => {
      scrollToBottom()
    }

    window.addEventListener('message-scroll-to-bottom', handleScrollToBottom)

    return () => {
      window.removeEventListener('message-scroll-to-bottom', handleScrollToBottom)
    }
  }, [])
  return (
    <div
      id="scrollableDiv"
      ref={scrollRef}
      className={cn('overflow-auto flex flex-col-reverse', className)}
      style={style}
    >
      <InfiniteScroll
        dataLength={messages.length}
        next={handleLoadMore}
        hasMore={hasMore}
        inverse={true}
        loader={<div className="text-center"></div>}
        scrollableTarget="scrollableDiv"
        style={{ display: 'flex', flexDirection: 'column-reverse', overflow: 'visible' }} // start from bottom
      >
        <div className="h-[22px]"></div>
        {messageGroups.map((group) => (
          <div key={`group-${group.timestamp}`} className={`group-${group.timestamp}`}>
            <TimeDevider timestamp={group.timestamp} />
            {group.messages.map((message, index) => (
              <MessageItem
                key={`message-${message.id}-${index}`}
                className={`message-${message.id}-${index}`}
                message={message}
                isCurrentUser={message.sender === current_uid}
                channelInfo={channelInfo}
                channelId={channelId}
                userInfo={userInfo}
              />
            ))}
          </div>
        ))}
      </InfiniteScroll>
    </div>
  )
}
