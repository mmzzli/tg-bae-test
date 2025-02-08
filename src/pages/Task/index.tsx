import { FC, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { claimTask, claimAllTasks, setFollowTaskToClaimed, claimFollowTask } from '@/api'
import Confetti from 'react-confetti'
import { Box, useToast } from '@chakra-ui/react'
import { postEvent } from '@telegram-apps/sdk'
import { useRequest } from 'ahooks'
import BaseButton from '@/components/BaseButton/BaseButton'
import { CustomToast, typeOptions } from '@/components/comm/Toast'
import { useGetDailyTask, useDailyTaskStatus, useGetFollowTask } from '@/hooks/useDailyTask'
import { useStore } from '@/store'
import { DailyTaskItem, DailyTaskStatusEnum } from '@/store/slices/systemSlice'

import { useTMAUtils } from '@/hooks/useTMAUtils'
import BottomCloseModal from '@/components/TaskPointsDialog'
import PointsAlertIcon from '@/assets/image/task/points-alert-icon.png'
import { getTaskPoints } from '@/api/list'
import { COMMUNITY_LINK } from '@/utils/constants'

enum TaskType {
  ClaimAll = 11,
  Chat = 9,
  NewPost = 8,
}

const FOLLOW_X = 13
const FOLLOW_INS = 14
const POST_CHANNEL = 16

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
  const postChannelIcon = <i className="iconfont icon-post  text-[20px]"></i>

  const xIcon = <i className="iconfont icon-icon_x text-[20px]"></i>
  const insIcon = <i className="iconfont icon-ins text-[20px]"></i>

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
    case 13:
      return xIcon
    case 14:
      return insIcon
    case 16:
      return postChannelIcon
    default:
      return null
  }
}

const TaskButton: React.FC<{
  task: DailyTaskItem
  onClick: () => void
  afterClaim?: () => void
  claim?: (task: DailyTaskItem) => void
  setIsConfetti?: (show: boolean) => void
}> = ({ task, onClick, afterClaim, claim, setIsConfetti }) => {
  const { runGetDailyTask } = useGetDailyTask()
  const { updateDailyTask, dailyTaskList } = useStore((state) => ({
    updateDailyTask: state.updateDailyTask,
    dailyTaskList: state.dailyTaskList,
  }))

  const { isAllTasksCompleted } = useDailyTaskStatus()
  const dailyTaskCount = dailyTaskList.filter((task) => task.task_type !== TaskType.ClaimAll).length
  const completedTaskCount = dailyTaskList.filter(
    (task) => task.status === DailyTaskStatusEnum.CLAIMED
  ).length

  const onClaimSuccess = () => {
    updateDailyTask({
      task_type: task.task_type,
      status: DailyTaskStatusEnum.CLAIMED,
    } as DailyTaskItem)
    runGetDailyTask()
    afterClaim?.()
  }

  const onClaimAllSuccess = () => {
    runGetDailyTask()
    afterClaim?.()
    setIsConfetti?.(true)
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
      onClaimAllSuccess()
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
    setIsConfetti?.(true)
    runClaimAllTask()
  }

  const handleClaimTask = () => {
    haptic()
    if (claim) {
      claim(task)
    } else {
      runClaimTask(task.task_type)
    }
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
    return (
      <BaseButton
        text={`${completedTaskCount}/${dailyTaskCount}`}
        handler={onClick}
        className="w-[79px] h-[34px] text-black bg-transparent border border-[#CDCDD4]"
      />
    )
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
      return (
        <BaseButton
          text={`${task.detail?.split(':')?.length}/${task.total_amount}`}
          handler={onClick}
          className="w-[79px] h-[34px] text-black bg-transparent border border-[#CDCDD4]"
        />
      )
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
  afterClaim?: () => void
  claim?: (task: DailyTaskItem) => void
  setIsConfetti?: (show: boolean) => void
}> = ({ task, onTaskAction, afterClaim, claim, setIsConfetti }) => {
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
      <TaskButton
        task={task}
        onClick={() => onTaskAction(task)}
        afterClaim={afterClaim}
        claim={claim}
        setIsConfetti={setIsConfetti}
      />
    </div>
  )
}

const Tasks: FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [taskPoints, setTaskPoints] = useState(0)
  const [isConfetti, setIsConfetti] = useState(false)
  const navigate = useNavigate()
  const {
    dailyTaskList,
    totalTaskPoints,
    token,
    paidStars,
    paidStarsPoints,
    followTaskList,
    totalFollowTaskPoints,
  } = useStore((state) => ({
    dailyTaskList: state.dailyTaskList,
    totalTaskPoints: state.totalTaskPoints,
    totalFollowTaskPoints: state.totalFollowTaskPoints,
    paidStars: state.paidStars,
    paidStarsPoints: state.paidStarsPoints,
    updateDailyTask: state.updateDailyTask,
    token: state.token,
    followTaskList: state.followTaskList,
  }))
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)
  const { runGetDailyTask } = useGetDailyTask()
  const { runGetFollowTask } = useGetFollowTask()
  const toast = useToast()
  const toastIdRef = useRef<string | number | undefined>()
  const tooltipRef = useRef<HTMLDivElement>(null)

  const isAllFollowTasksClaimed = followTaskList.every(
    (task) => task.status === DailyTaskStatusEnum.CLAIMED
  )

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

  const { run: runGetTaskPoints } = useRequest(getTaskPoints, {
    manual: true,
    onSuccess(data) {
      if (data) {
        setIsOpen(true)
        setTaskPoints(data)
      }
    },
  })

  const handleDrawShape = (ctx: CanvasRenderingContext2D) => {
    ctx.beginPath()
    // 绘制随机的正方形和长方形
    for (let i = 0; i < 5; i++) {
      const size = Math.random() * 8 + 3 // 随机大小3-11像素
      const width = Math.random() * 10 + 5 // 随机宽度5-15像素
      const height = Math.random() * 10 + 5 // 随机高度5-15像素

      if (i % 2 === 0) {
        // 绘制正方形
        ctx.rect(-size / 2, -size / 2, size, size)
      } else {
        // 绘制长方形
        ctx.rect(-width / 2, -height / 2, width, height)
      }
      ctx.fill()
    }
    ctx.stroke()
    ctx.closePath()
  }

  useEffect(() => {
    if (token) {
      runGetDailyTask()
      runGetFollowTask()
      runGetTaskPoints()
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

  useEffect(() => {
    if (isConfetti) {
      const timer = setTimeout(() => {
        setIsConfetti(false)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [isConfetti])

  return (
    <div className="p-6 bg-white overflow-auto h-full scrollbar-hide">
      {/* title */}

      <BottomCloseModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Box className="flex items-center justify-center flex-col">
          <img src={PointsAlertIcon} alt="points" className="w-[168px] h-[136px]" />
          <p className="text-center font-[Switzer] text-[20px] font-[700] leading-[130%] text-[#121212] capitalize my-[12px]">
            congrats !
          </p>
          <p className="text-center font-[Switzer] text-[16px] font-[400] leading-[120%] text-[#666)] mb-[24px]">
            You have won{' '}
            <span
              style={{
                color: '#6254FF',
                fontFamily: 'Roboto',
                fontSize: '16px',
                fontStyle: 'normal',
                fontWeight: '600',
                lineHeight: '120%',
              }}
            >
              {taskPoints}
            </span>{' '}
            Bae points.
          </p>
          <BaseButton
            text="Got it"
            handler={() => setIsOpen(false)}
            className="w-[270px] h-[48px]"
          />
        </Box>
      </BottomCloseModal>
      <div className="mb-4 flex flex-col items-center justify-center">
        <h1 className="text-[40px] leading-[42px] font-bold text-[#333333]">
          <AnimatedNumber value={totalTaskPoints + totalFollowTaskPoints + taskPoints} />
        </h1>
        <p className="pt-[10px] text-[12px] leading-[16px] text-[#999999]">My Bae points</p>
      </div>

      {/* stars */}
      <div className="relative flex items-center justify-center mb-6 h-[93px] bg-[#F7F9FC] rounded-2xl">
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="h-[38px] text-[24px] font-[800] flex items-center">
            {paidStars}
            <i className="iconfont icon-stars text-[19px] text-[#FFC700] ml-1"></i>
          </div>
          <span className="text-[#666666] text-xs h-[20px]">Stars paid</span>
        </div>
        <div className="absolute top-[34px] bottom-[34px] left-1/2 w-[1px] bg-[#EBEBF4]"></div>
        <div className="relative flex flex-col items-center justify-center flex-1">
          <div className="h-[38px] text-[24px] font-[800] flex items-center">{paidStarsPoints}</div>
          <div className="flex items-center text-[#666666] text-xs h-[20px]">
            Points earned
            <i
              ref={tooltipRef}
              onClick={() => setIsTooltipOpen(!isTooltipOpen)}
              className="iconfont icon-info text-[18px] text-[#999] ml-1 mb-[1px]"
            ></i>
            <div
              className="absolute right-0 top-[62px] w-[203px] h-[72px] p-3 flex items-center bg-white rounded-lg z-[999]"
              style={{
                boxShadow: 'rgba(0, 0, 0, 0.1) 0px 2px 16px 0px',
                opacity: isTooltipOpen ? 1 : 0,
                zIndex: isTooltipOpen ? 1 : -1,
                transition: 'opacity 0.3s ease-in-out',
              }}
            >
              <p className="text-[14px] text-[#666666] font-normal">
                For every Telegram star you spend to unlock a post, you earn 10 points.
              </p>
            </div>
          </div>
        </div>
      </div>

      {!isAllFollowTasksClaimed && <FollowTask successToast={successToast} />}

      {/* date */}
      <div className="flex justify-between items-center mb-4 text-[16px] leading-[21px] h-[21px]">
        <h2 className="font-bold text-[#333333]">Daily Tasks</h2>
        <div className="flex items-center text-[#333333]">
          <i className="iconfont icon-icon_daily text-[20px] mr-1 mb-[2px]"></i>
          <span>
            {new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              formatMatcher: 'best fit',
            })}
          </span>
        </div>
      </div>

      {/* task list */}
      <div className="space-y-3 transition-transform duration-500 mb-8">
        {dailyTaskList.map((task) => (
          <TaskItem
            key={task.task_type}
            task={task}
            onTaskAction={handleTaskAction}
            afterClaim={successToast}
            setIsConfetti={setIsConfetti}
          />
        ))}
      </div>
      {isAllFollowTasksClaimed && <FollowTask successToast={successToast} />}
      {isConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          tweenDuration={7000}
          colors={['#84FECD', '#77A9FF', '#BC6BF4', '#FF5596', '#64AEFF']}
          drawShape={handleDrawShape}
        />
      )}
    </div>
  )
}

const FollowTask: React.FC<{ successToast: () => void }> = ({ successToast }) => {
  const { openLink, shareLink } = useTMAUtils()

  const { runGetFollowTask } = useGetFollowTask()
  const { followTaskList, updateFollowTask } = useStore((state) => ({
    followTaskList: state.followTaskList,
    updateFollowTask: state.updateFollowTask,
  }))
  const followX = () => {
    openLink('https://x.com/onlyonbae?s=21&t=Nq0aVtqsD7dXOxaUwmbPKA')
  }
  const followInstagram = () => {
    openLink('https://www.instagram.com/onlyon.bae?igsh=MW50d2Fram54a2M3aw==')
  }

  const handleTaskAction = (task: DailyTaskItem) => {
    console.log('handleTaskAction....', task)
    if (task.task_type === 13) {
      followX()
    } else if (task.task_type === 14) {
      followInstagram()
    } else if (task.task_type === POST_CHANNEL) {
      console.log('shareLink....', COMMUNITY_LINK)
      shareLink(COMMUNITY_LINK)
    }
  }

  const onClaimSuccess = () => {
    runGetFollowTask()
    successToast()
  }

  const { run: runFollowTaskToClaimed } = useRequest(setFollowTaskToClaimed, {
    manual: true,
    onSuccess() {
      runGetFollowTask()
    },
  })

  const { run: runClaimFollowTask } = useRequest(claimFollowTask, {
    manual: true,
    onSuccess() {
      onClaimSuccess()
    },
  })

  const handleTaskToClaimed = (task: DailyTaskItem) => {
    console.log('handleTaskToClaimed....', task)
    handleTaskAction(task)
    const taskName =
      task.task_type === FOLLOW_X ? 'x' : task.task_type === FOLLOW_INS ? 'ins' : 'channel'
    runFollowTaskToClaimed(taskName)
  }

  const handleClaimTask = (task: DailyTaskItem) => {
    runClaimFollowTask(task.task_type)
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4 text-[16px] leading-[21px] h-[21px]">
        <h2 className="font-bold text-[#333333]">Follow community</h2>
      </div>
      <div className="space-y-3 transition-transform duration-500 mb-8">
        {followTaskList.map((task) => (
          <TaskItem
            key={task.task_type}
            task={task}
            onTaskAction={handleTaskToClaimed}
            claim={handleClaimTask}
          />
        ))}
      </div>
    </>
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
      icon={<i className="iconfont icon-a-check-line1 text-[22px] text-[#CDCDD4]"></i>}
      disabled={true}
      handler={() => {}}
      className="bg-[#EFF2F8] w-[79px] h-[34px]"
    />
  )
}

export default Tasks
