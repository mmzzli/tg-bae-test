import { useState, useEffect } from 'react'
import { MessageList } from '@/components/Chat/MessageList'
import { MessageInput } from '@/components/Chat/MessageInput'
import { MessageType, WrappedMessage } from '@/components/Chat/types'
import { useParams } from 'react-router-dom'
import { useFormatMessage } from '@/hooks/useFormatMessage'
import { useIM } from '@/store/hook/userIM'
import { useStore } from '@/store'
import { OthersUserInfo } from '@/types'
// const PAGE_SIZE = 20

const defaultMessages: WrappedMessage[] = []

const MessagePage = () => {
  const { uid } = useParams()
  const [messages, setMessages] = useState<WrappedMessage[]>(defaultMessages)
  const [chatPeople, setChatPeople] = useState<OthersUserInfo | null>(null)
  // const [page, setPage] = useState(1)
  // const [hasMore, setHasMore] = useState(true)
  const { formatMessage } = useFormatMessage()
  const { sendMessage, getMessageWindow, getChatPeopleInfo, initChatPeopleInfo } = useIM()
  const messageWindow = getMessageWindow(uid || '')
  const messageWindowList = useStore((state) => state.messageWindowList)

  useEffect(() => {
    console.log('MessagePage messageWindowList change', messageWindowList)
    if (messageWindow) {
      setMessages(messageWindow.messages)
    }
  }, [messageWindow, messageWindowList])

  // const loadMore = () => {
  //   setPage((prev) => prev + 1)
  //   loadMessages()
  // }

  useEffect(() => {
    if (messageWindow) {
      const loadChatPeople = () => {
        const user = getChatPeopleInfo(Number(messageWindow.channel.channelID))
        if (user) {
          setChatPeople(user)
        } else {
          initChatPeopleInfo(Number(messageWindow.channel.channelID), (user) => {
            setChatPeople(user)
          })
        }
      }
      loadChatPeople()
    }
  }, [messageWindow])

  const handleSend = ({ type, text }: { type: MessageType; text?: string }) => {
    const newMessage = formatMessage({
      type,
      text,
      to: Number(uid),
    })
    sendMessage(newMessage)
  }

  console.log('MessagePage render', messageWindow)
  return (
    <div className="flex flex-col h-screen bg-[#0D0D0D]">
      <div className="flex items-center px-[16px] my-[24px] h-[32px]">
        <img src={chatPeople?.avatar} alt="avatar" className="w-[32px] h-[32px] rounded-full" />
        <span className="text-[#FFFFFF] text-lg ml-2">{chatPeople?.username}</span>
      </div>
      <MessageList
        messages={messages}
        loadMore={() => {}}
        hasMore={false}
        channelInfo={chatPeople}
        className="flex-1"
      />
      <MessageInput onSend={handleSend} />
    </div>
  )
}
export default MessagePage
