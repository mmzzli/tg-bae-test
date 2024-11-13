import { Message, MessageStatus, MessageType } from '@/components/Chat/types'
import { getChatId } from '@/utils/utils'
import { retrieveLaunchParams } from '@tma.js/sdk'

export const useFormatMessage = () => {
  const launchParams = retrieveLaunchParams()
  const currentUid = launchParams.initData?.user?.id ?? 0

  const formatMessage = ({
    type,
    text,
    url,
    to,
  }: {
    type: MessageType
    text?: string
    url?: string
    to: number
  }): Message => {
    return {
      id: Date.now().toString() + currentUid,
      chatId: getChatId(currentUid, to),
      url,
      text,
      type,
      status: MessageStatus.SENT,
      sender: currentUid,
      receiver: to,
      timestamp: Date.now(),
    }
  }

  return {
    formatMessage,
  }
}
