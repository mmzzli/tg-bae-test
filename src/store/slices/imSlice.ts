import { StateCreator } from 'zustand'
import BaeimSDK, { Conversation } from '@/components/SDK/BaeimSDK'
import { MessageWindowListItem } from '@/components/Chat/types'
import { OthersUserInfo } from '@/types'
import { sortConversations } from '@/utils/chat/util'
export interface IMSlice {
  connection: BaeimSDK | null
  setConnection: (connection: BaeimSDK) => void
  resetConnection: () => void
  isChatListLoaded: boolean
  setIsChatListLoaded: (loaded: boolean) => void
  messageWindowList: MessageWindowListItem[]
  setMessageWindowList: (messageList: MessageWindowListItem[]) => void
  addMessageWindowListItem: (item: MessageWindowListItem, merge: boolean) => void
  updateMessageWindowListItem: (item: MessageWindowListItem) => void
  deleteMessageWindowListItem: (chatId: string) => void
  chatPeopleInfoList: OthersUserInfo[]
  setChatPeopleInfoList: (info: OthersUserInfo[]) => void
  addChatPeopleInfo: (info: OthersUserInfo) => void

  // USE NEW DATA STRUCTURE START
  conversationUnreadCount: number
  setConversationUnreadCount: (count: number) => void
  conversationIds: string[]
  conversationMap: Record<string, Conversation>
  setConversation: (conversation: Conversation[]) => void
  addConversation: (conversation: Conversation) => void
  updateConversation: (conversation: Conversation) => void
  deleteConversation: (conversationId: string) => void
  setConversationIds: (ids: string[]) => void
  // USE NEW DATA STRUCTURE END
}

export const createIMSlice: StateCreator<IMSlice> = (set) => ({
  connection: null,
  setConnection: (connection) => set({ connection }),
  resetConnection: () => set({ connection: null }),
  isChatListLoaded: false,
  setIsChatListLoaded: (loaded) => set({ isChatListLoaded: loaded }),
  messageWindowList: [],
  setMessageWindowList: (messageList) => set({ messageWindowList: messageList }),
  addMessageWindowListItem: (item, merge = false) =>
    set((state) => ({
      messageWindowList: merge
        ? state.messageWindowList.map((item) =>
            item.channel.channelID === item.channel.channelID ? item : item
          )
        : [...state.messageWindowList, item],
    })),
  updateMessageWindowListItem: (messageWindow) =>
    set((state) => ({
      messageWindowList: state.messageWindowList.map((item) =>
        item.channel.channelID === messageWindow.channel.channelID ? messageWindow : item
      ),
    })),
  deleteMessageWindowListItem: (id) =>
    set((state) => ({
      messageWindowList: state.messageWindowList.filter((item) => item.channel.channelID !== id),
    })),
  chatPeopleInfoList: [],
  setChatPeopleInfoList: (info) => set({ chatPeopleInfoList: info }),
  addChatPeopleInfo: (info) =>
    set((state) => ({ chatPeopleInfoList: [...state.chatPeopleInfoList, info] })),

  // USE NEW DATA STRUCTURE START
  conversationUnreadCount: 0,
  setConversationUnreadCount: (count) => set({ conversationUnreadCount: count }),
  conversationIds: [],
  conversationMap: {},
  setConversationIds: (ids: string[]) => set({ conversationIds: [...ids] }),
  setConversation: (conversation) =>
    set({
      conversationIds: conversation.map((item) => item.channel.channelID),
      conversationMap: conversation.reduce(
        (acc, item) => ({ ...acc, [item.channel.channelID]: item }),
        {}
      ),
      conversationUnreadCount: conversation.reduce((sum, item) => sum + item.unread, 0),
    }),
  addConversation: (conversation) =>
    set((state) => {
      if (state.conversationMap[conversation.channel.channelID]) {
        return state
      }
      const newConversationMap = {
        ...state.conversationMap,
        [conversation.channel.channelID]: { ...conversation } as Conversation,
      }
      return {
        conversationIds: [conversation.channel.channelID, ...state.conversationIds],
        conversationMap: newConversationMap,
        conversationUnreadCount: Object.values(newConversationMap).reduce(
          (sum, conversation) => sum + conversation.unread,
          0
        ),
      }
    }),
  updateConversation: (conversation) =>
    set((state) => {
      if (!state.conversationMap[conversation.channel.channelID]) {
        return state
      }
      const newConversationMap = {
        ...state.conversationMap,
        [conversation.channel.channelID]: { ...conversation } as Conversation,
      }
      return {
        conversationIds: sortConversations(Object.values(newConversationMap)).map(
          (item) => item.channel.channelID
        ),
        conversationMap: newConversationMap,
        conversationUnreadCount: Object.values(newConversationMap).reduce(
          (sum, conversation) => sum + conversation.unread,
          0
        ),
      }
    }),
  deleteConversation: (conversationId) =>
    set((state) => {
      const newConversationIds = state.conversationIds.filter((id) => id !== conversationId)
      const newConversationMap = newConversationIds.reduce(
        (acc, id) => ({ ...acc, [id]: state.conversationMap[id] }),
        {}
      )
      return { conversationIds: newConversationIds, conversationMap: newConversationMap }
    }),
  // USE NEW DATA STRUCTURE END
})
