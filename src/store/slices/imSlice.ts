import { StateCreator } from 'zustand'
import BaeimSDK, { Conversation } from '@/components/SDK/BaeimSDK'
import { MessageWindowListItem } from '@/components/Chat/types'
import { OthersUserInfo } from '@/types'
export interface IMSlice {
  connection: BaeimSDK | null
  setConnection: (connection: BaeimSDK) => void
  resetConnection: () => void
  isChatListLoaded: boolean
  setIsChatListLoaded: (loaded: boolean) => void
  messageWindowList: MessageWindowListItem[]
  setMessageWindowList: (messageList: MessageWindowListItem[]) => void
  addMessageWindowListItem: (item: MessageWindowListItem) => void
  updateMessageWindowListItem: (item: MessageWindowListItem) => void
  deleteMessageWindowListItem: (chatId: string) => void
  chatPeopleInfoList: OthersUserInfo[]
  setChatPeopleInfoList: (info: OthersUserInfo[]) => void
  addChatPeopleInfo: (info: OthersUserInfo) => void

  // USE NEW DATA STRUCTURE START
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
  addMessageWindowListItem: (item) =>
    set((state) => ({ messageWindowList: [...state.messageWindowList, item] })),
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
    }),
  addConversation: (conversation) =>
    set((state) => {
      if (state.conversationMap[conversation.channel.channelID]) {
        return state
      }
      return {
        conversationIds: [conversation.channel.channelID, ...state.conversationIds],
        conversationMap: {
          ...state.conversationMap,
          [conversation.channel.channelID]: { ...conversation } as Conversation,
        },
      }
    }),
  updateConversation: (conversation) =>
    set((state) => {
      if (!state.conversationMap[conversation.channel.channelID]) {
        return state
      }
      return {
        conversationIds: [
          conversation.channel.channelID,
          ...state.conversationIds.filter((id) => id !== conversation.channel.channelID),
        ],
        conversationMap: {
          ...state.conversationMap,
          [conversation.channel.channelID]: { ...conversation } as Conversation,
        },
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
