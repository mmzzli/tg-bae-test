import { useProfileNavigation } from '@/hooks/useProfileNavigation'
import { useStore } from '@/store'
import { FC, memo, useEffect, useRef, useState } from 'react'
import Image from '@/components/Image/Image'
import { NotificationType, UserItem } from '@/types'
import { getTimeStringAutoShort } from '@/utils/utils'
import FollowButton from '../FollowButton'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import {
  getNotificationsById,
  setLatestReadNotificationId as setLatestReadNotificationIdApi,
} from '@/api'

const NotificationList: FC = () => {
  const notificationList = useStore((state) => state.notificationList)
  const setNotificationList = useStore((state) => state.setNotificationList)
  const latestReadNotificationId = useStore((state) => state.latestReadNotificationId)
  const setLatestReadNotificationId = useStore((state) => state.setLatestReadNotificationId)
  const setUnreadNotificationCount = useStore((state) => state.setUnreadNotificationCount)

  const forwardsTriggerRef = useRef<HTMLDivElement>(null)

  const setImageResource = useStore((state) => state.setImageResource)
  const jumpToProfilePage = useProfileNavigation()
  const { getCurrentUid } = useTMAUtils()
  const currentUid = getCurrentUid()

  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

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
        <div key={notification.id} className="px-6 py-4 text-sm">
          <div className="flex">
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

            <div className="flex-1 ml-2 overflow-hidden">
              {/* Info Area */}
              <div className="flex items-center justify-between">
                <div className="text-black font-normal flex-1 text-ellipsis overflow-hidden whitespace-nowrap">
                  <span className="text-[#333] font-medium">{notification.user.username}</span>
                  <span className="text-[#666]">
                    {notification.type === NotificationType.Follow
                      ? ' started following you'
                      : notification.type === NotificationType.Like
                        ? ' liked your post'
                        : ' purchased your post'}
                  </span>
                </div>
                <span className="text-[#999] text-[12px] ml-4">
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
                  <div className="w-[80px] h-[80px] rounded-sm overflow-hidden">
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
        </div>
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
