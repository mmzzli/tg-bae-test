import { useTMAUtils } from '@/hooks/useTMAUtils'
import { useStore } from '../store'
import { getSomeoneProfile } from '@/api'
import { OthersUserInfo } from '@/types'
import { WrappedMessage } from '@/components/Chat/types'
import { receiver } from '@telegram-apps/sdk/dist/dts/scopes/components/init-data/init-data'
export const useIM = () => {
  const { getCurrentUid } = useTMAUtils()
  const current_uid = getCurrentUid()
  const { updateMessageWindowListItem, addChatPeopleInfo } = useStore((state) => ({
    updateMessageWindowListItem: state.updateMessageWindowListItem,
    addChatPeopleInfo: state.addChatPeopleInfo,
  }))

  const getMessageWindow = (channelId: string) => {
    return useStore.getState().messageWindowList.find((msg) => msg.channel.channelID === channelId)
  }

  const initChatPeopleInfo = (user: number, cb?: (user: OthersUserInfo) => void) => {
    getSomeoneProfile(user).then((res) => {
      addChatPeopleInfo(res)
      cb?.(res)
    })
  }

  const getChatPeopleInfo = (user: number) => {
    return useStore.getState().chatPeopleInfoList.find((item) => item.uid === user)
  }

  const sendMessage = (message: WrappedMessage, updateStore = true) => {
    useStore.getState().connection?.sendMessage(
      JSON.stringify({
        id: message.id,
        text: message.text,
        type: message.type,
        url: message.url,
        metadata: message.metadata,
        reply: message.reply,
      }),
      String(message.receiver)
    )
    if (updateStore) {
      updateMessage(message, message.receiver)
    }
  }

  const receiveMessage = (message: WrappedMessage | WrappedMessage[], messageWindowId = '') => {
    if (messageWindowId) {
      return updateMessage(message, Number(messageWindowId))
    }
    const msg = Array.isArray(message) ? message[0] : message
    const sender = msg.sender

    if (sender !== current_uid) {
      updateMessage(message, sender)
    } else {
      // TODO: set msg status to sent
      updateMessage(msg, msg.receiver)
    }
  }

  const updateMessage = (
    message: WrappedMessage | WrappedMessage[],
    channelId: number,
    isHistory = false
  ) => {
    const messageWindow = getMessageWindow(String(channelId))
    if (messageWindow) {
      updateMessageWindowListItem({
        ...messageWindow,
        messages: isHistory
          ? [...(Array.isArray(message) ? message : [message]), ...messageWindow.messages]
          : [...messageWindow.messages, ...(Array.isArray(message) ? message : [message])],
      })
    }
  }

  const updateMessageByID = (message: WrappedMessage) => {
    const messageWindow = getMessageWindow(String(message.channelID))
    if (messageWindow) {
      updateMessageWindowListItem({
        ...messageWindow,
        messages: messageWindow.messages.map((msg) => (msg.id === message.id ? message : msg)),
      })
    }
  }

  const getMessageByID = (message: WrappedMessage) => {
    const messageWindow = getMessageWindow(String(message.channelID))
    return messageWindow?.messages.find((msg) => msg.id === message.id) || null
  }

  return {
    getMessageWindow,
    initChatPeopleInfo,
    // initChatListItem,
    getChatPeopleInfo,
    sendMessage,
    receiveMessage,
    updateMessage,
    updateMessageByID,
    getMessageByID,
  }
}
