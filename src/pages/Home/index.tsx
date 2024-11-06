import { useEffect, type FC } from 'react'
import { HStack, Heading, Image } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { Menu } from '@/components/Menu'
import { AddIcon1 } from '@/assets/icons'
import { COMMUNITY_LINK } from '@/utils/constants'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { retrieveLaunchParams } from '@tma.js/sdk'
import { useStore } from '@/store'
import RecommendList from '@/components/RecommendList/RecommendList'
import BaseButton from '@/components/BaseButton/BaseButton'
import { getSingleMedia } from '@/api/list'

const SHARE_POST = 1
const SHARE_PROFILE = 2
export const HomePage: FC = () => {
  const navigate = useNavigate()
  const { shareLink, isInTMA } = useTMAUtils()
  const token = useStore((state) => state.token)
  const { startParam } = retrieveLaunchParams()
  const { setSharedPostList, setOthersUserInfo } = useStore((state) => ({
    setSharedPostList: state.setSharedPostList,
    setOthersUserInfo: state.setOthersUserInfo,
  }))

  const handleNavigate = async (ref: string) => {
    if (!token) {
      console.log('waiting for token...')
      setTimeout(() => {
        handleNavigate(ref)
      }, 100)
      return
    }
    console.log('token ready, navigating...')
    // Get Ref Data
    try {
      const data = await getSingleMedia(ref)
      console.log('getSingleMedia', data)
      if (data.type === SHARE_POST) {
        setSharedPostList(data.media)
        navigate(`/shares?ref=${ref}`)
      } else if (data.type === SHARE_PROFILE) {
        setOthersUserInfo(data.userInfo)
        navigate(`/profile/${data.userInfo.uid}`)
      }
    } catch (error) {
      console.warn('API ERROR', error)
    }
  }

  useEffect(() => {
    if (!isInTMA || !startParam || history.length > 2) return
    const params = startParam.split('_')
    console.log('startParam', params)

    params.forEach((p) => {
      const pairs = p.split('=')
      if (pairs[0] === 'ref' && pairs[1]) {
        handleNavigate(pairs[1])
      }
    })
  }, [startParam, isInTMA])
  return (
    <>
      <HStack justifyContent="space-between" p="0px 16px" pt="16px">
        <Heading as="h3" fontSize="20px" color="#E0E2F6">
          Following
        </Heading>
        <BaseButton
          text="Create"
          icon={<Image src={AddIcon1} />}
          width="104px"
          height="9"
          handler={() => navigate('/post')}
        />
        {/* <Button
          size="xl"
          fontSize="14px"
          variant="primary-dark"
          p="9px 12px"
          onClick={() => {
            navigate('/post')
          }}
        >
          <Image src={AddIcon} mr="5px" /> Create
        </Button> */}
      </HStack>
      <div className="mt-[40px] mx-auto w-full text-center">
        <p className="text-[#E0E2F6]">Join our community to meet creators</p>
        <p className="text-[#E0E2F6]">and start to follow them</p>
      </div>
      <button
        onClick={() => shareLink(COMMUNITY_LINK)}
        className="text-[14px] py-[14px] px-6 w-[126px] h-[40px] bg-[#4A3AFF] rounded-[32px] flex items-center justify-center font-medium text-[#fff] mx-auto mt-[28px] mb-12"
      >
        Community
      </button>
      <div className="px-4">
        <h3 className="text-[#E0E2F6] font-bold text-xl">Selected Posts</h3>
      </div>
      <RecommendList />
      <Menu selectedIndex={0} />
    </>
  )
}
