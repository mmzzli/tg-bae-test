import { MessageMetadata, MessageType, ReplyMessage, WrappedMessage } from '@/components/Chat/types'
import { retrieveLaunchParams } from '@tma.js/sdk'
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export const useFormatMessage = () => {
  const launchParams = retrieveLaunchParams()
  const currentUid = launchParams.initData?.user?.id ?? 0

  const formatMessage = ({
    type,
    text,
    url,
    to,
    metadata,
    reply,
  }: {
    type: MessageType
    text?: string
    url?: string
    to: number
    metadata?: MessageMetadata
    reply?: ReplyMessage
  }): WrappedMessage => {
    return {
      id: generateUUID(),
      url,
      text,
      type,
      sender: currentUid,
      receiver: to,
      timestamp: Date.now() / 1000,
      messageSeq: -1,
      channelID: to.toString(),
      metadata,
      reply,
    }
  }

  return {
    formatMessage,
  }
}
