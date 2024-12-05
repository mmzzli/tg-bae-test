import { StateCreator } from 'zustand'

export type RoutePage = {
  name: string
  params?: Record<string, string>
}
export type Notification = {
  id: number
  type: 'follow' | 'message'
  content: string
  timestamp: number
}

export interface SystemSlice {
  virtualRoutePage: RoutePage | null
  setVirtualRoutePage: (page: RoutePage) => void
  resetVirtualRoutePage: () => void
  notificationList: Notification[]
  setNotificationList: (list: Notification[]) => void
  resetNotificationList: () => void
  unreadNotificationCount: number
  setUnreadNotificationCount: (count: number) => void
  latestReadNotificationId: number
  setLatestReadNotificationId: (id: number) => void
}

export const createSystemSlice: StateCreator<SystemSlice> = (set) => ({
  virtualRoutePage: null,
  setVirtualRoutePage: (page) => {
    set({ virtualRoutePage: page })
  },
  resetVirtualRoutePage: () => {
    set({ virtualRoutePage: null })
  },
  notificationList: [],
  setNotificationList: (list) => {
    set({ notificationList: list })
  },
  resetNotificationList: () => {
    set({ notificationList: [] })
  },
  unreadNotificationCount: 0,
  setUnreadNotificationCount: (count) => {
    set({ unreadNotificationCount: count })
  },
  latestReadNotificationId: 0,
  setLatestReadNotificationId: (id) => {
    set({ latestReadNotificationId: id })
  },
})
