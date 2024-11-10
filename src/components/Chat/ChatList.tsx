import { FC } from 'react'
import { ChatListProps } from './types'
import ChatListItem from './ChatListItem'

const ChatList: FC<ChatListProps> = ({ chats, onDelete }) => {
  return (
    <>
      {chats.map((chat) => (
        <ChatListItem key={chat.id} chat={chat} onDelete={onDelete} className="mb-[12px]" />
      ))}
    </>
  )
}

export default ChatList
