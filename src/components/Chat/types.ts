import { Conversation, Channel } from '../SDK/BaeimSDK'

export enum MessageStatus {
  SENT = 0,
  RECEIVED = 1,
  FAILED = 2,
  UPLOADING = 3,
  UPLOADED = 4,
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
  metadata?: FileMetadata
}

export type FileMetadata = {
  name: string
  size: number
  type: string
  file?: File
  url: string
  width: number
  height: number
  duration: number
}

export type WrappedMessage = Message & {
  id: string
  timestamp: number
  sender: number
  receiver: number
  messageSeq: number
  channelID: string
  status: MessageStatus
}
export interface ChatListProps {
  chats: Conversation[]
}
