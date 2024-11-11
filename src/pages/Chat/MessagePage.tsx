import { useState, useEffect } from 'react'
import { MessageList } from '@/components/Chat/MessageList'
import { MessageInput } from '@/components/Chat/MessageInput'
import { useTMAUtils } from '@/hooks/useTMAUtils'

interface ChatMessage {
  id: string
  content: string
  sender: number
  timestamp: number
}

const PAGE_SIZE = 20

const defaultMessages: ChatMessage[] = [
  {
    id: '1',
    content: 'Hello',
    sender: 1,
    timestamp: Date.now(),
  },
  {
    id: '2',
    content: 'Hello',
    sender: 1,
    timestamp: Date.now(),
  },
]

const MessagePage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(defaultMessages)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { getCurrentUid } = useTMAUtils()
  const current_uid = getCurrentUid()

  useEffect(() => {
    loadMessages()
  }, [])

  const loadMessages = () => {
    const savedMessages = localStorage.getItem('chat-messages')
    if (savedMessages) {
      const allMessages = JSON.parse(savedMessages)
      const start = Math.max(0, allMessages.length - page * PAGE_SIZE)
      const end = allMessages.length
      const paginatedMessages = allMessages.slice(start, end)

      setMessages(paginatedMessages)
      setHasMore(start > 0)
    }
  }

  const loadMore = () => {
    setPage((prev) => prev + 1)
    loadMessages()
  }

  const handleSend = (content: string) => {
    const newMessage = {
      id: Date.now().toString(),
      content,
      sender: current_uid,
      timestamp: Date.now(),
    }

    const savedMessages = localStorage.getItem('chat-messages')
    const allMessages = savedMessages ? JSON.parse(savedMessages) : []
    const updatedMessages = [...allMessages, newMessage]

    localStorage.setItem('chat-messages', JSON.stringify(updatedMessages))
    setMessages((prev) => [...prev, newMessage])
  }

  return (
    <div className="flex flex-col h-screen bg-[#0D0D0D]">
      <MessageList messages={messages} loadMore={loadMore} hasMore={hasMore} className="flex-1" />
      <MessageInput onSend={handleSend} />
    </div>
  )
}
export default MessagePage
