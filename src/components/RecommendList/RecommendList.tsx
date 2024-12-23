import { Box } from '@chakra-ui/react'
import InfiniteScroll from 'react-infinite-scroll-component'
import ResourceList from '../ResourceList/ResourceList'
import { cn } from '@/utils/utils'
import useCacheVideo, { useRecommendList } from '@/store/hook/useResourceList'
import PostSkeleton from '../Skeketon/PostSkeleton'
import { useEffect, useState } from 'react'
import { useStore } from '@/store'
import { useActivate } from 'react-activation'
import { ListItem } from '@/types'

interface PostListProps {
  className?: string
}

const RecommendList = ({ className }: PostListProps) => {
  const token = useStore((state) => state.token)
  const { list, hasMore, fetchMoreData, page } = useRecommendList()
  const setCacheVideoIndex = useStore((state) => state.setCacheVideoIndex)
  const getCacheVideoindex = useStore((state) => state.cacheVideoIndex)
  const updateCacheVideo = useStore((state) => state.updateCacheVideo)
  const [random, setRandom] = useState(0)

  useCacheVideo(
    list,
    page,
    setCacheVideoIndex,
    getCacheVideoindex,
    updateCacheVideo,
    'recommendScrollableDiv',
    'video-card',
    random
  )

  useActivate(() => {
    const defaultVideo = document.getElementById('default-video-player')
    if (defaultVideo) {
      defaultVideo.parentNode?.removeChild(defaultVideo)
    }
    setRandom(Date.now())
  })

  const throttledFetchMoreData = (() => {
    let lastCall = 0
    return () => {
      const now = Date.now()
      if (now - lastCall >= 1000) {
        fetchMoreData()
        lastCall = now
      }
    }
  })()

  useEffect(() => {
    const scrollableDiv = document.getElementById('recommendScrollableDiv')
    if (!scrollableDiv) return

    let lastScrollTop = 0
    let lastTouchY = 0
    let lastTouchTime = 0
    let velocity = 0
    let animationFrameId: number
    const maxScrollSpeed = 20
    const maxMoveSpeed = 10
    const friction = 0.01

    const animate = () => {
      if (Math.abs(velocity) > 0.1) {
        velocity *= friction
        scrollableDiv.scrollTop += velocity
        animationFrameId = requestAnimationFrame(animate)
      } else {
        velocity = 0
      }
    }

    const handleWheel = (e: WheelEvent) => {
      const currentScrollTop = scrollableDiv.scrollTop
      const scrollDelta = Math.abs(currentScrollTop - lastScrollTop)

      if (scrollDelta > maxScrollSpeed) {
        e.preventDefault()
        scrollableDiv.scrollTop =
          lastScrollTop + (currentScrollTop > lastScrollTop ? maxScrollSpeed : -maxScrollSpeed)
      }

      lastScrollTop = scrollableDiv.scrollTop
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      velocity = 0
      lastTouchY = e.touches[0].clientY
      lastScrollTop = scrollableDiv.scrollTop
      lastTouchTime = Date.now()
    }

    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY
      const deltaY = lastTouchY - currentY
      const currentTime = Date.now()

      const timeDiff = currentTime - lastTouchTime
      velocity = (deltaY / (timeDiff || 1)) * 16

      velocity = Math.min(Math.max(velocity, -maxMoveSpeed), maxMoveSpeed)

      const currentScrollTop = scrollableDiv.scrollTop
      scrollableDiv.scrollTop = lastScrollTop + velocity

      lastTouchY = currentY
      lastScrollTop = scrollableDiv.scrollTop
      lastTouchTime = currentTime
    }

    const handleTouchEnd = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      animationFrameId = requestAnimationFrame(animate)
    }

    scrollableDiv.addEventListener('wheel', handleWheel, { passive: false })
    scrollableDiv.addEventListener('touchstart', handleTouchStart, { passive: false })
    scrollableDiv.addEventListener('touchmove', handleTouchMove, { passive: false })
    scrollableDiv.addEventListener('touchend', handleTouchEnd)

    return () => {
      scrollableDiv.removeEventListener('wheel', handleWheel)
      scrollableDiv.removeEventListener('touchstart', handleTouchStart)
      scrollableDiv.removeEventListener('touchmove', handleTouchMove)
      scrollableDiv.removeEventListener('touchend', handleTouchEnd)
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [])

  return (
    <div className={cn(className, '')}>
      <InfiniteScroll
        dataLength={list.length}
        // next={fetchMoreData}
        next={throttledFetchMoreData}
        hasMore={hasMore}
        loader={
          <Box textAlign="center" m="20px 0" className="p-4">
            <PostSkeleton />
          </Box>
        }
        scrollableTarget="recommendScrollableDiv"
        scrollThreshold={0.1}
        style={{ overflow: 'visible' }}
      >
        <div id="view-container">
          <ResourceList resources={list} type="recommend" />
        </div>
      </InfiniteScroll>
    </div>
  )
}

export default RecommendList
