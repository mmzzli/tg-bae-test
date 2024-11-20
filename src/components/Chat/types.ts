import { Conversation, Channel } from '../SDK/BaeimSDK'

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

export type MessageWindowListItem = {
  channel: Channel
  messages: WrappedMessage[]
}
export type Message = {
  url?: string
  text?: string
  type: MessageType
}

export type WrappedMessage = Message & {
  id: string
  timestamp: number
  sender: number
  receiver: number
  messageSeq: number
  channelID: string
}
export interface ChatListProps {
  chats: Conversation[]
}
