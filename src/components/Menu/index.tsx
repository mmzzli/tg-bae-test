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
      icon: 'icon-Tab_home_normal',
      iconActive: 'icon-Tab_home',
      name: 'HOME',
      url: '/home',
    },
    {
      icon: 'icon-earn',
      iconActive: 'icon-database-2-fill',
      name: 'TASKS',
      url: '/task',
    },
    {
      icon: 'icon-add',
      iconActive: 'icon-add',
      name: 'POST',
      url: '/post',
    },
    {
      icon: 'icon-chat-smile-2-line',
      iconActive: 'icon-chat-smile-2-fill',
      name: 'CHATS',
      url: '/chat',
    },
    {
      icon: 'icon-Tab_profile_normal',
      iconActive: 'icon-tab_profile_choose',
      name: 'PROFILE',
      url: '/profile',
    },
  ]
  console.log('menu render')
  return (
    <div className="fixed bottom-0 left-0 w-full p-0 h-[84px] pt-3 border-t bg-white dark:bg-[#0D0D0D] border-[#DEDEDE] dar:border-[#212121]">
      <div className="flex justify-around items-center">
        {navList.map((item, index) => (
          <div
            className="flex flex-col items-center w-[65px] no-tap"
            onClick={() => {
              navigate(item.url)
            }}
            key={index}
          >
            <div
              className={cn(
                item.name === 'POST' &&
                  'w-[32px] h-[32px] flex items-center justify-center bg-[#6254FF] rounded-[6px]'
              )}
            >
              <i
                className={cn(
                  'iconfont text-[26px]',
                  pathname === item.url ? item.iconActive : item.icon,
                  item.name === 'POST' && 'text-[#fff] text-[18px]'
                )}
              ></i>
            </div>
            {/* <div className="text-center pt-[6px] cursor-pointer">
              <div className={cn(
                "relative h-[24px] w-[24px] m-auto overflow-hidden",
                item.name === "POST" && 'h-[32px] w-[32px] bg-[#6254FF] rounded-[6px]'
              )}>
                <div
                  className="flex items-center absolute top-0 left-0 w-full h-full transition-opacity duration-200 text-[#0F1233] dark:text-[#E0E2F6]"
                  style={{ opacity: pathname === item.url ? 1 : 0 }}
                >
                  <i className={cn('iconfont text-[24px]', item.iconActive)}></i>
                </div>
                <div
                  className={cn(
                    "flex items-center absolute top-0 left-0 w-full h-full transition-opacity duration-200 text-[#424048] dark:text-[#E0E2F6]",
                    item.name === "POST" && "left-[7px] text-[#fff]"
                  )}
                  style={{ opacity: pathname === item.url ? 0 : 1 }}
                >
                  <i className={cn('iconfont text-[24px]', item.icon, item.name === "POST" && 'text-[18px]')}></i>
                </div>
              </div>
            </div> */}
          </div>
        ))}
      </div>
    </div>
  )
}

export default memo(Menu)
