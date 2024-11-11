import { useTMAUtils } from '@/hooks/useTMAUtils'
import { useStore } from '../store'
import { getChatId } from '@/utils/utils'
import { getSomeoneProfile } from '@/api'
import { OthersUserInfo } from '@/types'
import { Message } from '@/components/Chat/types'
export const useIM = () => {
  const { getCurrentUid } = useTMAUtils()
  const current_uid = getCurrentUid()
  const {
    connection,
    messageWindowList,
    chatList,
    addChatListItem,
    updateChatListItem,
    addMessageWindowListItem,
    chatPeopleInfoList,
    setChatPeopleInfoList,
    updateMessageWindowListItem,
  } = useStore((state) => ({
    connection: state.connection,
    messageWindowList: state.messageWindowList,
    chatList: state.chatList,
    addChatListItem: state.addChatListItem,
    updateChatListItem: state.updateChatListItem,
    addMessageWindowListItem: state.addMessageWindowListItem,
    chatPeopleInfoList: state.chatPeopleInfoList,
    setChatPeopleInfoList: state.setChatPeopleInfoList,
    updateMessageWindowListItem: state.updateMessageWindowListItem,
  }))

  const getMessageWindowByReceiveId = (receiver: number) => {
    const chatId = getChatId(receiver, current_uid)
    return messageWindowList.find((msg) => msg.chatId === chatId)
  }

  const initMessageWindow = (receiver: number) => {
    const chatId = getChatId(receiver, current_uid)
    const messageWindow = getMessageWindowByReceiveId(receiver)
    if (!messageWindow) {
      addMessageWindowListItem({
        id: Date.now().toString() + current_uid,
        chatId,
        users: [receiver, current_uid],
        messages: [],
      })
    }
  }

  const initChatListItem = (receiver: number) => {
    const chatId = getChatId(receiver, current_uid)
    const chatItem = chatList.find((item) => item.id === chatId)
    if (!chatItem) {
      initChatPeopleInfo(receiver)
      addChatListItem({
        id: chatId,
        users: [receiver, current_uid],
        title: '',
        unreadCount: 0,
      })
    }
  }

  const initChatPeopleInfo = (receiver: number, cb?: (user: OthersUserInfo) => void) => {
    const user = chatPeopleInfoList.find((item) => item.uid === receiver)
    if (!user) {
      getSomeoneProfile(receiver).then((res) => {
        setChatPeopleInfoList([res])
        cb?.(res)
      })
    }
  }

  const getChatPeopleInfo = (users: number[]) => {
    const receiver = users[0] === current_uid ? users[1] : users[0]
    return chatPeopleInfoList.find((item) => item.uid === receiver)
  }

  const sendMessage = (message: Message) => {
    connection?.sendMessage(JSON.stringify(message), String(message.receiver))
    // update message window
    const messageWindow = getMessageWindowByReceiveId(message.receiver)
    if (messageWindow) {
      updateMessageWindowListItem({
        ...messageWindow,
        messages: [...messageWindow.messages, message],
      })
    }
    // update chat list
    const chatItem = chatList.find((item) => item.id === message.chatId)
    if (chatItem) {
      updateChatListItem({ ...chatItem, lastMessage: message })
    }
  }

  return {
    getMessageWindowByReceiveId,
    initMessageWindow,
    initChatPeopleInfo,
    initChatListItem,
    getChatPeopleInfo,
    sendMessage,
  }
}
