import { useEffect, useState } from 'react'
import { Box, Spinner } from '@chakra-ui/react'
import InfiniteScroll from 'react-infinite-scroll-component'
import ResourceList from '../ResourceList/ResourceList'
import { cn } from '@/utils/utils'
import { useViewList, useFavList, useOrdersList } from '@/store/hook/useResourceList'
import Empty from '../comm/Empty'
import Icon from '../comm/Icon'
import { rotate } from '@chakra-ui/react/dist/types/progress/progress.utils'
import { useSafeState } from 'ahooks'
import ProfileSkeleton from '../Skeketon/ProfileSkeleton'
import PostSkeleton from '../Skeketon/PostSkeleton'
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
        {ids === 'posts' && !hasMore && !list.length ? (
          <Empty
            title="No post yet."
            icon={<Icon name="icon-none_post" style={{ width: '164px', height: '164px' }}></Icon>}
          ></Empty>
        ) : (
          ids === 'posts' && (
            <InfiniteScroll
              dataLength={list.length}
              next={fetchMoreData}
              hasMore={hasMore}
              loader={
                <Box textAlign="center" m="20px">
                  <PostSkeleton />
                </Box>
              }
              scrollableTarget="profileScrollableDiv"
              scrollThreshold={0.8}
              style={{ overflow: 'visible' }}
            >
              <ResourceList resources={list} />
            </InfiniteScroll>
          )
        )}
        {ids === 'purchased' && <OrderList />}
        {ids === 'saved' && <FavList />}
      </div>
    </>
  )
}
const FavList = () => {
  const { list, hasMore, fetchMoreData } = useFavList()
  if (!hasMore && !list.length) {
    return (
      <Empty
        title="No post yet."
        icon={<Icon name="icon-none_post" style={{ width: '164px', height: '164px' }}></Icon>}
      ></Empty>
    )
  }
  return (
    <InfiniteScroll
      dataLength={list.length}
      next={fetchMoreData}
      hasMore={hasMore}
      loader={
        <Box textAlign="center" m="20px ">
          <PostSkeleton />
        </Box>
      }
      scrollableTarget="profileScrollableDiv"
      scrollThreshold={0.8}
      style={{ overflow: 'visible' }}
    >
      <ResourceList resources={list} type="fav" />
    </InfiniteScroll>
  )
}
const OrderList = () => {
  const { list, hasMore, fetchMoreData } = useOrdersList()
  if (!hasMore && !list.length) {
    return (
      <Empty
        title="You haven't purchased any post yet."
        icon={<Icon name="icon-none_purchased" style={{ width: '164px', height: '164px' }}></Icon>}
      ></Empty>
    )
  }
  return (
    <InfiniteScroll
      dataLength={list.length}
      next={fetchMoreData}
      hasMore={hasMore}
      loader={
        <Box textAlign="center" m="20px">
          <PostSkeleton />
        </Box>
      }
      scrollableTarget="profileScrollableDiv"
      scrollThreshold={0.8}
      style={{ overflow: 'visible' }}
    >
      <ResourceList resources={list} type="payment" />
    </InfiniteScroll>
  )
}

export default ViewList
