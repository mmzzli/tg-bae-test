import { memo, type FC } from 'react'
import { cn } from '@/utils/utils'

interface MenuItemProps {
  icon: string
  iconActive: string
  name: string
  url: string
  isActive: boolean
  onClick: (url: string) => void
}

const MenuItem: FC<MenuItemProps> = memo(({ icon, iconActive, name, url, isActive, onClick }) => {
  return (
    <div className="flex flex-col items-center w-[65px] no-tap" onClick={() => onClick(url)}>
      <div
        className={cn(
          name === 'POST' &&
            'w-[32px] h-[32px] flex items-center justify-center bg-[#6254FF] rounded-[6px]'
        )}
      >
        <i
          className={cn(
            'iconfont text-[26px]',
            isActive ? iconActive : icon,
            name === 'POST' && 'text-[#fff] text-[18px]'
          )}
        ></i>
      </div>
    </div>
  )
})

export default MenuItem
