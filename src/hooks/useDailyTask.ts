import { useRequest } from 'ahooks'
import {
  dailyLoginTask,
  dailyWatchTask,
  dailyChatTask,
  completeAllTasks,
  getPaidStars,
  getPaidStarPoints,
} from '@/api'
import { useStore } from '@/store'
import { useMemo } from 'react'
import { getDailyTask } from '@/api/list'
import { DailyTaskStatusEnum } from '@/store/slices/systemSlice'

export const useDailyTaskStatus = () => {
  const taskList = useStore((state) => state.dailyTaskList)

  const isAllTasksCompleted = useMemo(() => {
    return taskList
      .filter((task) => task.task_type !== 11)
      .every((task) => task.status === DailyTaskStatusEnum.CLAIMED)
  }, [taskList])

  return {
    isAllTasksCompleted,
  }
}

export const useUpdatePaidStars = () => {
  const { setPaidStars, setPaidStarsPoints } = useStore((state) => ({
    setPaidStars: state.setPaidStars,
    setPaidStarsPoints: state.setPaidStarsPoints,
  }))

  const { run: runGetPaidStars } = useRequest(getPaidStars, {
    manual: true,
    onSuccess(data) {
      setPaidStars(data.stars)
      setPaidStarsPoints(data)
    },
  })

  const { run: runGetPaidStarsPoints } = useRequest(getPaidStarPoints, {
    manual: true,
    onSuccess(data) {
      setPaidStarsPoints(data)
    },
  })

  const runUpdatePaidStars = () => {
    runGetPaidStars()
    runGetPaidStarsPoints()
  }
  return {
    runUpdatePaidStars,
  }
}

export const useGetDailyTask = () => {
  const { setDailyTaskList, setTotalTaskPoints, setPaidStars, setPaidStarsPoints } = useStore(
    (state) => ({
      setDailyTaskList: state.setDailyTaskList,
      setTotalTaskPoints: state.setTotalTaskPoints,
      setPaidStars: state.setPaidStars,
      setPaidStarsPoints: state.setPaidStarsPoints,
    })
  )

  const { run: runGetDailyTask, loading } = useRequest(getDailyTask, {
    manual: true,
    onSuccess(data) {
      setDailyTaskList(data.details)
      setTotalTaskPoints(data.points)
      setPaidStars(data.used_points)
      setPaidStarsPoints(data.earn_points)
    },
  })
  return {
    runGetDailyTask,
    loading,
  }
}

export const useInitDailyTask = () => {
  const { setDailyTaskList, setTotalTaskPoints } = useStore((state) => ({
    setDailyTaskList: state.setDailyTaskList,
    setTotalTaskPoints: state.setTotalTaskPoints,
  }))

  const { run: runGetDailyTask } = useRequest(getDailyTask, {
    manual: true,
    onSuccess(data) {
      setDailyTaskList(data.details)
      setTotalTaskPoints(data.points)
    },
  })

  const { run: runInitDailyTask } = useRequest(dailyLoginTask, {
    manual: true,
    onSuccess: (res) => {
      runGetDailyTask()
    },
  })

  return {
    runInitDailyTask,
  }
}

export const useDailyTaskActions = () => {
  const { run: runDailyLogin } = useRequest(dailyLoginTask, {
    manual: true,
    onSuccess: (res) => {
      console.log('Daily login task completed:', res)
    },
  })

  const { run: runDailyWatch } = useRequest(dailyWatchTask, {
    manual: true,
    onSuccess: (res) => {
      console.log('Watch video task completed:', res)
    },
  })

  const { run: runDailyChat } = useRequest(dailyChatTask, {
    manual: true,
    onSuccess: (res) => {
      console.log('Daily chat task completed:', res)
    },
  })

  const { run: runDailyCompleteAll } = useRequest(completeAllTasks, {
    manual: true,
    onSuccess: (res) => {
      console.log('All tasks completed:', res)
    },
  })

  return {
    runDailyLogin,
    runDailyWatch,
    runDailyChat,
    runDailyCompleteAll,
  }
}
