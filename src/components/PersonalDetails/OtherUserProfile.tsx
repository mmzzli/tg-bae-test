import { FC } from 'react'
import { Heading, HStack, Image, Box, Text } from '@chakra-ui/react'

import BaseButton from '../BaseButton/BaseButton'
import { useStore } from '../../store'

const OtherUserProfile: FC = () => {
  const { userInfo } = useStore((state) => ({
    userInfo: state.othersUserInfo,
  }))

  const follow = async () => {
    // TODO: Implement follow functionality
  }

  return (
    <Box p="0px 16px" pt="30px">
      <HStack gap="16px" pl="8px" justifyContent="space-between">
        {userInfo.avatar && <Image w="64px" h="64px" borderRadius="50%" src={userInfo.avatar} />}
        <BaseButton
          text="Follow"
          width="104px"
          handler={() => {
            follow()
          }}
        />
      </HStack>
      <Heading as="h3" color="#E0E2F6" fontWeight="500" className="mt-4">
        {userInfo.username}
      </Heading>
      <HStack pt="24px" gap="56px">
        <Box>
          <Heading fontSize="20px" color="#E0E2F6" lineHeight="24px">
            {userInfo.followers}
          </Heading>
          <Text color="#8A8C91" fontSize="12px" lineHeight="14px">
            followers
          </Text>
        </Box>
        <Box>
          <Heading fontSize="20px" color="#E0E2F6" lineHeight="24px">
            {userInfo.following}
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
