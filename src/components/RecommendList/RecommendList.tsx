import { Box } from '@chakra-ui/react'
import InfiniteScroll from 'react-infinite-scroll-component'
import ResourceList from '../ResourceList/ResourceList'
import { cn } from '@/utils/utils'
import useCacheVideo, { useRecommendList } from '@/store/hook/useResourceList'
import PostSkeleton from '../Skeketon/PostSkeleton'
import { useEffect } from 'react'
import { useStore } from '@/store'

interface PostListProps {
  className?: string
}

const RecommendList = ({ className }: PostListProps) => {
  const { list, hasMore, fetchMoreData, page } = useRecommendList()
  const setCacheVideoIndex = useStore((state) => state.setCacheVideoIndex)
  const getCacheVideoindex = useStore((state) => state.cacheVideoIndex)
  const updateCacheVideo = useStore((state) => state.updateCacheVideo)

  useCacheVideo(
    list,
    page,
    setCacheVideoIndex,
    getCacheVideoindex,
    updateCacheVideo,
    'recommendScrollableDiv',
    'video-card'
  )

  return (
    <div className={cn(className, 'pb-24')}>
      <InfiniteScroll
        dataLength={list.length}
        next={fetchMoreData}
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
          <ResourceList resources={list} />
        </div>
      </InfiniteScroll>
    </div>
  )
}

export default RecommendList
