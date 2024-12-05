import { memo, type FC } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { cn } from '@/utils/utils'

interface NavItem {
  icon: string
  iconActive: string
  name: string
  url: string
}

const Menu: FC = () => {
  const navigate = useNavigate()
  const pathname = useLocation().pathname

  const navList: NavItem[] = [
    {
      // icon: HomeIcon,
      icon: 'icon-Tab_home_normal',
      // iconActive: HomeActiveIcon,
      iconActive: 'icon-Tab_home',
      name: 'HOME',
      url: '/home',
    },
    {
      // icon: ChatIcon,
      // iconActive: ChatActiveIcon,
      icon: 'icon-chat-smile-2-line',
      iconActive: 'icon-chat-smile-2-fill',
      name: 'CHATS',
      url: '/chat',
    },
    {
      // icon: ProfileIcon,
      // iconActive: ProfileActiveIcon,
      icon: 'icon-Tab_profile_normal',
      iconActive: 'icon-tab_profile_choose',
      name: 'PROFILE',
      url: '/profile',
    },
  ]
  return (
    <div className="fixed bottom-0 left-0 w-full p-0 h-[84px] pt-2 border-t bg-white dark:bg-[#0D0D0D] border-[#DEDEDE] dar:border-[#212121]">
      <div className="flex justify-around items-center">
        {navList.map((item, index) => (
          <div
            className="flex flex-col items-center w-[65px] h-[51px] no-tap"
            onClick={() => {
              navigate(item.url)
            }}
            key={index}
          >
            <div className="text-center pt-[6px] cursor-pointer">
              <div className="relative h-[24px] w-[24px] m-auto overflow-hidden">
                <div
                  className="flex items-center absolute top-0 left-0 w-full h-full transition-opacity duration-200 text-[#0F1233] dark:text-[#E0E2F6]"
                  style={{ opacity: pathname === item.url ? 1 : 0 }}
                >
                  <i className={cn('iconfont text-[24px]', item.iconActive)}></i>
                </div>
                <div
                  className="flex items-center absolute top-0 left-0 w-full h-full transition-opacity duration-200 text-[#424048] dark:text-[#E0E2F6]"
                  style={{ opacity: pathname === item.url ? 0 : 1 }}
                >
                  <i className={cn('iconfont text-[24px]', item.icon)}></i>
                </div>
              </div>
              <div
                className="text-[10px] leading-[12px] mt-[4px] uppercase"
                style={{ color: pathname === item.url ? '#0F1233' : '#888888' }}
              >
                {item.name}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default memo(Menu)
