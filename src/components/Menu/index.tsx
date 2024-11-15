import type { FC } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import {
  HomeIcon,
  ProfileIcon,
  ProfileActiveIcon,
  HomeActiveIcon,
  ChatIcon,
  ChatActiveIcon,
} from '@/assets/icons'
import Image from '../Image/Image'

interface NavItem {
  icon: string
  iconActive: string
  name: string
  url: string
}

export const Menu: FC = () => {
  const navigate = useNavigate()
  const pathname = useLocation().pathname

  const navList: NavItem[] = [
    {
      icon: HomeIcon,
      iconActive: HomeActiveIcon,
      name: 'Home',
      url: '/home',
    },
    {
      icon: ChatIcon,
      iconActive: ChatActiveIcon,
      name: 'Chat',
      url: '/chat',
    },
    {
      icon: ProfileIcon,
      iconActive: ProfileActiveIcon,
      name: 'Profile',
      url: '/profile',
    },
  ]
  return (
    <div className="fixed bottom-0 left-0 w-full p-0 h-[84px] pt-2 border-t border-[#212121] bg-[#0D0D0D]">
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
                  className="absolute top-0 left-0 w-full h-full transition-opacity duration-200"
                  style={{ opacity: pathname === item.url ? 1 : 0 }}
                >
                  <Image className="m-auto" src={item.iconActive} alt={item.name} />
                </div>
                <div
                  className="absolute top-0 left-0 w-full h-full transition-opacity duration-200"
                  style={{ opacity: pathname === item.url ? 0 : 1 }}
                >
                  <Image className="m-auto" src={item.icon} alt={item.name} />
                </div>
              </div>
              <div className="text-[#424048] text-[10px] leading-[12px] mt-[4px] uppercase">
                {item.name}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
