import { useTMAUtils } from '@/hooks/useTMAUtils'
import { useStore } from '../store'
import { getSomeoneProfile } from '@/api'
import { OthersUserInfo } from '@/types'
import { WrappedMessage } from '@/components/Chat/types'
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

  // const getChatListItemByReceiveId = (receiver: number) => {
  //   const chatId = getChatId(receiver, current_uid)
  //   return useStore.getState().chatList.find((item) => item.id === chatId)
  // }

  // const initChatListItem = (receiver: number, message?: Message) => {
  //   const chatId = getChatId(receiver, current_uid)
  //   const chatItem = useStore.getState().chatList.find((item) => item.id === chatId)
  //   if (!chatItem) {
  //     initChatPeopleInfo(receiver)
  //     addChatListItem({
  //       id: chatId,
  //       users: [receiver, current_uid],
  //       title: '',
  //       unreadCount: 0,
  //       lastMessage: message,
  //     })
  //   }
  // }

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
      }),
      String(message.receiver)
    )
    if (updateStore) {
      updateMessage(message, message.receiver)
    }
  }

  const receiveMessage = (message: WrappedMessage | WrappedMessage[], messageWindowId = '') => {
    console.log('receiveMessage', message)
    if (messageWindowId) {
      return updateMessage(message, Number(messageWindowId))
    }
    const sender = Array.isArray(message) ? message[0].sender : message.sender
    if (sender !== current_uid) {
      updateMessage(message, sender)
    } else {
      // TODO: set msg status to sent
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
