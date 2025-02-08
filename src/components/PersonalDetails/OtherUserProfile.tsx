import { FC, useState, useRef } from 'react'
import { useSafeState } from 'ahooks'
import { Heading, HStack, Box, Text, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react'
import Image from '../Image/Image'
import { ReportIcon, ShareIcon } from '@/assets/icons/profile'
import { useStore } from '../../store'
import FollowButton from './FollowButton'
import { useNavigate } from 'react-router-dom'
import { profileImg } from '@/assets/image'
import Report from '@/components/SecondaryMenu/Report'
import More from './More'
import ShareModal from '@/components/PersonalDetails/ShareModal'
import MoreText from '@/components/More/MoreText'
interface ChildMethods {
  someMethod: (username: string, uid: number) => void
}
interface NavItem {
  name: string
  url: string
  id: string
}

const OtherUserProfile: FC = () => {
  const [reportVisible, setReportVisible] = useSafeState(false)
  const { userInfo } = useStore((state) => ({
    userInfo: state.othersUserInfo,
  }))
  const navigate = useNavigate()
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
    <Box p="0px 16px" mt="-26px" className="no-tap">
      <HStack gap="16px" pl="8px" justifyContent="space-between">
        <div className="w-[82px] h-[82px] overflow-hidden rounded-[50%] bg-white flex items-center justify-center">
          <Image
            rect
            type="avatar"
            width={72}
            height={72}
            className="rounded-full"
            src={userInfo.avatar || profileImg}
            alt={userInfo.username}
          />
        </div>

        {/*
        <Image
          rect
          type="avatar"
          width={64}
          height={64}
          className="rounded-full"
          src={userInfo.avatar || profileImg}
          alt={userInfo.username}
        /> */}
        <div className="mt-[32px] flex items-center gap-4">
          <FollowButton tgid={userInfo.uid} avatar={userInfo.avatar} username={userInfo.username} />
          <div
            className="flex items-center justify-center cursor-pointer rounded-full w-9 h-9 bg-[#F8F8F8]"
            onClick={() => navigate(`/chat/${userInfo.uid}`)}
          >
            <i className="iconfont icon-Frame-1 text-[24px] text-[##0F1233]"></i>
          </div>
          <Menu>
            <MenuButton>
              <div className="w-[36px] h-[36px] bg-[#F8F8F8] rounded-[30px] flex items-center justify-center">
                <i className="iconfont icon-icon_more text-[26px] text-[#0F1233]"></i>
              </div>
            </MenuButton>
            <MenuList
              minW="84px"
              bg="#fff"
              border="none"
              borderRadius="8px"
              p="12px"
              boxShadow="rgba(0, 0, 0, 0.1) 0px 2px 16px 0px"
            >
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
                      <span className="text-xs text-[#333333]">{item.name}</span>
                    </HStack>
                  </MenuItem>
                  {navList.length - 1 > key && <Text h="1px" bg="#EBEBF4" m="16px 0"></Text>}
                </Box>
              ))}
            </MenuList>
          </Menu>
        </div>
      </HStack>
      <Heading as="h3" color="#0F1233" fontWeight="500" className="mt-4" fontSize="20px">
        {userInfo.username}
      </Heading>
      <MoreText text={userInfo.bio} className={'leading-4'}></MoreText>
      <HStack p="24px 0" gap="56px">
        <Box textAlign="center">
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
        <Box textAlign="center">
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
      <div className="absolute bottom-0 left-4 right-4 border-b border-bottom-[#ccc]"></div>
    </Box>
  )
}
export default OtherUserProfile
