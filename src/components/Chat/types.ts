export enum MessageStatus {
  SENT = 0,
  RECEIVED = 1,
  FAILED = 2,
}
export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}

export type ChatListItem = {
  id: string
  users: number[]
  title: string
  unreadCount: number
  lastMessage?: Message
}
export type MessageWindowListItem = {
  id: string
  chatId: string
  users: number[]
  name?: string
  messages: Message[]
}
export type Message = {
  id: string
  chatId: string
  url?: string
  text?: string
  type: MessageType
  status: MessageStatus
  sender: number
  receiver: number
  timestamp: number
}
export interface ChatListProps {
  chats: ChatListItem[]
  onDelete: (id: string) => void
}
