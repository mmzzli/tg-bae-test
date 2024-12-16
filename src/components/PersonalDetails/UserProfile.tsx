import { FC } from 'react'
import { Heading, HStack, Box, Text, Link } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import Image from '../Image/Image'
import EarningsPage from '@/components/PersonalDetails/Earnings'
import ShareUser from './ShareUser'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { profileImg } from '@/assets/image'
import More from './More'
import ProfileSkeleton from '../Skeketon/ProfileSkeleton'
import Notification from './Notification/Notification'
const UserProfile: FC = () => {
  const { launchParams } = useTMAUtils()
  const userId = launchParams.initData?.user?.id ?? 0
  const userInfo = useStore((state) => state.userInfo)
  const navigate = useNavigate()
  return !userInfo.avatar ? (
    <ProfileSkeleton />
  ) : (
    <Box
      padding="0 16px"
      className="no-tap"
      style={{
        paddingTop: `calc(${
          window
            .getComputedStyle(document.documentElement)
            .getPropertyValue('--tg-safe-area-inset-top') &&
          parseInt(
            window
              .getComputedStyle(document.documentElement)
              .getPropertyValue('--tg-safe-area-inset-top'),
            10
          ) !== 0
            ? '8px'
            : '46px'
        })`,
      }}
    >
      <HStack paddingLeft="0" justifyContent="space-between">
        <div className="w-[64px] h-[64px] overflow-hidden rounded-[50%]">
          <Image
            rect
            type="avatar"
            width={64}
            height={64}
            className="rounded-full"
            src={userInfo.avatar || profileImg}
            alt={userInfo.username}
          />
        </div>
        <Box display="flex" alignItems="center">
          <EarningsPage />
          <Notification />
          <ShareUser userInfo={userInfo} />
        </Box>
      </HStack>

      <HStack marginTop="10px" gap="4px">
        <Heading as="h3" color="#0F1233" fontWeight="500" fontSize="20px">
          {userInfo.username}
        </Heading>
        <Link onClick={() => navigate('/profile/edit')}>
          <i className="iconfont icon-a-edit-line1 text-[#7a7a7a]" style={{ fontSize: '18px' }}></i>
        </Link>
      </HStack>

      <More bio={userInfo.bio} />

      <HStack p="24px 0" gap="56px">
        <Box textAlign="center">
          <Heading
            fontSize="20px"
            color="#0F1233"
            lineHeight="24px"
            cursor="pointer"
            onClick={() => navigate(`/follow/${userId}?type=follower`)}
          >
            {userInfo.follower}
          </Heading>
          <Text color="#8A8C91" fontSize="12px" lineHeight="14px">
            Followers
          </Text>
        </Box>
        <Box textAlign="center">
          <Heading
            fontSize="20px"
            color="#0F1233"
            lineHeight="24px"
            cursor="pointer"
            onClick={() => navigate(`/follow/${userId}?type=following`)}
          >
            {userInfo.fans}
          </Heading>
          <Text color="#8A8C91" fontSize="12px" lineHeight="14px">
            Following
          </Text>
        </Box>
      </HStack>
    </Box>
  )
}

export default UserProfile
