import { forwardRef, useImperativeHandle } from 'react'
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
interface ChildRef {
  refresh?: () => void;
}

const RecommendList = forwardRef<ChildRef, PostListProps>((props, ref) => {
  const { className } = props
  const token = useStore((state) => state.token)
  const { list, hasMore, fetchMoreData, page, refresh } = useRecommendList()
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
  useImperativeHandle(ref, () => ({
    refresh: () => refresh()
  }));

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
})

export default RecommendList
