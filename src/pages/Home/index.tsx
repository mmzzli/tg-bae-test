import { useEffect, type FC, useRef, useState, useMemo } from 'react'
import { HStack, Heading, Image } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { AddIcon1 } from '@/assets/icons'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import RecommendList from '@/components/RecommendList/RecommendList'
import FollowingList from '@/components/RecommendList/FollowingList'
import BaseButton from '@/components/BaseButton/BaseButton'
import PostWrapSkeleton from '@/components/Skeketon/PostWrapSkeleton'

import { useStore } from '@/store'
import { getRecommendMedia } from '@/api/list'
import Hls from 'hls.js'
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

  useEffect(() => {
    console.log(getCacheVideo, '====333333========')
  }, [getCacheVideo])

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

  useEffect(() => {
    const handleScroll = () => {
      if (selectedPostsRef.current) {
        const rect = selectedPostsRef.current.getBoundingClientRect()
        const isVisible = rect.top < 0

        // if (isVisible && title !== 'Selected Posts') {
        //   triggerTitleChange('Selected Posts')
        // } else if (!isVisible && title !== 'Following') {
        //   triggerTitleChange('Following')
        // }
      }
    }

    const scrollableDiv = document.getElementById('recommendScrollableDiv')
    if (scrollableDiv) {
      scrollableDiv.addEventListener('scroll', handleScroll)
    }

    return () => {
      if (scrollableDiv) {
        scrollableDiv.removeEventListener('scroll', handleScroll)
      }
    }
  }, [title])

  const triggerTitleChange = (newTitle: string) => {
    setFadeClass('fade-out')
    setTimeout(() => {
      setTitle(newTitle)
      setFadeClass('fade-in')
    }, 300)
  }

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
          {/* <BaseButton
            text="Create"
            icon={<Image src={AddIcon1} />}
            width="87px"
            handler={() => navigate('/post')}
          /> */}
          <NewPostButton />
        </HStack>
        <div className="overflow-hidden" style={{ height: '0px', opacity: 0, ...animation }}>
          <FollowingList />
        </div>
        <CardRecommendProvider.Provider value={{ recommend: true }}>
          <div className={`${userInfo.user_id !== -1 && userInfo.fans === 0 ? '' : 'mt-[68px]'}`}>
            <RecommendList />
          </div>
        </CardRecommendProvider.Provider>
      </>
    </div>
  )
}
export default HomePage
