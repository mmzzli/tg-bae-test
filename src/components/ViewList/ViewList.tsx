import { useState } from 'react'
import { Box } from '@chakra-ui/react'
import InfiniteScroll from 'react-infinite-scroll-component'
import ResourceList from '../ResourceList/ResourceList'
import { cn } from '@/utils/utils'
import { useFavList, useOrdersList, useViewList } from '@/store/hook/useResourceList'
import Empty from '../comm/Empty'
import Icon from '../comm/Icon'
import PostSkeleton from '../Skeketon/PostSkeleton'

interface PostListProps {
  className?: string
}

const ViewList = ({ className }: PostListProps) => {
  const { initialize } = useFavList()
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
  const tabEve = (id: string) => {
    initialize()
    setIsd(id)
  }

  return (
    <>
      <Box className="flex justify-around" borderBottom="1px solid #EBEBF4">
        {menuList.map((item) => (
          <div
            key={item.id}
            className={`text-[16px] text-[${item.id === ids ? '#0F1233' : '#666'}] font-medium`}
            onClick={() => tabEve(item.id)}
          >
            {item.name}
            {item.id === ids && <p className="w-[32px] bg-[#4A3AFF] h-[2px] m-[auto] mt-[8px]"></p>}
          </div>
        ))}
      </Box>
      <div className={cn(className, '')}>
        {ids === 'posts' && <MyPosts key={'posts'} />}
        {ids === 'purchased' && <OrderList key={'purchased'} />}
        {ids === 'saved' && <FavList key={'saved'} />}
      </div>
    </>
  )
}
const MyPosts = () => {
  const { list, hasMore, fetchMoreData, page } = useViewList()
  // const setCacheVideoIndex = useStore((state) => state.setCacheVideoIndex)
  // const getCacheVideoindex = useStore((state) => state.cacheVideoIndex)
  // const updateCache = useStore((state) => state.updateCache)
  //
  // useCacheVideo(
  //   list,
  //   page,
  //   setCacheVideoIndex,
  //   getCacheVideoindex,
  //   updateCache,
  //   'profileScrollableDiv',
  //   'video-card'
  // )
  if (!hasMore && !list.length) {
    return (
      <Empty
        title="No post yet."
        className="w-full fixed top-[63%] left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        icon={
          <Icon name="icon-Empty_white_post" style={{ width: '164px', height: '164px' }}></Icon>
        }
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
      <ResourceList resources={list} />
    </InfiniteScroll>
  )
}
const FavList = () => {
  const { list, hasMore, fetchMoreData, page } = useFavList()
  // const setCacheVideoIndex = useStore((state) => state.setCacheVideoIndex)
  // const getCacheVideoindex = useStore((state) => state.cacheVideoIndex)
  // const updateCache = useStore((state) => state.updateCache)
  //
  // useCacheVideo(
  //   list,
  //   page,
  //   setCacheVideoIndex,
  //   getCacheVideoindex,
  //   updateCache,
  //   'profileScrollableDiv',
  //   'video-card'
  // )
  if (!hasMore && !list.length) {
    return (
      <Empty
        title="No post yet."
        className="w-full fixed top-[63%] left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        icon={
          <Icon name="icon-Empty_white_post" style={{ width: '164px', height: '164px' }}></Icon>
        }
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
      <ResourceList resources={list} type="fav" hasMore={hasMore} />
    </InfiniteScroll>
  )
}
const OrderList = () => {
  const { list, hasMore, fetchMoreData, page } = useOrdersList()
  // const setCacheVideoIndex = useStore((state) => state.setCacheVideoIndex)
  // const getCacheVideoindex = useStore((state) => state.cacheVideoIndex)
  // const updateCache = useStore((state) => state.updateCache)
  //
  // useCacheVideo(
  //   list,
  //   page,
  //   setCacheVideoIndex,
  //   getCacheVideoindex,
  //   updateCache,
  //   'profileScrollableDiv',
  //   'video-card'
  // )
  if (!hasMore && !list.length) {
    return (
      <Empty
        title="You haven't purchased any post yet."
        className="w-full fixed top-[63%] left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        icon={
          <Icon name="icon-Empty_white_purchase" style={{ width: '164px', height: '164px' }}></Icon>
        }
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
