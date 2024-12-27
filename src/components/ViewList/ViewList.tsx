import { useState, useEffect } from 'react'
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

  const [targetBoll, setTargetBoll] = useState<boolean>(false)
  useEffect(() => {
    const element = document.getElementById("profileScrollableDiv");
    const target = document.getElementById("targetElement");
    const handleScroll = () => {
      if (element && target) {
        const rect = target.getBoundingClientRect();
        const safeTop = window.getComputedStyle(document.documentElement).getPropertyValue('--tg-safe-area-inset-top')
        const contentTop = window.getComputedStyle(document.documentElement).getPropertyValue('--tg-content-safe-area-inset-top')
        const safeTopNum = Number(safeTop.replace("px", ""))
        const contentTopNum = Number(contentTop.replace("px", ""))
        console.log(contentTopNum,'|',safeTopNum, '|', rect.top )
        if ((rect.top - 35 - (safeTopNum + contentTopNum)) >= 0) {
          setTargetBoll(false)
        } else {
          setTargetBoll(true)
        }
      }
    };
    if (element) {
      element.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (element) {
        element.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return (
    <>
      <div className={targetBoll ? `fixed top-0 w-full bg-white z-[111]` : ''}
        style={{
          paddingTop: targetBoll ? `calc(var(--tg-safe-area-inset-top) + var(--tg-content-safe-area-inset-top))`:'',
        }}
      >
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
      </div>
      <div className={cn(className, '')} id="targetElement">
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
      <ResourceList resources={list} type='view' />
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
