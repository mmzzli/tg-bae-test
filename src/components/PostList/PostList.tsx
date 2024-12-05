import { Box } from '@chakra-ui/react'
import InfiniteScroll from 'react-infinite-scroll-component'
import ResourceList from '../ResourceList/ResourceList'
import { cn } from '@/utils/utils'
import { FormatterListItem } from '../../store/slices/resourceListSlice'

import Empty from '../comm/Empty'
import Icon from '../comm/Icon'
import PostSkeleton from '../Skeketon/PostSkeleton'

interface PostListProps {
  className?: string
  list: FormatterListItem[]
  hasMore: boolean
  fetchMoreData: () => void
}

const PostList = ({ className, list, hasMore, fetchMoreData }: PostListProps) => {
  console.log('PostList---------->', hasMore, list.length)
  if (!hasMore && !list.length) {
    return (
      <Empty
        title="No post yet."
        icon={
          <Icon name="icon-Empty_white_post" style={{ width: '164px', height: '164px' }}></Icon>
        }
      ></Empty>
    )
  }
  return (
    <div className={cn(className, '')}>
      <InfiniteScroll
        dataLength={list.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={
          <Box textAlign="center" m="20px 0">
            <PostSkeleton />
          </Box>
        }
        scrollableTarget="profileScrollableDiv"
        scrollThreshold={0.8}
        style={{ overflow: 'visible' }}
      >
        <ResourceList resources={list} />
      </InfiniteScroll>
    </div>
  )
}

export default PostList
