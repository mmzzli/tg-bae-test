import { Box, Spinner } from '@chakra-ui/react'
import InfiniteScroll from 'react-infinite-scroll-component'
import ResourceList from '../ResourceList/ResourceList'
import { cn } from '@/utils/utils'
import { useViewList } from '@/store/hook/useResourceList'

interface PostListProps {
  className?: string
}

const ViewList = ({ className }: PostListProps) => {
  const { list, hasMore, fetchMoreData } = useViewList()

  return (
    <div className={cn(className, 'pb-24')}>
      <InfiniteScroll
        dataLength={list.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={
          <Box textAlign="center" m="20px 0">
            <Spinner color="#4A3AFF" />
          </Box>
        }
      >
        <ResourceList resources={list} />
      </InfiniteScroll>
    </div>
  )
}

export default ViewList
