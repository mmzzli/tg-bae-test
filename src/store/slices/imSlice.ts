import { StateCreator } from 'zustand'
import BaeimSDK from '@/components/SDK/BaeimSDK'
import { ChatListItem, MessageWindowListItem } from '@/components/Chat/types'
import { OthersUserInfo } from '@/types'
export interface IMSlice {
  connection: BaeimSDK | null
  setConnection: (connection: BaeimSDK) => void
  resetConnection: () => void
  chatList: ChatListItem[]
  setChatList: (item: ChatListItem[]) => void
  addChatListItem: (item: ChatListItem) => void
  updateChatListItem: (item: ChatListItem) => void
  deleteChatListItem: (chatId: string) => void
  messageWindowList: MessageWindowListItem[]
  setMessageWindowList: (messageList: MessageWindowListItem[]) => void
  addMessageWindowListItem: (item: MessageWindowListItem) => void
  updateMessageWindowListItem: (item: MessageWindowListItem) => void
  deleteMessageWindowListItem: (chatId: string) => void
  chatPeopleInfoList: OthersUserInfo[]
  setChatPeopleInfoList: (info: OthersUserInfo[]) => void
}

export const createIMSlice: StateCreator<IMSlice> = (set) => ({
  connection: null,
  setConnection: (connection) => set({ connection }),
  resetConnection: () => set({ connection: null }),
  chatList: [],
  setChatList: (chatList) => set({ chatList }),
  addChatListItem: (item) => set((state) => ({ chatList: [...state.chatList, item] })),
  updateChatListItem: (chatListItem) =>
    set((state) => ({
      chatList: state.chatList.map((item) => (item.id === chatListItem.id ? chatListItem : item)),
    })),
  deleteChatListItem: (id) =>
    set((state) => {
      // delete message window and message items
      const messageWindowList = state.messageWindowList.filter((item) => item.chatId !== id)
      return { chatList: state.chatList.filter((item) => item.id !== id), messageWindowList }
    }),
  messageWindowList: [],
  setMessageWindowList: (messageList) => set({ messageWindowList: messageList }),
  addMessageWindowListItem: (item) =>
    set((state) => ({ messageWindowList: [...state.messageWindowList, item] })),
  updateMessageWindowListItem: (messageWindow) =>
    set((state) => ({
      messageWindowList: state.messageWindowList.map((item) =>
        item.chatId === messageWindow.chatId ? messageWindow : item
      ),
    })),
  deleteMessageWindowListItem: (id) =>
    set((state) => ({
      messageWindowList: state.messageWindowList.filter((item) => item.chatId !== id),
    })),
  chatPeopleInfoList: [],
  setChatPeopleInfoList: (info) => set({ chatPeopleInfoList: info }),
})
