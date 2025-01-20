import { Conversation, Channel } from '../SDK/BaeimSDK'

export enum MessageStatus {
  UNSENT = -1,
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
  REWARD = 'REWARD',
}

export type MessageMetadata = FileMetadata | RewardMetadata

export type MessageWindowListItem = {
  channel: Channel
  messages: WrappedMessage[]
}

export type ReplyMessage = {
  channel?: string
  message: string
  messageId: string
  messageSeq: number
  messageType: MessageType
  toUid: number
  toUsername: string
  revoke: boolean
}

export type Message = {
  url?: string
  text?: string
  type: MessageType
  metadata?: MessageMetadata
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

export type RewardMetadata = {
  chain_id: number
  amount: string
  to_uid: number
  token: string
  chain_name: string
  token_address: string
  hash: string
}

export type WrappedMessage = Message & {
  id: string
  timestamp: number
  sender: number
  receiver: number
  messageSeq: number
  channelID: string
  status?: MessageStatus
  metadata?: MessageMetadata
}
export interface ChatListProps {
  chats: Conversation[]
}
