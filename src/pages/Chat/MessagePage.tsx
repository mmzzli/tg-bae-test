import { useState, useEffect } from 'react'
import { MessageList } from '@/components/Chat/MessageList'
import { MessageInput } from '@/components/Chat/MessageInput'
import { Message, MessageType } from '@/components/Chat/types'
import { useParams } from 'react-router-dom'
import { useFormatMessage } from '@/hooks/useFormatMessage'
import { useIM } from '@/store/hook/userIM'
import { useStore } from '@/store'

// const PAGE_SIZE = 20

const defaultMessages: Message[] = []

const MessagePage = () => {
  const { uid } = useParams()
  const [messages, setMessages] = useState<Message[]>(defaultMessages)
  // const [page, setPage] = useState(1)
  // const [hasMore, setHasMore] = useState(true)
  const { formatMessage } = useFormatMessage()
  const { getMessageWindowByReceiveId, sendMessage } = useIM()
  const messageWindow = getMessageWindowByReceiveId(Number(uid))
  // useEffect(() => {
  //   loadMessages()
  // }, [])
  const chatList = useStore((state) => state.chatList)
  useEffect(() => {
    if (messageWindow) {
      setMessages(messageWindow.messages)
    }
  }, [messageWindow])

  // const loadMore = () => {
  //   setPage((prev) => prev + 1)
  //   loadMessages()
  // }

  const handleSend = ({ type, text }: { type: MessageType; text?: string }) => {
    const newMessage = formatMessage({
      type,
      text,
      to: Number(uid),
    })
    sendMessage(newMessage)
    // setMessages((prev) => [...prev, newMessage])
  }

  return (
    <div className="flex flex-col h-screen bg-[#0D0D0D]">
      <MessageList messages={messages} loadMore={() => {}} hasMore={false} className="flex-1" />
      <MessageInput onSend={handleSend} />
    </div>
  )
}
export default MessagePage
