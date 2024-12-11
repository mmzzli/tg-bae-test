import { useProfileNavigation } from '@/hooks/useProfileNavigation'
import { useStore } from '@/store'
import { FC, memo, useEffect, useRef, useState } from 'react'
import Image from '@/components/Image/Image'
import { NotificationType, UserItem } from '@/types'
import { getTimeStringAutoShort } from '@/utils/utils'
import FollowButton from '../FollowButton'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import {
  deleteNotification,
  getNotificationsById,
  setLatestReadNotificationId as setLatestReadNotificationIdApi,
} from '@/api'
import { AnimationControls, motion, PanInfo, useAnimation } from 'framer-motion'
import { DeleteDialog } from '@/components/Chat/DeleteDialog'
import { useToast } from '@chakra-ui/react'
import { CustomToast, typeOptions } from '@/components/comm/Toast'

const MOVE_SIZE = 64
const MOVE_THRESHOLD = 38

const NotificationItem: FC<{
  notification: any // 根据你的类型定义修改
  onDragEnd: (
    id: number,
    controls: AnimationControls,
    event?: MouseEvent | TouchEvent | PointerEvent,
    info?: PanInfo
  ) => void
  controlsRef: React.MutableRefObject<{ [key: number]: AnimationControls }>
  resetAllControls: () => void
}> = ({ notification, onDragEnd, controlsRef, resetAllControls }) => {
  const itemControls = useAnimation()

  const latestReadNotificationId = useStore((state) => state.latestReadNotificationId)
  const setNotificationList = useStore((state) => state.setNotificationList)
  const notificationList = useStore((state) => state.notificationList)
  const setImageResource = useStore((state) => state.setImageResource)
  const jumpToProfilePage = useProfileNavigation()
  const { getCurrentUid } = useTMAUtils()
  const currentUid = getCurrentUid()
  const toast = useToast()
  const handleDelete = async () => {
    try {
      setTimeout(() => {
        setNotificationList(notificationList.filter((item) => item.id !== notification.id))
      }, 100)
      await deleteNotification(notification.id)
    } catch (error) {
      console.error('Failed to delete notification:', error)
      toast({
        render: () => {
          return (
            <CustomToast
              title="Delete notification failed"
              type={typeOptions.error}
              top={
                window
                  .getComputedStyle(document.documentElement)
                  .getPropertyValue('--tg-safe-area-inset-top') &&
                parseInt(
                  window
                    .getComputedStyle(document.documentElement)
                    .getPropertyValue('--tg-safe-area-inset-top'),
                  10
                ) !== 0
                  ? parseInt(
                      window
                        .getComputedStyle(document.documentElement)
                        .getPropertyValue('--tg-safe-area-inset-top'),
                      10
                    ) +
                    44 +
                    'px'
                  : ''
              }
            />
          )
        },
        position: 'top',
      })
    } finally {
      resetAllControls()
    }
  }

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.y) > Math.abs(info.offset.x) && info.offset.x < 10) {
      itemControls.start({ x: 0 })
    }
  }

  const handleClick = () => {
    resetAllControls()
  }

  useEffect(() => {
    controlsRef.current[notification.id] = itemControls
    return () => {
      delete controlsRef.current[notification.id]
    }
  }, [notification.id])

  return (
    <div
      className="position relative overflow-hidden"
      style={{
        height: notification.type === NotificationType.Follow ? '96px' : '144px',
      }}
    >
      <DeleteDialog
        onDelete={handleDelete}
        onCancel={() => {
          itemControls.start({ x: 0 })
        }}
        title="Delete this notification?"
      />
      <motion.div
        drag="x"
        dragConstraints={{ left: -MOVE_SIZE, right: 0 }}
        dragElastic={0.2}
        onDrag={handleDrag}
        onDragEnd={(event, info) => onDragEnd(notification.id, itemControls, event, info)}
        animate={itemControls}
        onClick={handleClick}
        className="absolute top-0 left-0 right-0 bottom-0 dark:bg-black  z-20 notification-item"
        style={{
          x: 0,
          backgroundColor: latestReadNotificationId < notification.id ? '#F7F9FC' : '#FFFFFF',
        }}
      >
        <div className="flex px-6 py-4 text-sm">
          <div className="relative">
            <Image
              rect
              type="avatar"
              src={notification.user.avatar}
              width={48}
              height={48}
              className="w-full h-full rounded-full"
              onClick={() => {
                jumpToProfilePage(notification.user as unknown as UserItem)
              }}
            />
            {latestReadNotificationId < notification.id && (
              <span className="absolute -left-[12px] top-[27px] w-[8px] h-[8px] rounded-full overflow-hidden bg-[#6254FF]"></span>
            )}
          </div>

          <div className="flex-1 ml-[13px] overflow-hidden">
            {/* Info Area */}
            <div className="flex items-center justify-between">
              <div className="text-black font-normal flex-1 flex overflow-hidden">
                <span
                  onClick={() => {
                    jumpToProfilePage(notification.user as unknown as UserItem)
                  }}
                  className="text-[#333] font-medium text-ellipsis overflow-hidden whitespace-nowrap min-w-[1rem]"
                >
                  {notification.user.username}
                </span>
                <span className="text-[#666] flex-1 whitespace-nowrap ml-[4px]">
                  {notification.type === NotificationType.Follow
                    ? ' started following you'
                    : notification.type === NotificationType.Like
                      ? ' liked your post'
                      : ' purchased your post'}
                </span>
              </div>
              <span className="text-[#999] text-[12px] ml-[10px]">
                {getTimeStringAutoShort(new Date(notification.time).getTime(), true)}
              </span>
            </div>

            {/* Content Area */}
            <div className="mt-3">
              {notification.type === NotificationType.Follow ? (
                <FollowButton
                  fansid={currentUid}
                  tgid={notification.user.uid}
                  avatar={notification.user.avatar}
                  username={notification.user.username}
                  className="min-w-[75px]"
                />
              ) : (
                <div className="w-[80px] h-[80px] rounded-lg overflow-hidden">
                  <Image
                    rect
                    onClick={() => {
                      if (notification.post.type === 1 && notification.post.media.split(',')[0]) {
                        setImageResource({
                          images: notification.post.media.split(','),
                          currentIndex: 0,
                        })
                      } else {
                        setImageResource({
                          images: [notification.post.thumbnail],
                          currentIndex: 0,
                        })
                      }
                    }}
                    src={
                      notification.post.type === 1 && notification.post.media.split(',')[0]
                        ? notification.post.media.split(',')[0]
                        : notification.post.thumbnail
                    }
                    width={80}
                    height={80}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const NotificationList: FC = () => {
  const notificationList = useStore((state) => state.notificationList)
  const setNotificationList = useStore((state) => state.setNotificationList)
  const setLatestReadNotificationId = useStore((state) => state.setLatestReadNotificationId)
  const setUnreadNotificationCount = useStore((state) => state.setUnreadNotificationCount)

  const forwardsTriggerRef = useRef<HTMLDivElement>(null)

  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const controlsRef = useRef<{ [key: number]: AnimationControls }>({})

  const resetOtherControls = (currentId: number) => {
    Object.entries(controlsRef.current).forEach(([id, control]) => {
      if (Number(id) !== currentId) {
        control.start({ x: 0 })
      }
    })
  }

  const resetAllControls = () => {
    Object.values(controlsRef.current).forEach((control) => {
      control.start({ x: 0 })
    })
  }

  const handleDragEnd = (
    notificationId: number,
    controls: AnimationControls,
    event?: MouseEvent | TouchEvent | PointerEvent,
    info?: PanInfo
  ) => {
    if (info && info.offset.x < -MOVE_THRESHOLD) {
      controls.start({ x: -MOVE_SIZE })
      resetOtherControls(notificationId)
    } else {
      controls.start({ x: 0 })
    }
  }

  const loadMoreNotifications = async () => {
    if (!hasMore || isLoading) return

    try {
      setIsLoading(true)
      const newNotifications = await getNotificationsById({
        id: notificationList[notificationList.length - 1].id,
        records: 10,
      })
      if (newNotifications.posts.length === 0) {
        setHasMore(false)
      } else {
        setNotificationList([...notificationList, ...newNotifications.posts])
      }
    } catch (error) {
      setHasMore(false)
      console.error('Failed to load more notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreNotifications()
        }
      },
      { threshold: 0.5 }
    )

    if (forwardsTriggerRef.current) {
      observer.observe(forwardsTriggerRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [hasMore, isLoading, notificationList])

  useEffect(() => {
    return () => {
      const latestNotificationId = notificationList[0]?.id
      if (latestNotificationId || latestNotificationId === 0) {
        // update DB
        setLatestReadNotificationIdApi(latestNotificationId)
        // update store
        setLatestReadNotificationId(latestNotificationId)
      }
      setUnreadNotificationCount(0)
    }
  }, [])

  return (
    <>
      {notificationList.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDragEnd={handleDragEnd}
          controlsRef={controlsRef}
          resetAllControls={resetAllControls}
        />
      ))}
      <div ref={forwardsTriggerRef} key="forwards-trigger" className="forwards-trigger">
        {isLoading && (
          <div className="py-4 flex items-center justify-center">
            <i
              className="iconfont icon-loading animate-spin text-[#6254FF]"
              style={{ fontSize: '40px' }}
            />
          </div>
        )}
      </div>
    </>
  )
}

export default memo(NotificationList)
