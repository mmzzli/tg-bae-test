import { StateCreator } from 'zustand'
import { Notification } from '@/types'
export type RoutePage = {
  name: string
  params?: Record<string, string>
}

export interface DailyTask {
  uid: number
  points: number
  details: DailyTaskItem[]
}

export enum DailyTaskStatusEnum {
  GO = 0,
  IN_PROGRESS = 1,
  CLAIM = 2,
  CLAIMED = 3,
}
export interface DailyTaskItem {
  id: number
  content: string
  amount: number
  status: DailyTaskStatusEnum
  task_type: number
  index: number
  points: number
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

  // Daily Task
  totalTaskPoints: number
  setTotalTaskPoints: (points: number) => void
  dailyTaskList: DailyTaskItem[]
  setDailyTaskList: (list: DailyTaskItem[]) => void
  resetDailyTaskList: () => void
  updateDailyTask: (task: DailyTaskItem) => void
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
  dailyTaskList: [],
  setDailyTaskList: (list) => {
    list.forEach((task) => {
      if (task.task_type === 11 && task.status === DailyTaskStatusEnum.GO) {
        task.status = DailyTaskStatusEnum.IN_PROGRESS
      }
    })
    const claimTasks = list.filter((task) => task.status === DailyTaskStatusEnum.CLAIM)
    const claimedTasks = list.filter((task) => task.status === DailyTaskStatusEnum.CLAIMED)
    const inProgressTasks = list.filter(
      (task) =>
        task.status !== DailyTaskStatusEnum.CLAIM && task.status !== DailyTaskStatusEnum.CLAIMED
    )
    set({
      dailyTaskList: [
        ...inProgressTasks.sort((a, b) => a.task_type - b.task_type),
        ...claimTasks.sort((a, b) => a.task_type - b.task_type),
        ...claimedTasks.sort((a, b) => a.task_type - b.task_type),
      ],
    })
  },
  resetDailyTaskList: () => {
    set({ dailyTaskList: [] })
  },
  updateDailyTask: (task) => {
    set((state) => ({
      dailyTaskList: state.dailyTaskList.map((t) =>
        t.task_type === task.task_type ? { ...t, ...task } : t
      ),
    }))
  },
  totalTaskPoints: 0,
  setTotalTaskPoints: (points) => {
    set({ totalTaskPoints: points })
  },
})
