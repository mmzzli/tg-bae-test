import { Box, Spinner } from '@chakra-ui/react'
import InfiniteScroll from 'react-infinite-scroll-component'
import ResourceList from '../ResourceList/ResourceList'
import { cn } from '@/utils/utils'
import { FormatterListItem } from '../../store/slices/resourceListSlice'

interface PostListProps {
  className?: string
  list: FormatterListItem[]
  hasMore: boolean
  fetchMoreData: () => void
}

const PostList = ({ className, list, hasMore, fetchMoreData }: PostListProps) => {
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

export default PostList
