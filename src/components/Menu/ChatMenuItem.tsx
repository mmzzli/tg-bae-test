import { memo, type FC } from 'react'
import { cn } from '@/utils/utils'
import { useStore } from '@/store/store'

interface MenuItemProps {
  icon: string
  iconActive: string
  name: string
  url: string
  isActive: boolean
  onClick: (url: string) => void
}

const UnreadCount = ({ unreadCount, className }: { unreadCount: number; className: string }) => (
  <div
    className={cn(
      'absolute -top-1 left-1/2 flex items-center justify-center px-[6px] min-w-[20px] h-[20px] pb-[1px] bg-[#6761FF] rounded-full text-white text-[10px] font-bold',
      className
    )}
    style={{ opacity: unreadCount > 0 ? 1 : 0 }}
  >
    {unreadCount > 99 ? '99+' : unreadCount}
  </div>
)

const ChatMenuItem: FC<MenuItemProps> = memo(
  ({ icon, iconActive, name, url, isActive, onClick }) => {
    const conversationUnreadCount = useStore((state) => state.conversationUnreadCount)
    return (
      <div className="flex flex-col items-center w-[65px] no-tap" onClick={() => onClick(url)}>
        <div className="relative 1">
          <i
            className={cn(
              'iconfont text-[26px]',
              isActive ? iconActive : icon,
              name === 'POST' && 'text-[#fff] text-[18px]'
            )}
          ></i>
          <UnreadCount unreadCount={conversationUnreadCount} className="top-0" />
        </div>
      </div>
    )
  }
)

export default ChatMenuItem
