import { FC } from 'react'
import { Heading, HStack, Box, Text } from '@chakra-ui/react'
import Image from '../Image/Image'
import { useStore } from '../../store'
import FollowButton from './FollowButton'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { useNavigate } from 'react-router-dom'

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
        {
          <Image
            rect
            width={64}
            height={64}
            className="rounded-full"
            src={userInfo.avatar}
            alt={userInfo.username}
          />
        }
        <FollowButton
          fansid={currentUid}
          tgid={userInfo.uid}
          avatar={userInfo.avatar}
          username={userInfo.username}
        />
      </HStack>
      <Heading as="h3" color="#E0E2F6" fontWeight="500" className="mt-4">
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
      <Box pt="16px" pb="24px" borderBottom="1px solid #212121">
        <Text color="#62636F" fontSize="14px" lineHeight="16px" mb="4px">
          {userInfo.bio}
        </Text>
        {/* <Link color="#4452FF" fontSize="14px">
          More
        </Link> */}
      </Box>
    </Box>
  )
}
export default OtherUserProfile
