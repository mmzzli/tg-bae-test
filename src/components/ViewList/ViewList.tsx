import { useState } from 'react'
import { Box, Spinner } from '@chakra-ui/react'
import InfiniteScroll from 'react-infinite-scroll-component'
import ResourceList from '../ResourceList/ResourceList'
import { cn } from '@/utils/utils'
import { useViewList, useFavList, useOrdersList } from '@/store/hook/useResourceList'

interface PostListProps {
  className?: string
}

const ViewList = ({ className }: PostListProps) => {
  const { list, hasMore, fetchMoreData } = useViewList()
  const [ids, setIsd] = useState<string>('posts')
  const menuList = [
    {
      name: 'My posts',
      id: 'posts',
    },
    {
      name: 'Purchased',
      id: 'purchased',
    },
    {
      name: 'Saved',
      id: 'saved',
    },
  ]

  return (
    <>
      <Box className="flex justify-around" borderBottom="1px solid rgba(255, 255, 255, 0.10)">
        {menuList.map((item) => (
          <div
            className={`text-[16px] text-[${item.id === ids ? '#E0E2F6' : '#62636F'}]`}
            onClick={() => setIsd(item.id)}
          >
            {item.name}
            {item.id === ids && <p className="w-[32px] bg-[#4A3AFF] h-[2px] m-[auto] mt-[8px]"></p>}
          </div>
        ))}
      </Box>
      <div className={cn(className, 'pb-24')}>
        {ids === 'posts' && (
          <InfiniteScroll
            dataLength={list.length}
            next={fetchMoreData}
            hasMore={hasMore}
            loader={
              <Box textAlign="center" m="20px 0">
                <Spinner color="#4A3AFF" />
              </Box>
            }
            scrollableTarget="profileScrollableDiv"
            scrollThreshold={0.8}
            style={{ overflow: 'visible' }}
          >
            <ResourceList resources={list} />
          </InfiniteScroll>
        )}
        {ids === 'purchased' && <FavList />}
        {ids === 'saved' && <OrderList />}
      </div>
    </>
  )
}
const FavList = () => {
  const { list, hasMore, fetchMoreData } = useFavList()
  return (
    <InfiniteScroll
      dataLength={list.length}
      next={fetchMoreData}
      hasMore={hasMore}
      loader={
        <Box textAlign="center" m="20px 0">
          <Spinner color="#4A3AFF" />
        </Box>
      }
      scrollableTarget="profileScrollableDiv"
      scrollThreshold={0.8}
      style={{ overflow: 'visible' }}
    >
      <ResourceList resources={list} />
    </InfiniteScroll>
  )
}
const OrderList = () => {
  const { list, hasMore, fetchMoreData } = useOrdersList()
  return (
    <InfiniteScroll
      dataLength={list.length}
      next={fetchMoreData}
      hasMore={hasMore}
      loader={
        <Box textAlign="center" m="20px 0">
          <Spinner color="#4A3AFF" />
        </Box>
      }
      scrollableTarget="profileScrollableDiv"
      scrollThreshold={0.8}
      style={{ overflow: 'visible' }}
    >
      <ResourceList resources={list} />
    </InfiniteScroll>
  )
}

export default ViewList
