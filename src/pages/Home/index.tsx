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
  const [title, setTitle] = useState('Following')
  const [fadeClass, setFadeClass] = useState('fade-in')
  const userInfo = useStore((state) => state.userInfo)

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

  useEffect(() => {
    if (!token) return
    const load = async () => {
      const { posts: initialResources } = await getRecommendMedia({
        page_num: 1,
        records: 30,
      })
      const cacheVideos = async (resources: any) => {
        const maxVideosToCache = resources.length
        const maxFragmentsPerVideo = 1
        let currentVideoIndex = 0

        const cacheNextVideo = async () => {
          if (currentVideoIndex >= Math.min(resources.length, maxVideosToCache)) {
            console.log('缓存完成')
            return
          }

          const item = resources[currentVideoIndex]
          if (!Hls.isSupported()) {
            console.error('HLS.js 不支持当前浏览器环境')
            return
          }

          const hls = new Hls()
          let bufferedFragments = 0

          const virtualVideoElement = document.createElement('video')
          hls.loadSource(item.media)
          hls.attachMedia(virtualVideoElement)

          hls.on(Hls.Events.FRAG_BUFFERED, () => {
            bufferedFragments++
            console.log(`视频 ${currentVideoIndex + 1} 缓存分片数量: ${bufferedFragments}`)
            if (bufferedFragments >= maxFragmentsPerVideo) {
              console.log(`视频 ${currentVideoIndex + 1} 缓存完成，分片数量: ${bufferedFragments}`)
              hls.destroy()
              currentVideoIndex++
              cacheNextVideo() // 缓存下一个视频
            }
          })

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log(`视频 ${currentVideoIndex + 1} 流解析完成，开始缓存`)
          })

          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error(`视频 ${currentVideoIndex + 1} 缓存出错:`, data)
            hls.destroy()
            currentVideoIndex++
            cacheNextVideo() // 跳过错误视频，缓存下一个
          })
        }

        // 开始缓存第一个视频
        cacheNextVideo()
      }
      if (initialResources && initialResources.length > 0) {
        const resources = initialResources
          .filter((item) => item.post.type === 0)
          .map((item) => item.post)
        console.log(resources)
        if (resources.length > 0) {
          cacheVideos(resources)
        }
      }
    }
    load()
  }, [token])

  return (
    <div className="relative w-full h-full overflow-auto" id="recommendScrollableDiv">
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

        {/* <button
        onClick={() => shareLink(COMMUNITY_LINK)}
        className="text-[14px] py-[14px] px-6 w-[126px] h-[40px] bg-[#4A3AFF] rounded-[32px] flex items-center justify-center font-medium text-[#fff] mx-auto mt-[28px] mb-12"
      >
        Community
      </button> */}
        {/* <div className="px-4">
          <h3 className="text-[#E0E2F6] font-bold text-xl" ref={selectedPostsRef}>
            Selected Posts
          </h3>
        </div> */}
        <CardRecommendProvider.Provider value={{ recommend: true }}>
          <div className={`${userInfo.user_id !== -1 && userInfo.fans === 0 ? '' : 'mt-10'}`}>
            <RecommendList />
          </div>
        </CardRecommendProvider.Provider>
      </>
    </div>
  )
}
export default HomePage
