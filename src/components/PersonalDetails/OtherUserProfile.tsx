import { FC } from 'react'
import { Heading, HStack, Box, Text } from '@chakra-ui/react'
import Image from '../Image/Image'
import { MessageIcon } from '@/assets/icons'
import { useStore } from '../../store'
import FollowButton from './FollowButton'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { useNavigate } from 'react-router-dom'
import { profileImg } from '@/assets/image'
import More from './More'

const OtherUserProfile: FC = () => {
  const { userInfo } = useStore((state) => ({
    userInfo: state.othersUserInfo,
  }))
  const { launchParams } = useTMAUtils()
  const currentUid = launchParams.initData?.user?.id ?? 0

  const navigate = useNavigate()
  return (
    <Box p="0px 16px" pt="30px">
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
            className="flex items-center justify-center cursor-pointer rounded-full w-9 h-9 bg-[#CFCBFF20]"
            onClick={() => navigate(`/chat/${userInfo.uid}`)}
          >
            <Image src={MessageIcon} />
          </div>
        </div>
      </HStack>
      <Heading as="h3" color="#E0E2F6" fontWeight="500" className="mt-4" fontSize="20px">
        {userInfo.username}
      </Heading>
      <HStack pt="24px" gap="56px">
        <Box>
          <Heading
            fontSize="20px"
            color="#E0E2F6"
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
            color="#E0E2F6"
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
      <More bio={userInfo.bio} />
    </Box>
  )
}
export default OtherUserProfile
