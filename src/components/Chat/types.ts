interface ChatItem {
  id: string
  avatar: string
  name: string
  lastMessage: string
  time: string
  unreadCount?: number
}

interface ChatListProps {
  chats: ChatItem[]
  onDelete: (id: string) => void
}

export type { ChatItem, ChatListProps }
