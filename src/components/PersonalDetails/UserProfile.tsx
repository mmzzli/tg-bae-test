import { FC, useState } from 'react';
import { Heading, HStack, Box, Text, Link } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import Image from '../Image/Image';
import EarningsPage from '@/components/PersonalDetails/Earnings';
import ShareUser from './ShareUser';
import { EditIcon } from '@/assets/icons';
import { useTMAUtils } from '@/hooks/useTMAUtils';
import { profileImg } from '@/assets/image';

const UserProfile: FC = () => {
  const { launchParams } = useTMAUtils();
  const userId = launchParams.initData?.user?.id ?? 0;
  const userInfo = useStore((state) => state.userInfo);
  const navigate = useNavigate();
  const [isBioExpanded, setIsBioExpanded] = useState(false);

  const toggleBioExpand = () => setIsBioExpanded((prev) => !prev);

  return (
    <Box padding="0 16px" paddingTop="30px">
      <HStack gap="16px" paddingLeft="8px" justifyContent="space-between">
        <Image
          rect
          width={64}
          height={64}
          className="rounded-full"
          src={userInfo.avatar || profileImg}
          alt={userInfo.username}
        />
        <Box display="flex" alignItems="center">
          <EarningsPage />
          <ShareUser userInfo={userInfo} />
        </Box>
      </HStack>

      <HStack marginTop="4">
        <Heading as="h3" color="#E0E2F6" fontWeight="500" fontSize="20px">
          {userInfo.username}
        </Heading>
        <Link onClick={() => navigate('/profile/edit')}>
          <Image src={EditIcon} alt="Edit Profile" />
        </Link>
      </HStack>

      <HStack paddingTop="24px" gap="56px">
        <Box textAlign="center">
          <Heading
            fontSize="20px"
            color="#E0E2F6"
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
            color="#E0E2F6"
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

      <Box paddingTop="16px" paddingBottom="24px" borderBottom="1px solid #212121">
        <Text color="#62636F" fontSize="14px" lineHeight="16px" marginBottom="4px">
          {isBioExpanded ? userInfo.bio : `${userInfo.bio.slice(0, 100)}...`}
        </Text>
        <Link color="#4452FF" fontSize="14px" onClick={toggleBioExpand}>
          {isBioExpanded ? 'Less' : 'More'}
        </Link>
      </Box>
    </Box>
  );
};

export default UserProfile;
