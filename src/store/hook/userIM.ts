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
    addChatListItem,
    updateChatListItem,
    addMessageWindowListItem,
    setChatPeopleInfoList,
    updateMessageWindowListItem,
  } = useStore((state) => ({
    addChatListItem: state.addChatListItem,
    updateChatListItem: state.updateChatListItem,
    addMessageWindowListItem: state.addMessageWindowListItem,
    setChatPeopleInfoList: state.setChatPeopleInfoList,
    updateMessageWindowListItem: state.updateMessageWindowListItem,
  }))

  const getMessageWindowByReceiveId = (receiver: number) => {
    const chatId = getChatId(receiver, current_uid)
    return useStore.getState().messageWindowList.find((msg) => msg.chatId === chatId)
  }

  const getChatListItemByReceiveId = (receiver: number) => {
    const chatId = getChatId(receiver, current_uid)
    return useStore.getState().chatList.find((item) => item.id === chatId)
  }

  const initMessageWindow = (receiver: number, message?: Message) => {
    const chatId = getChatId(receiver, current_uid)
    const messageWindow = getMessageWindowByReceiveId(receiver)
    if (!messageWindow) {
      addMessageWindowListItem({
        id: Date.now().toString() + current_uid,
        chatId,
        users: [receiver, current_uid],
        messages: message ? [message] : [],
      })
    }
  }

  const initChatListItem = (receiver: number, message?: Message) => {
    const chatId = getChatId(receiver, current_uid)
    const chatItem = useStore.getState().chatList.find((item) => item.id === chatId)
    if (!chatItem) {
      initChatPeopleInfo(receiver)
      addChatListItem({
        id: chatId,
        users: [receiver, current_uid],
        title: '',
        unreadCount: 0,
        lastMessage: message,
      })
    }
  }

  const initChatPeopleInfo = (receiver: number, cb?: (user: OthersUserInfo) => void) => {
    const user = useStore.getState().chatPeopleInfoList.find((item) => item.uid === receiver)
    if (!user) {
      getSomeoneProfile(receiver).then((res) => {
        setChatPeopleInfoList([res])
        cb?.(res)
      })
    }
  }

  const getChatPeopleInfo = (users: number[]) => {
    const receiver = users[0] === current_uid ? users[1] : users[0]
    return useStore.getState().chatPeopleInfoList.find((item) => item.uid === receiver)
  }

  const sendMessage = (message: Message) => {
    useStore.getState().connection?.sendMessage(JSON.stringify(message), String(message.receiver))
    updateMessage(message, message.receiver)
  }

  const receiveMessage = (message: Message) => {
    if (message.sender !== current_uid) {
      updateMessage(message, message.sender)
    } else {
      // TODO: set msg status to sent
    }
  }

  const updateMessage = (message: Message, othersId: number) => {
    const messageWindow = getMessageWindowByReceiveId(othersId)
    const chatItem = getChatListItemByReceiveId(othersId)
    if (messageWindow && chatItem) {
      updateMessageWindowListItem({
        ...messageWindow,
        messages: [...messageWindow.messages, message],
      })
      updateChatListItem({ ...chatItem, lastMessage: message })
    } else {
      initChatListItem(othersId, message)
      initMessageWindow(othersId, message)
    }
  }

  return {
    getMessageWindowByReceiveId,
    initMessageWindow,
    initChatPeopleInfo,
    initChatListItem,
    getChatPeopleInfo,
    sendMessage,
    receiveMessage,
  }
}
