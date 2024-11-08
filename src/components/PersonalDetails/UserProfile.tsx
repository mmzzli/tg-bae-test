import { FC } from 'react'
import { Heading, HStack, Box, Text, Link } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import Image from '../Image/Image'
import EarningsPage from '@/components/PersonalDetails/Earnings'
import ShareUser from './ShareUser'
import { EditIcon } from '@/assets/icons'
import { useTMAUtils } from '@/hooks/useTMAUtils'

import { profileImg } from '@/assets/image'

const UserProfile: FC = () => {
  const { launchParams } = useTMAUtils()
  const uid = launchParams.initData?.user?.id ?? 0
  const userInfo = useStore((state) => state.userInfo)
  const navigate = useNavigate()

  console.log('userInfo', userInfo)

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
        <div className="flex items-center">
          <EarningsPage />
          <ShareUser userInfo={userInfo} />
        </div>
      </HStack>
      <HStack className="mt-4">
        <Heading as="h3" color="#E0E2F6" fontWeight="500">
          {userInfo.username}
        </Heading>
        <Link onClick={() => navigate('/profile/edit')}>
          <Image src={EditIcon} />
        </Link>
      </HStack>
      <HStack pt="24px" gap="56px">
        <Box>
          <Heading
            fontSize="20px"
            color="#E0E2F6"
            lineHeight="24px"
            onClick={() => navigate(`/follow/${uid}?type=follower`)}
          >
            {userInfo.follower}
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
            onClick={() => navigate(`/follow/${uid}?type=following`)}
          >
            {userInfo.fans}
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
export default UserProfile
