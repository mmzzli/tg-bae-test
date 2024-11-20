import { MessageType, WrappedMessage } from '@/components/Chat/types'
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
  }): WrappedMessage => {
    return {
      id: Date.now().toString() + currentUid,
      url,
      text,
      type,
      sender: currentUid,
      receiver: to,
      timestamp: Date.now() / 1000,
      messageSeq: -1,
      channelID: to.toString(),
    }
  }

  return {
    formatMessage,
  }
}
