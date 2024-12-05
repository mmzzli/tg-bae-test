import { useStore } from '@/store'
import Image from '@/components/Image/Image'
import { profileImg } from '@/assets/image'
import { useEffect, useRef, useState } from 'react'
import {
  getLatestReadNotificationId,
  setLatestReadNotificationId as setLatestReadNotificationIdApi,
  getNotifications,
} from '@/api'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { NotificationType as NotificationTypes, Notification as TypeNotification } from '@/types'
import { getTimeStringAutoShort } from '@/utils/utils'
import FollowButton from '../FollowButton'
const Notification = () => {
  const setVirtualRoutePage = useStore((state) => state.setVirtualRoutePage)
  const virtualRoutePage = useStore((state) => state.virtualRoutePage)
  const unreadNotificationCount = useStore((state) => state.unreadNotificationCount)
  const setUnreadNotificationCount = useStore((state) => state.setUnreadNotificationCount)
  const setImageResource = useStore((state) => state.setImageResource)
  const setLatestReadNotificationId = useStore((state) => state.setLatestReadNotificationId)
  const latestReadNotificationIdFromStore = useStore((state) => state.latestReadNotificationId)
  const { getCurrentUid } = useTMAUtils()
  const currentUid = getCurrentUid()

  const [notificationList, setNotificationList] = useState<TypeNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const latestReadNotificationId = useRef(latestReadNotificationIdFromStore)
  const prevVirtualRoutePage = useRef(virtualRoutePage)
  const prevUnreadNotificationCount = useRef(unreadNotificationCount)

  const getInitialNotificationList = async () => {
    const res = await getNotifications({ page_num: 1, records: unreadNotificationCount + 20 })
    setNotificationList(res.posts)
    setIsLoading(false)
  }

  const updateNotificationList = async (amount: number) => {
    if (amount === 0) {
      return
    }
    // 10 because may have new notifications while reading unread notifications amount(5s interval)
    const res = await getNotifications({ page_num: 1, records: amount + 10 })
    // need remove duplicated notifications by id
    const newNotifications: TypeNotification[] = []
    let idsInList = new Set(notificationList.map((notification) => notification.id))
    res.posts.forEach((notification) => {
      if (!idsInList.has(notification.id)) {
        newNotifications.push(notification)
      }
    })
    setNotificationList([...newNotifications, ...notificationList])
  }

  useEffect(() => {
    if (
      virtualRoutePage?.name !== 'Notification' &&
      prevVirtualRoutePage.current?.name !== 'Notification'
    ) {
      prevVirtualRoutePage.current = virtualRoutePage
      return
    }
    if (prevVirtualRoutePage.current?.name === 'Notification') {
      console.log('setLatestReadNotificationId')
      const latestNotificationId = notificationList[0]?.id
      if (latestNotificationId || latestNotificationId === 0) {
        // update DB
        setLatestReadNotificationIdApi(latestNotificationId)
        // update store
        setLatestReadNotificationId(latestNotificationId)
        // update current page state
        latestReadNotificationId.current = latestNotificationId
      }
      setUnreadNotificationCount(0)

      prevVirtualRoutePage.current = virtualRoutePage
      return
    }

    prevVirtualRoutePage.current = virtualRoutePage
    getInitialNotificationList()
    getLatestReadNotificationId(currentUid).then((res) => {
      latestReadNotificationId.current = res.latest_id
      setLatestReadNotificationId(res.latest_id)
    })
  }, [virtualRoutePage])

  useEffect(() => {
    if (unreadNotificationCount) {
      updateNotificationList(unreadNotificationCount - prevUnreadNotificationCount.current)
      prevUnreadNotificationCount.current = unreadNotificationCount
    }
  }, [unreadNotificationCount])

  return (
    <>
      <div
        className="relative flex items-center justify-center w-[36px] h-[36px] rounded-full ml-[12px] bg-[#F8F8F8]"
        onClick={() => {
          setVirtualRoutePage({
            name: 'Notification',
          })
        }}
      >
        <i
          className="iconfont icon-notification-2-line text-[#333333]"
          style={{ fontSize: '20px' }}
        ></i>
        <div
          className="absolute -top-1 left-1/2 flex items-center justify-center px-[6px] min-w-[20px] h-[20px] pb-[1px] bg-[#FF6A26] rounded-full text-white text-[10px] font-bold"
          style={{ opacity: unreadNotificationCount > 0 ? 1 : 0 }}
        >
          {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
        </div>
      </div>
      {virtualRoutePage?.name === 'Notification' && (
        <div
          className="fixed top-0 left-0 right-0 bottom-0 z-[999] bg-white"
          style={{
            paddingTop: 'calc(var(--tg-safe-area-inset-top) + 16px)',
            paddingBottom: 'var(--tg-safe-area-inset-bottom)',
          }}
        >
          <div
            className="relative w-full h-full"
            style={{
              paddingTop: 'var(--tg-content-safe-area-inset-top)',
              paddingBottom: 'var(--tg-content-safe-area-inset-bottom)',
            }}
          >
            <div className="relative w-full h-full flex flex-col">
              <h1 className="text-black text-[20px] font-bold h-[41px] leading-[41px] mb-2 pl-6">
                Notification
              </h1>
              <div className="flex flex-1 flex-col overflow-auto scrollbar-hide">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <i
                      className="iconfont icon-loading animate-spin text-[#6254FF]"
                      style={{ fontSize: '40px' }}
                    ></i>
                  </div>
                ) : (
                  notificationList.map((notification) => (
                    <div key={notification.id} className="px-6 py-4 text-sm">
                      <div className="flex">
                        <div className="relative">
                          <Image
                            rect
                            type="avatar"
                            src={profileImg}
                            width={48}
                            height={48}
                            className="w-full h-full rounded-full"
                          />
                          {latestReadNotificationId.current < notification.id && (
                            <span className="absolute -left-[12px] top-[27px] w-[8px] h-[8px] rounded-full overflow-hidden bg-[#6254FF]"></span>
                          )}
                        </div>

                        <div className="flex-1 ml-2 overflow-hidden">
                          {/* Info Area */}
                          <div className="flex items-center justify-between">
                            <div className="text-black font-normal flex-1 text-ellipsis overflow-hidden whitespace-nowrap">
                              <span className="text-[#333] font-medium">
                                {notification.user.username}
                              </span>
                              <span className="text-[#666]">
                                {notification.type === NotificationTypes.Follow
                                  ? ' started following you'
                                  : notification.type === NotificationTypes.Like
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
                            {notification.type === NotificationTypes.Follow ? (
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
                                    if (notification.post.media.split(',')[0])
                                      setImageResource({
                                        images: notification.post.media.split(','),
                                        currentIndex: 0,
                                      })
                                  }}
                                  src={notification.post.media.split(',')[0]}
                                  width={80}
                                  height={80}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div className="h-[40px]"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
export default Notification
