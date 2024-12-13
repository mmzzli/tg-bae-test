import { claimTask, claimAllTasks } from '@/api'
import BaseButton from '@/components/BaseButton/BaseButton'
import { CustomToast, typeOptions } from '@/components/comm/Toast'
import { useGetDailyTask, useDailyTaskStatus } from '@/hooks/useDailyTask'
import { useStore } from '@/store'
import { DailyTaskItem, DailyTaskStatusEnum } from '@/store/slices/systemSlice'
import { useToast, Tooltip } from '@chakra-ui/react'
import { postEvent } from '@telegram-apps/sdk'
import { useRequest } from 'ahooks'
import { FC, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

enum TaskType {
  ClaimAll = 11,
  Chat = 9,
  NewPost = 8,
}

const goToAction = (task: DailyTaskItem) => {
  switch (task.task_type) {
    case TaskType.ClaimAll:
      return null
    case TaskType.Chat:
      return '/chat'
    case TaskType.NewPost:
      return '/post'
    default:
      return '/home'
  }
}

const getTaskIcon = (task: DailyTaskItem) => {
  const watchIcon = <i className="iconfont icon-icon_watch  text-[20px]"></i>
  const likeIcon = <i className="iconfont icon-like  text-[20px]"></i>
  const saveIcon = <i className="iconfont icon-bookmark-line  text-[20px]"></i>
  const chatIcon = <i className="iconfont icon-Frame-1  text-[20px]"></i>
  const postIcon = <i className="iconfont icon-camera-ai-line  text-[20px]"></i>
  const shareIcon = <i className="iconfont icon-Frame-2  text-[20px]"></i>
  const followIcon = <i className="iconfont icon-icon_follow  text-[20px]"></i>
  const dateIcon = <i className="iconfont icon-icon_daily  text-[20px]"></i>
  const unlockIcon = <i className="iconfont icon-icon_money  text-[20px]"></i>
  const claimAllIcon = <i className="iconfont icon-Frame1  text-[20px]"></i>

  switch (task.task_type) {
    case 1:
      return dateIcon
    case 2:
      return followIcon
    case 3:
      return watchIcon
    case 4:
      return likeIcon
    case 5:
      return saveIcon
    case 6:
    case 7:
      return shareIcon
    case 8:
      return postIcon
    case 9:
      return chatIcon
    case 10:
      return unlockIcon
    case 11:
      return claimAllIcon
    default:
      return null
  }
}

const TaskButton: React.FC<{
  task: DailyTaskItem
  onClick: () => void
  afterClaim: () => void
}> = ({ task, onClick, afterClaim }) => {
  const { runGetDailyTask, loading } = useGetDailyTask()
  const { updateDailyTask } = useStore((state) => ({
    updateDailyTask: state.updateDailyTask,
  }))
  const { isAllTasksCompleted } = useDailyTaskStatus()

  const onClaimSuccess = () => {
    updateDailyTask({
      task_type: task.task_type,
      status: DailyTaskStatusEnum.CLAIMED,
    } as DailyTaskItem)
    runGetDailyTask()
    afterClaim()
  }

  const { run: runClaimTask, loading: claimTaskLoading } = useRequest(claimTask, {
    manual: true,
    onSuccess() {
      onClaimSuccess()
    },
  })

  const { run: runClaimAllTask, loading: claimAllTaskLoading } = useRequest(claimAllTasks, {
    manual: true,
    onSuccess() {
      onClaimSuccess()
    },
  })

  const haptic = () => {
    postEvent('web_app_trigger_haptic_feedback', {
      type: 'impact',
      impact_style: 'heavy',
    })
  }
  const handleClaimAllTask = () => {
    haptic()
    runClaimAllTask()
  }

  const handleClaimTask = () => {
    haptic()
    runClaimTask(task.task_type)
  }
  const status = task.status

  if (task.task_type === TaskType.ClaimAll) {
    if (isAllTasksCompleted && task.status !== DailyTaskStatusEnum.CLAIMED) {
      return (
        <BaseButton
          text="Claim"
          handler={handleClaimAllTask}
          loading={claimAllTaskLoading}
          className="w-[79px] h-[34px]"
        />
      )
    } else if (task.status === DailyTaskStatusEnum.CLAIMED) {
      return <ClaimedButton />
    }
    return <span className="text-sm text-[#999999] font-medium">In progress</span>
  }

  switch (status) {
    case DailyTaskStatusEnum.GO:
      return (
        <BaseButton
          text="Go"
          handler={onClick}
          className="w-[79px] h-[34px] text-black bg-transparent border border-[#CDCDD4]"
        />
      )
    case DailyTaskStatusEnum.IN_PROGRESS:
      return <span className="text-sm text-[#999999] font-medium">In progress</span>
    case DailyTaskStatusEnum.CLAIM:
      return (
        <BaseButton
          text="Claim"
          handler={handleClaimTask}
          loading={claimTaskLoading}
          className="w-[79px] h-[32px]"
        />
      )
    case DailyTaskStatusEnum.CLAIMED:
      return <ClaimedButton />
  }
}

const TaskItem: React.FC<{
  task: DailyTaskItem
  onTaskAction: (task: DailyTaskItem) => void
  afterClaim: () => void
}> = ({ task, onTaskAction, afterClaim }) => {
  return (
    <div className="flex items-center justify-between bg-[#F7F9FC] p-4 rounded-lg transform transition-transform duration-500">
      <div className="flex items-center">
        <div className="w-8 h-8 bg-[#333333] rounded-lg flex items-center justify-center text-white">
          {getTaskIcon(task)}
        </div>
        <div className="ml-3">
          <p className="text-sm text-[#333333] font-medium">{task.content}</p>
          <p className="text-xs text-[#999999]">+{task.points} points</p>
        </div>
      </div>
      <TaskButton task={task} onClick={() => onTaskAction(task)} afterClaim={afterClaim} />
    </div>
  )
}

const Tasks: FC = () => {
  const navigate = useNavigate()
  const {
    dailyTaskList,
    totalTaskPoints,
    token,
    updateDailyTask,
    paidStars,
    paidStarsPoints,
    setPaidStars,
    setPaidStarsPoints,
  } = useStore((state) => ({
    dailyTaskList: state.dailyTaskList,
    totalTaskPoints: state.totalTaskPoints,
    paidStars: state.paidStars,
    paidStarsPoints: state.paidStarsPoints,
    updateDailyTask: state.updateDailyTask,
    setPaidStars: state.setPaidStars,
    setPaidStarsPoints: state.setPaidStarsPoints,
    token: state.token,
  }))
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)
  const { runGetDailyTask, loading } = useGetDailyTask()
  const toast = useToast()
  const toastIdRef = useRef<string | number | undefined>()
  const tooltipRef = useRef<HTMLDivElement>(null)

  const successToast = () => {
    if (toastIdRef.current) {
      const currentToastId = toastIdRef.current
      setTimeout(() => {
        toast.close(currentToastId)
      }, 550)
    }
    toastIdRef.current = toast({
      render: () => {
        return (
          <CustomToast
            title="Points claimed!"
            type={typeOptions.success}
            className="w-[155px] ml-[50%] translate-x-[-72px] px-[10px] py-[10px]"
          />
        )
      },
      position: 'bottom',
      duration: 2000,
    })
  }

  const handleTaskAction = (task: DailyTaskItem) => {
    if (task.status === DailyTaskStatusEnum.GO) {
      const action = goToAction(task)
      if (action) {
        navigate(action)
      }
    }
  }

  useEffect(() => {
    if (token) {
      runGetDailyTask()
    }
  }, [token])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsTooltipOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  return (
    <div className="p-6 bg-white overflow-auto h-full scrollbar-hide">
      {/* title */}
      <div className="mb-4 flex flex-col items-center justify-center">
        <h1 className="text-[40px] leading-[42px] font-bold text-[#333333]">
          <AnimatedNumber value={totalTaskPoints} />
        </h1>
        <p className="text-[12px] leading-[16px] text-[#999999]">Points</p>
      </div>

      {/* stars */}
      <div className="relative flex items-center justify-center mb-6 h-[93px] bg-[#F7F9FC] rounded-2xl">
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="h-[38px] text-[28px] font-bold flex items-center">
            {paidStars}
            <i className="iconfont icon-stars text-[22px] text-[#FFC700] ml-1"></i>
          </div>
          <span className="text-[#666666] text-xs">Stars paid</span>
        </div>
        <div className="absolute top-[34px] bottom-[34px] left-1/2 w-[1px] bg-[#EBEBF4]"></div>
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="h-[38px] text-[28px] font-bold flex items-center">{paidStarsPoints}</div>
          <div className="flex items-center text-[#666666] text-xs">
            Points earned
            <Tooltip
              label={
                <div className="text-sm text-[#666666] w-[203px] p-3">
                  <p>For every Telegram star you spend to unlock a post, you earn 10 points.</p>
                </div>
              }
              bg="white"
              color="black"
              placement="bottom-end"
              borderRadius="md"
              boxShadow="md"
              isOpen={isTooltipOpen}
            >
              <div
                ref={tooltipRef}
                onClick={() => setIsTooltipOpen(!isTooltipOpen)}
                className="pt-[1px]"
              >
                <i className="iconfont icon-info text-[18px] text-[#999] ml-1"></i>
              </div>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* date */}
      <div className="flex justify-between items-center mb-4 text-[16px] leading-[21px] h-[21px]">
        <h2 className="font-bold text-[#333333]">Daily Tasks</h2>
        <div className="flex items-center text-[#333333]">
          <i className="iconfont icon-icon_daily text-[20px] mr-1 mb-[2px]"></i>
          <span>
            {new Date()
              .toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })
              .toUpperCase()}
          </span>
        </div>
      </div>

      {/* task list */}
      <div className="space-y-3 transition-transform duration-500">
        {dailyTaskList.map((task) => (
          <TaskItem
            key={task.task_type}
            task={task}
            onTaskAction={handleTaskAction}
            afterClaim={successToast}
          />
        ))}
      </div>
    </div>
  )
}

const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(value)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    const startValue = displayValue
    const endValue = value
    const duration = 1000
    const frameRate = 60
    const totalFrames = Math.round((duration / 1000) * frameRate)
    let currentFrame = 0

    const interval = setInterval(() => {
      currentFrame++
      const progress = currentFrame / totalFrames
      const currentValue = Math.round(startValue + (endValue - startValue) * progress)
      setDisplayValue(currentValue)

      if (currentFrame === totalFrames) {
        clearInterval(interval)
      }
    }, 1000 / frameRate)

    return () => clearInterval(interval)
  }, [value])

  return <span>{displayValue.toLocaleString()}</span>
}

const ClaimedButton: React.FC = () => {
  return (
    <BaseButton
      text=""
      icon={
        <div
          className="w-[10px] h-[7px] border-[2px] border-l-[#CDCDD4] border-b-[#CDCDD4] border-t-transparent border-r-transparent"
          style={{
            transform: 'rotate(-45deg)',
            marginTop: '-3px',
            marginLeft: '6px',
          }}
        ></div>
      }
      disabled={true}
      handler={() => {}}
      className="bg-[#EFF2F8] w-[79px] h-[34px]"
    />
  )
}

export default Tasks
