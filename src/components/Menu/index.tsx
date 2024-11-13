import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'

import { Box, HStack, Text, Link } from '@chakra-ui/react'

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

interface MenuProps {
  selectedIndex: number
}

export const Menu: FC<MenuProps> = ({ selectedIndex }) => {
  const navigate = useNavigate()
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
    <Box
      position="fixed"
      bottom="0px"
      width=" 100%"
      p="0px 34px"
      pt="8px"
      borderTop="1px solid #212121"
      bg="#0D0D0D"
      pb="28px"
      zIndex={1}
    >
      <HStack justifyContent="space-around">
        {navList.map((item, index) => (
          <Link onClick={() => {location.href = `${item.url}`}} key={index}>
            <Box textAlign="center" pt="6px" cursor="pointer">
              <Box h="24px" w="24px" m="auto">
                <Image
                  className="m-auto"
                  src={selectedIndex === index ? item.iconActive : item.icon}
                  alt={item.name}
                />
              </Box>
              <Text
                color={selectedIndex === index ? '#E0E2F6' : '#424048'}
                fontSize="10px"
                lineHeight="12px"
                mt="4px"
                textTransform="uppercase"
              >
                {item.name}
              </Text>
            </Box>
          </Link>
        ))}
      </HStack>
    </Box>
  )
}
