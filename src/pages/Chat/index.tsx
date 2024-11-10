import { FC } from 'react'
import ChatList from '@/components/Chat/ChatList'
import { Menu } from '@/components/Menu'
import InfiniteScroll from 'react-infinite-scroll-component'
import { Spinner } from '@chakra-ui/react'
import { cn } from '@/utils/utils'
const ChatPage: FC<{ className?: string }> = ({ className }) => {
  const chats = [
    {
      id: '1',
      avatar: '/path/to/avatar.jpg',
      name: 'Athalia Putri',
      lastMessage: 'Good morning, did you sleep w...',
      time: '2024-01-20T10:00:00',
      unreadCount: 12,
    },
    {
      id: '2',
      avatar: '/path/to/avatar.jpg',
      name: 'UX Team',
      lastMessage: 'How is it going?',
      time: '2024-01-20T09:45:00',
    },
    // ... more chats
  ]

  const handleDelete = (id: string) => {
    console.log('Delete chat:', id)
    // Implement delete logic
  }

  return (
    <div className={cn('bg-black min-h-screen pt-[32px]', className)}>
      <InfiniteScroll
        dataLength={chats.length}
        next={() => {}}
        hasMore={false}
        loader={
          <div className="flex items-center justify-center">
            <Spinner color="#4A3AFF" />
          </div>
        }
      >
        <ChatList chats={chats} onDelete={handleDelete} />
      </InfiniteScroll>
      <Menu selectedIndex={1} />
    </div>
  )
}

export default ChatPage
