import { FC, useEffect } from 'react'
import ChatList from '@/components/Chat/ChatList'
import { Menu } from '@/components/Menu'
import InfiniteScroll from 'react-infinite-scroll-component'
import { Spinner } from '@chakra-ui/react'
import { cn } from '@/utils/utils'
import { useStore } from '@/store'
import { Message } from 'wukongimjssdk/lib/model'
const ChatListPage: FC<{ className?: string }> = ({ className }) => {
  const chatList = useStore((state) => state.chatList)
  const connection = useStore((state) => state.connection)

  const handleDelete = (id: string) => {
    console.log('Delete chat:', id)
    // Implement delete logic
  }

  const handleMessage = (message: Message) => {
    console.log('-------message from server-------- ', message)
    // find chat list
    // find chat window

    // update chat window
    // update chat list
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
