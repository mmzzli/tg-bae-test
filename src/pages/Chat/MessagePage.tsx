import { useState, useEffect } from 'react'
import { MessageList } from '@/components/Chat/MessageList'
import { MessageInput } from '@/components/Chat/MessageInput'
import { MessageType, WrappedMessage } from '@/components/Chat/types'
import { useParams } from 'react-router-dom'
import { useFormatMessage } from '@/hooks/useFormatMessage'
import { useIM } from '@/store/hook/userIM'
import { useStore } from '@/store'
import { OthersUserInfo } from '@/types'
import Image from '@/components/Image/Image'
// const PAGE_SIZE = 20

const defaultMessages: WrappedMessage[] = []

const MessagePage = () => {
  const { uid } = useParams()
  const [messages, setMessages] = useState<WrappedMessage[]>(defaultMessages)
  const [chatPeople, setChatPeople] = useState<OthersUserInfo | null>(null)
  // const [page, setPage] = useState(1)
  // const [hasMore, setHasMore] = useState(true)
  const { formatMessage } = useFormatMessage()
  const { sendMessage, getMessageWindow, getChatPeopleInfo } = useIM()
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
    if (uid) {
      const getUserInfo = (times: number) => {
        const user = getChatPeopleInfo(Number(uid))
        if (user) {
          setChatPeople(user)
        } else if (times > 0) {
          setTimeout(() => {
            getUserInfo(times - 1)
          }, 300)
        }
      }
      getUserInfo(10)
    }
  }, [uid])

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
    <div className="fixed w-screen top-0 bottom-[84px] flex flex-col bg-[#0D0D0D] z-10 pt-[76px] overflow-auto">
      <div className="fixed flex items-center left-0 right-0 top-[10px] px-[16px] pt-[24px] h-[56px]">
        <Image
          type="avatar"
          rect
          src={chatPeople?.avatar}
          alt="avatar"
          className="w-[32px] h-[32px] rounded-full"
        />
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
