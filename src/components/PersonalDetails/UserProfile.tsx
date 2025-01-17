import { FC, useEffect, useState } from 'react'
import { Heading, HStack, Box, Text, Link } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import Image from '../Image/Image'
import EarningsPage from '@/components/PersonalDetails/Earnings'
import ShareUser from './ShareUser'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { profileImg } from '@/assets/image'
import ProfileSkeleton from '../Skeketon/ProfileSkeleton'
import Notification from './Notification/Notification'
import MoreText from '@/components/More/MoreText'
import ProfileConnectButton from '../Wallet/ProfileConnectButton'
import { getTotalGifts, totalAvailableInvoice } from '@/api'
import { formatUSD } from '@/utils/utils'

// import ConnectButton from '../Wallet/ConnectButton'

const UserProfile: FC = () => {
  const { launchParams } = useTMAUtils()
  const userId = launchParams.initData?.user?.id ?? 0
  const userInfo = useStore((state) => state.userInfo)
  const needUpdateEarnings = useStore((state) => state.needUpdateEarnings)
  const [gifts, setGifts] = useState<number | string>('')

  const { token } = useStore((state) => ({
    token: state.token,
  }))

  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        const [giftsResponse, invoiceResponse] = await Promise.all([
          getTotalGifts(),
          totalAvailableInvoice()
        ])

        const { gifts } = giftsResponse
        const { exchange_rate, total } = invoiceResponse
        setGifts(total * exchange_rate + gifts)
      } catch (error) {
        console.error('Failed to load gifts and invoice:', error)
        setGifts(0) // 设置一个默认值以防加载失败
      }
    }

    if (token && needUpdateEarnings) {
      load()
    }
  }, [token, needUpdateEarnings])

  return !userInfo.avatar ? (
    <ProfileSkeleton />
  ) : (
    <Box
      padding="0 16px"
      className="no-tap"
      mt="-26px"
    >
      <HStack paddingLeft="0" justifyContent="space-between" >
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
        <Box className='mt-[32px]' display="flex" alignItems="center">
          {/* <EarningsPage /> */}
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

      <MoreText text={userInfo.bio} className={'leading-4'}></MoreText>

      <HStack p="24px 0" gap="56px" className="justify-between">
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
        <Box textAlign="center">
          <Heading
            fontSize="20px"
            color="#0F1233"
            lineHeight="24px"
            cursor="pointer"
            onClick={() => navigate(`/profile/earnings`)}
          >
            {formatUSD(gifts, true)}
          </Heading>
          <Text color="#8A8C91" fontSize="12px" lineHeight="14px">
            Earnings
          </Text>
        </Box>
      </HStack>
      <div>
        <ProfileConnectButton />
      </div>
    </Box>
  )
}

export default UserProfile
