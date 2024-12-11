import { useRequest } from 'ahooks'
import { dailyLoginTask, dailyWatchTask, dailyChatTask, completeAllTasks } from '@/api'
import { useStore } from '@/store'
import { useMemo } from 'react'
import { getDailyTask } from '@/api/list'

export const useDailyTaskStatus = () => {
  const taskList = useStore((state) => state.dailyTaskList)

  const isAllTasksCompleted = useMemo(() => {
    return taskList.every((task) => task.status === 2)
  }, [taskList])

  return {
    taskList,
    isAllTasksCompleted,
  }
}

export const useGetDailyTask = () => {
  const { setDailyTaskList, setTotalTaskPoints } = useStore((state) => ({
    setDailyTaskList: state.setDailyTaskList,
    setTotalTaskPoints: state.setTotalTaskPoints,
  }))

  const { run: runGetDailyTask, loading } = useRequest(getDailyTask, {
    manual: true,
    onSuccess(data) {
      setDailyTaskList(data.details)
      setTotalTaskPoints(data.points)
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
