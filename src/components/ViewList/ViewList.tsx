import { useState, useEffect, useMemo } from 'react'
import { Box } from '@chakra-ui/react'
import InfiniteScroll from 'react-infinite-scroll-component'
import ResourceList from '../ResourceList/ResourceList'
import { cn } from '@/utils/utils'
import { useFavList, useOrdersList, useViewList } from '@/store/hook/useResourceList'
import Empty from '../comm/Empty'
import Icon from '../comm/Icon'
import PostSkeleton from '../Skeketon/PostSkeleton'
import { Tabs } from 'antd'
import './tab.css'
import { useLocation } from 'react-router-dom'
import { useActivate, useUnactivate } from 'react-activation'

interface PostListProps {
  className?: string
}

type Align = 'start' | 'center' | 'end';
const ViewList = ({ className }: PostListProps) => {
  const { initialize } = useFavList()
  const [ids, setIsd] = useState<string>('posts')
  const [showIndicator, setShowIndicator] = useState(false)
  const [alignValue, setAlignValue] = useState<Align>('start');
  const location = useLocation()

  const menuItems = useMemo(() => [
    {
      key: 'posts',
      label: 'My posts',
    },
    {
      key: 'purchased',
      label: 'Purchased',
    },
    {
      key: 'saved',
      label: 'Saved',
    },
  ], []);

  const tabBarStyle = useMemo(() => ({
    color: '#666',
    fontSize: '16px',
    fontWeight: '500',
  }), []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (location.pathname.includes('/profile')) {
        setAlignValue('center')
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [location.pathname])

  useActivate(() => {
    setTimeout(() => {
      setAlignValue('center')
    }, 100)
  })

  useUnactivate(() => {
    setAlignValue('start')
  })

  const indicatorConfig = useMemo(() => ({
    size: () => 32,
    align: alignValue,
    render: () => null
  }), [showIndicator]);

  const handleTabChange = (key: string) => {
    initialize()
    setIsd(key)
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
      <div
        className={targetBoll ? `fixed top-0 w-full bg-white z-[111]` : ''}
        style={{
          paddingTop: targetBoll ? `calc(var(--tg-safe-area-inset-top) + var(--tg-content-safe-area-inset-top))`:'',
        }}
      >
        <Tabs
          activeKey={ids}
          items={menuItems}
          onChange={handleTabChange}
          className="mx-4"
          size='small'
          tabBarStyle={tabBarStyle}
          indicator={{ size: () => 32, align: alignValue, }}
        />
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
