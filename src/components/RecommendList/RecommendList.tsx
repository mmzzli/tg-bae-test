import { Box, Spinner } from '@chakra-ui/react'
import InfiniteScroll from 'react-infinite-scroll-component'
import ResourceList from '../ResourceList/ResourceList'
import { cn } from '@/utils/utils'
import { useRecommendList } from '@/store/hook/useResourceList'
import PostSkeleton from '../Skeketon/PostSkeleton'

interface PostListProps {
  className?: string
}

const RecommendList = ({ className }: PostListProps) => {
  const { list, hasMore, fetchMoreData } = useRecommendList()
  return (
    <div className={cn(className, 'pb-24')}>
      <InfiniteScroll
        dataLength={list.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={
          <Box textAlign="center" m="20px 0" className='p-4'>
              <PostSkeleton/>
          </Box>
        }
        scrollableTarget="recommendScrollableDiv"
        scrollThreshold={0.8}
        style={{ overflow: 'visible' }}
      >
        <ResourceList resources={list} />
      </InfiniteScroll>
    </div>
  )
}

export default RecommendList
