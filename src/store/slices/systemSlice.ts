import { StateCreator } from 'zustand'
import { Notification } from '@/types'
export type RoutePage = {
  name: string
  params?: Record<string, string>
  enterFrom?: string
}

export interface DailyTask {
  uid: number
  points: number
  details: DailyTaskItem[]
  used_points: number
  earn_points: number
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

const followTaskId = [13, 14]

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
  totalFollowTaskPoints: number
  setTotalTaskPoints: (points: number) => void
  setTotalFollowTaskPoints: (points: number) => void
  dailyTaskList: DailyTaskItem[]
  setDailyTaskList: (list: DailyTaskItem[]) => void
  resetDailyTaskList: () => void
  updateDailyTask: (task: DailyTaskItem) => void
  // Follow Task
  followTaskList: DailyTaskItem[]
  setFollowTaskList: (list: DailyTaskItem[]) => void
  resetFollowTaskList: () => void
  updateFollowTask: (task: DailyTaskItem) => void
  // Paid Stars
  paidStars: number
  setPaidStars: (stars: number) => void
  paidStarsPoints: number
  setPaidStarsPoints: (points: number) => void
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
    list = list.filter((task) => !followTaskId.includes(task.task_type))
    const claimedTasks = list.filter((task) => task.status === DailyTaskStatusEnum.CLAIMED)
    const inProgressTasks = list.filter((task) => task.status !== DailyTaskStatusEnum.CLAIMED)
    set({
      dailyTaskList: [
        ...inProgressTasks.sort((a, b) => a.task_type - b.task_type),
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
    set((state) => {
      if (points > state.totalTaskPoints) {
        return { totalTaskPoints: points }
      }
      return state
    })
  },
  paidStars: 0,
  setPaidStars: (stars) => {
    set({ paidStars: stars })
  },
  paidStarsPoints: 0,
  setPaidStarsPoints: (points) => {
    set({ paidStarsPoints: points })
  },
  followTaskList: [],
  setFollowTaskList: (list) => {
    list = list.filter((task) => followTaskId.includes(task.task_type))
    set({ followTaskList: [...list.sort((a, b) => a.task_type - b.task_type)] })
  },
  resetFollowTaskList: () => {
    set({ followTaskList: [] })
  },
  updateFollowTask: (task) => {
    set((state) => ({
      followTaskList: state.followTaskList.map((t) => (t.id === task.id ? { ...t, ...task } : t)),
    }))
  },
  totalFollowTaskPoints: 0,
  setTotalFollowTaskPoints: (points) => {
    set({ totalFollowTaskPoints: points })
  },
})
