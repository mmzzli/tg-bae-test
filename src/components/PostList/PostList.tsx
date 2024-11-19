import { Box, Spinner } from '@chakra-ui/react'
import InfiniteScroll from 'react-infinite-scroll-component'
import ResourceList from '../ResourceList/ResourceList'
import { cn } from '@/utils/utils'
import { FormatterListItem } from '../../store/slices/resourceListSlice'

import Empty from '../comm/Empty'
import Icon from '../comm/Icon'

interface PostListProps {
  className?: string
  list: FormatterListItem[]
  hasMore: boolean
  fetchMoreData: () => void
}

const PostList = ({ className, list, hasMore, fetchMoreData }: PostListProps) => {
  if(list.length){
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
          scrollableTarget="ProfileScrollableDiv"
          scrollThreshold={0.8}
          style={{ overflow: 'visible' }}
        >
          <ResourceList resources={list} />
        </InfiniteScroll>
      </div>
    )
  }else{
    return <Empty title="No post yet." icon={<Icon name="icon-none_post" style={{width:'164px', height:'164px'}}></Icon>}></Empty>
  }
}

export default PostList
