import { FC, useState, useRef } from 'react'
import { useSafeState } from 'ahooks'
import {
  Heading,
  HStack,
  Box,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider,
} from '@chakra-ui/react'
import Image from '../Image/Image'
import { MessageIcon, NavIcon } from '@/assets/icons'
import { BlockIcon, ReportIcon, ShareIcon } from '@/assets/icons/profile'
import { useStore } from '../../store'
import FollowButton from './FollowButton'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { useNavigate } from 'react-router-dom'
import { profileImg } from '@/assets/image'
import Report from '@/components/SecondaryMenu/Report'
import More from './More'
import ShareModal from '@/components/PersonalDetails/ShareModal'
interface ChildMethods {
  someMethod: (username: string, uid: number) => void
}
interface NavItem {
  name: string
  url: string
  id: string
}

const OtherUserProfile: FC = () => {
  const { userInfo } = useStore((state) => ({
    userInfo: state.othersUserInfo,
  }))
  const { launchParams } = useTMAUtils()
  const currentUid = launchParams.initData?.user?.id ?? 0

  const navigate = useNavigate()
  const [reportVisible, setReportVisible] = useSafeState(false)
  const [navList, setNavList] = useState<NavItem[]>([
    { name: 'Share', url: ShareIcon, id: 'share' },
    { name: 'Report', url: ReportIcon, id: 'report' },
    // { name: "Block", url: BlockIcon, id: "block" }
  ])
  const navEve = (id: string) => {
    if (id === 'report') {
      setReportVisible(true)
    }
    if (id === 'share') {
      childRef.current?.someMethod(userInfo.username, userInfo.uid)
    }
  }
  const childRef = useRef<ChildMethods>(null)
  return (
    <Box
      p="0px 16px"
      style={{
        paddingTop: `calc(${window.getComputedStyle(document.documentElement).getPropertyValue('--tg-safe-area-inset-top') ? '8px' : '24px'})`,
      }}
    >
      <HStack gap="16px" pl="8px" justifyContent="space-between">
        <Image
          rect
          width={64}
          height={64}
          className="rounded-full"
          src={userInfo.avatar || profileImg}
          alt={userInfo.username}
        />
        <div className="flex items-center gap-4">
          <FollowButton
            fansid={currentUid}
            tgid={userInfo.uid}
            avatar={userInfo.avatar}
            username={userInfo.username}
          />
          <div
            className="flex items-center justify-center cursor-pointer rounded-full w-9 h-9 bg-[#F8F8F8]"
            onClick={() => navigate(`/chat/${userInfo.uid}`)}
          >
            <Image src={MessageIcon} />
          </div>
          <Menu>
            <MenuButton>
              <div className="p-[6px] bg-[#F8F8F8] rounded-[30px]">
                <Image src={NavIcon} />
              </div>
            </MenuButton>
            <MenuList minW="84px" bg="#fff" border="1px solid #EBEBF4" borderRadius="4px" p="12px">
              {navList.map((item, key) => (
                <Box>
                  <MenuItem
                    key={key}
                    bg="#fff"
                    color="#333"
                    fontSize="12px"
                    p="0"
                    onClick={() => navEve(item.id)}
                  >
                    <HStack gap="4px">
                      <Image src={item.url} />
                      <Text>{item.name}</Text>
                    </HStack>
                  </MenuItem>
                  {navList.length - 1 > key && (
                    <Text h="1px" bg="#EBEBF4" m="16px 0"></Text>
                  )}
                </Box>
              ))}
            </MenuList>
          </Menu>
        </div>
      </HStack>
      <Heading as="h3" color="#0F1233" fontWeight="500" className="mt-4" fontSize="20px">
        {userInfo.username}
      </Heading>
      <More bio={userInfo.bio} />
      <HStack p="24px 0" gap="56px">
        <Box>
          <Heading
            fontSize="20px"
            color="#0F1233"
            lineHeight="24px"
            onClick={() => navigate(`/follow/${userInfo.uid}?type=follower`)}
          >
            {userInfo.follower || 0}
          </Heading>
          <Text color="#8A8C91" fontSize="12px" lineHeight="14px">
            followers
          </Text>
        </Box>
        <Box>
          <Heading
            fontSize="20px"
            color="#0F1233"
            lineHeight="24px"
            onClick={() => navigate(`/follow/${userInfo.uid}?type=following`)}
          >
            {userInfo.fans || 0}
          </Heading>
          <Text color="#8A8C91" fontSize="12px" lineHeight="14px">
            following
          </Text>
        </Box>
      </HStack>
      <Report isOpen={reportVisible} onClose={setReportVisible} />
      <ShareModal ref={childRef} />
    </Box>
  )
}
export default OtherUserProfile
