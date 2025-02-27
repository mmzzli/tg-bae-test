import { FC, useState, useEffect } from 'react'
import { useStore } from '@/store'
import Image from '@/components/Image/Image'
import { Conversation } from '@/components/SDK/BaeimSDK'
import { useIM } from '@/store/hook/userIM'
import { OthersUserInfo } from '@/types'
import { useFormatMessage } from '@/hooks/useFormatMessage'
import { MessageType, WrappedMessage } from '@/components/Chat/types'
import { useRequest } from 'ahooks'
import { getLink } from '@/api/list'
import SendPostDialog from './SendPostDialog'

interface Props {
  ids: string[]
  onSelect?: (channelId: string) => void
  maxHeight?: string
}

const ChatItem: FC<{ conversation: Conversation; onSelect?: (channelId: string) => void }> = ({
  conversation,
  onSelect,
}) => {
  const { getChatPeopleInfo, initChatPeopleInfo } = useIM()
  const [chatPeople, setChatPeople] = useState<OthersUserInfo | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { formatMessage } = useFormatMessage()
  const { sendMessage } = useIM()
  const [newMessage, setNewMessage] = useState<WrappedMessage>({} as WrappedMessage)
  const { runAsync: getLinkHandlerAsync } = useRequest(getLink, {
    manual: true,
    onSuccess(res) {
      console.log(res)
    },
  })

  useEffect(() => {
    const loadChatPeople = () => {
      const user = getChatPeopleInfo(Number(conversation.channel.channelID))
      if (user) {
        setChatPeople(user)
      } else {
        if (Number(conversation.channel.channelID)) {
          initChatPeopleInfo(Number(conversation.channel.channelID), setChatPeople)
        }
      }
    }
    loadChatPeople()
  }, [conversation.channel.channelID, getChatPeopleInfo, initChatPeopleInfo])

  const handleSend = async () => {
    sendMessage(newMessage)
    setIsDialogOpen(false)
  }

  const handleOpenDialog = async () => {
    setIsDialogOpen(true)
    if (chatPeople?.uid) {
      const { ref } = await getLinkHandlerAsync({ pid: chatPeople.uid, uid: chatPeople.uid })
      const copyLink = encodeURIComponent(`${import.meta.env.VITE_API_URL}link/${ref}`)
      const newMessage = formatMessage({
        type: MessageType.TEXT,
        url: copyLink,
        to: Number(conversation.channel.channelID),
      })
      console.log('newMessage', newMessage)
      setNewMessage(newMessage)
    }
  }

  return (
    <>
      <div
        className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
        onClick={handleOpenDialog}
      >
        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 mr-4">
          <Image
            rect
            type="avatar"
            src={chatPeople?.avatar}
            alt={chatPeople?.username}
            width={48}
            height={48}
            className="w-full h-full rounded-full"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-medium text-gray-900 dark:text-white truncate">
            {chatPeople?.username}
          </h3>
        </div>
      </div>

      <SendPostDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSend={handleSend}
        chatPeople={chatPeople}
      />
    </>
  )
}

const SimpleChatList: FC<Props> = ({ ids, onSelect, maxHeight = '380px' }) => {
  const conversationMap = useStore((state) => state.conversationMap)

  return (
    <div className="flex flex-col overflow-y-auto scrollbar-hide" style={{ maxHeight }}>
      {ids.map((id) => {
        const conversation = conversationMap[id]
        if (!conversation?.channel?.channelID) return null
        return (
          <ChatItem key={id} conversation={conversation} onSelect={onSelect} />
        )
      })}
    </div>
  )
}

export default SimpleChatList
