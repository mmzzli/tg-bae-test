import { FC, useEffect } from 'react'
import ChatList from '@/components/Chat/ChatList'
import { Menu } from '@/components/Menu'
import InfiniteScroll from 'react-infinite-scroll-component'
import { Spinner } from '@chakra-ui/react'
import { cn } from '@/utils/utils'
import { useStore } from '@/store'
import { Message } from 'wukongimjssdk/lib/model'
import { useIM } from '@/store/hook/userIM'
const ChatListPage: FC<{ className?: string }> = ({ className }) => {
  const chatList = useStore((state) => state.chatList)
  const connection = useStore((state) => state.connection)
  const { receiveMessage } = useIM()

  const handleDelete = (id: string) => {
    console.log('Delete chat:', id)
    // Implement delete logic
  }

  const handleMessage = (message: Message) => {
    console.log('-------message from server-------- ', message)
    try {
      if (message?.content?.text) {
        receiveMessage(JSON.parse(message.content.text))
      }
    } catch (error) {
      console.error('message from server parse error:', error)
    }
  }

  useEffect(() => {
    if (connection) {
      connection.addMessageListener(handleMessage)
    }
    return () => {
      if (connection) {
        connection.removeMessageListener()
      }
    }
  }, [connection])

  return (
    <div className={cn('bg-black min-h-screen pt-[32px]', className)}>
      <InfiniteScroll
        dataLength={chatList.length}
        next={() => {}}
        hasMore={false}
        loader={
          <div className="flex items-center justify-center">
            <Spinner color="#4A3AFF" />
          </div>
        }
      >
        <ChatList chats={chatList} onDelete={handleDelete} />
      </InfiniteScroll>
      <Menu selectedIndex={1} />
    </div>
  )
}

export default ChatListPage
