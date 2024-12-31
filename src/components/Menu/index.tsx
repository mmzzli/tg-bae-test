import { memo, useCallback, type FC } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import MenuItem from './MenuItem'
import ChatMenuItem from './ChatMenuItem'

interface NavItem {
  icon: string
  iconActive: string
  name: string
  url: string
  component?: React.ComponentType<any>
}

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
    component: ChatMenuItem,
  },
  {
    icon: 'icon-Tab_profile_normal',
    iconActive: 'icon-tab_profile_choose',
    name: 'PROFILE',
    url: '/profile',
  },
]

const Menu: FC = () => {
  const navigate = useNavigate()
  const pathname = useLocation().pathname

  console.log('menu render')
  return (
    <div className="fixed bottom-0 left-0 w-full p-0 h-[84px] pt-3 border-t bg-white dark:bg-[#0D0D0D] border-[#DEDEDE] dar:border-[#212121] z-[9]">
      <div className="flex justify-around items-center">
        {navList.map((item, index) => {
          const ItemComponent = item.component || MenuItem
          return (
            <ItemComponent
              key={index}
              {...item}
              isActive={pathname === item.url}
              onClick={navigate}
            />
          )
        })}
      </div>
    </div>
  )
}

export default memo(Menu)
