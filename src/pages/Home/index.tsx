import { type FC, useMemo, useRef, useState } from 'react'
import { Heading, HStack } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import RecommendList from '@/components/RecommendList/RecommendList'
import FollowingList from '@/components/RecommendList/FollowingList'

import { useStore } from '@/store'
import { CardRecommendProvider } from '@/utils/constants'
import NewPostButton from '@/components/NewPost/NewPostButton'

const HomePage: FC = () => {
  const navigate = useNavigate()
  const { shareLink } = useTMAUtils()
  const selectedPostsRef = useRef<HTMLDivElement>(null)
  const getCacheVideo = useStore((state) => state.cacheVideo)
  const [title, setTitle] = useState('Following')
  const [fadeClass, setFadeClass] = useState('fade-in')
  const userInfo = useStore((state) => state.userInfo)

  const [videoOpen, setVideoOpen] = useState(false)

  const styles = {
    fadeIn: {
      opacity: 1,
      transition: 'opacity 0.3s ease-in',
    },
    fadeOut: {
      opacity: 0,
      transition: 'opacity 0.3s ease-out',
    },
  }
  const { token } = useStore((state) => ({
    token: state.token,
  }))

  const animation = useMemo(() => {
    if (userInfo.user_id !== -1 && userInfo.fans === 0) {
      return {
        animation: `slide 600ms forwards 300ms`,
      }
    }
    return {}
  }, [userInfo.user_id, userInfo.fans])

  return (
    <div
      className="relative w-full h-full overflow-auto scrollbar-hide"
      id="recommendScrollableDiv"
    >
      <>
        <HStack
          justifyContent="space-between"
          p="10px 16px"
          position="fixed"
          w="100%"
          zIndex="111"
          className="bg-white dark:bg-black"
        >
          <Heading
            as="h3"
            fontSize="20px"
            style={fadeClass === 'fade-in' ? styles.fadeIn : styles.fadeOut}
            className="text-black dark:text-[#E0E2F6]"
          >
            {title}
          </Heading>

          <NewPostButton />
        </HStack>
        <div className="overflow-hidden" style={{ height: '0px', opacity: 0, ...animation }}>
          <FollowingList />
        </div>
        <CardRecommendProvider.Provider value={{ recommend: true, setVideoOpen }}>
          <div
            className={`${userInfo.user_id !== -1 && userInfo.fans === 0 ? '' : 'mt-10'}  relative ${videoOpen ? 'z-[112]' : ''}`}
          >
            <RecommendList />
          </div>
        </CardRecommendProvider.Provider>
      </>
    </div>
  )
}
export default HomePage
