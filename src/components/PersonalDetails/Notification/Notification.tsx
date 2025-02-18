import { useStore } from '@/store'
import { useEffect, useRef, useState } from 'react'
import { getLatestReadNotificationId, getNotifications } from '@/api'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { Notification as TypeNotification } from '@/types'
import NotificationList from './NotificationList'

const NOTIFICATION_ICON_SIZE = '20px'
const INITIAL_EXTRA_RECORDS = 6
const NOTIFICATION_UPDATE_BUFFER = 4

const NotificationIcon = ({ unreadCount }: { unreadCount: number }) => (
  <div className="relative flex items-center justify-center w-[36px] h-[36px] rounded-full ml-[12px] bg-[#F8F8F8]">
    <i
      className="iconfont icon-notification-2-line text-[#333333]"
      style={{ fontSize: NOTIFICATION_ICON_SIZE }}
    />
    <div
      className="absolute -top-1 left-1/2 flex items-center justify-center px-[6px] min-w-[20px] h-[20px] pb-[1px] bg-[#FF6A26] rounded-full text-white text-[10px] font-bold"
      style={{ opacity: unreadCount > 0 ? 1 : 0 }}
    >
      {unreadCount > 99 ? '99+' : unreadCount}
    </div>
  </div>
)

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full pb-10">
    <i className="iconfont icon-loading animate-spin text-[#6254FF]" style={{ fontSize: '40px' }} />
  </div>
)

const Notification = () => {
  const {
    virtualRoutePage,
    setVirtualRoutePage,
    unreadNotificationCount,
    setLatestReadNotificationId,
    notificationList,
    setNotificationList,
  } = useStore((state) => ({
    virtualRoutePage: state.virtualRoutePage,
    setVirtualRoutePage: state.setVirtualRoutePage,
    unreadNotificationCount: state.unreadNotificationCount,
    setLatestReadNotificationId: state.setLatestReadNotificationId,
    notificationList: state.notificationList,
    setNotificationList: state.setNotificationList,
  }))

  const { getCurrentUid } = useTMAUtils()
  const currentUid = getCurrentUid()

  const [isLoading, setIsLoading] = useState(true)
  const prevUnreadCount = useRef(unreadNotificationCount)
  const containerRef = useRef<HTMLDivElement>(null)

  const getInitialNotificationList = async () => {
    const res = await getNotifications({
      page_num: 1,
      records: unreadNotificationCount + INITIAL_EXTRA_RECORDS,
    })
    setNotificationList(res.posts)
    setIsLoading(false)
  }

  const updateNotificationList = async (amount: number) => {
    if (amount === 0) {
      return
    }
    // because may have new notifications while reading unread notifications amount(5s interval)
    const res = await getNotifications({
      page_num: 1,
      records: amount + NOTIFICATION_UPDATE_BUFFER,
    })
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
    getInitialNotificationList()
    getLatestReadNotificationId(currentUid).then((res) => {
      setLatestReadNotificationId(res.latest_id)
    })
  }, [])

  useEffect(() => {
    if (unreadNotificationCount) {
      updateNotificationList(unreadNotificationCount - prevUnreadCount.current)
      prevUnreadCount.current = unreadNotificationCount
    }
  }, [unreadNotificationCount])

  return (
    <>
      <div onClick={() => setVirtualRoutePage({ name: 'Notification', enterFrom: '/profile' })}>
        <NotificationIcon unreadCount={unreadNotificationCount} />
      </div>
      {virtualRoutePage?.name === 'Notification' && (
        <div
          className="fixed inset-0 z-[999] bg-white"
          style={{
            paddingTop: 'calc(var(--tg-safe-area-inset-top) + 16px)',
            paddingBottom: 'var(--tg-safe-area-inset-bottom)',
          }}
        >
          <div
            className="relative w-full h-full flex flex-col"
            style={{
              paddingTop: 'var(--tg-content-safe-area-inset-top)',
              paddingBottom: 'var(--tg-content-safe-area-inset-bottom)',
            }}
          >
            <h1 className="text-[#333] text-[20px] font-bold h-[41px] leading-[41px] mb-2 pl-6">
              Notification
            </h1>
            <div className="flex-1 overflow-auto scrollbar-hide" ref={containerRef}>
              {isLoading && containerRef.current ? <LoadingSpinner /> : <NotificationList />}
              <div className="h-[40px]" />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
export default Notification
