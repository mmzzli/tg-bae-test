import { useState, useEffect, useRef } from 'react'
import { Tabs, Swiper } from 'antd-mobile'
import { Box } from '@chakra-ui/react'
import InfiniteScroll from 'react-infinite-scroll-component'
import type { SwiperRef } from 'antd-mobile/es/components/swiper'

import ResourceList from '../ResourceList/ResourceList'
import Empty from '../comm/Empty'
import Icon from '../comm/Icon'
import PostSkeleton from '../Skeketon/PostSkeleton'

import { useFavList, useOrdersList, useViewList } from '@/store/hook/useResourceList'

interface PostListProps {
  className?: string
}

const tabItems = [
  { key: 'posts', title: 'My posts' },
  { key: 'purchased', title: 'Purchased' },
  { key: 'saved', title: 'Saved' },
]

const ViewList = ({ className }: PostListProps) => {
  const { initialize } = useFavList()
  const [activeIndex, setActiveIndex] = useState<number>(0)
  const swiperRef = useRef<SwiperRef>(null)
  const [stickyScrollPosition, setStickyScrollPosition] = useState<number | null>(null)

  const handleTabChange = (key: string) => {
    initialize()
    const scrollableDiv = document.getElementById('profileScrollableDiv')
    if (scrollableDiv && targetBoll && stickyScrollPosition !== null) {
      scrollableDiv.scrollTo({
        top: stickyScrollPosition,
        behavior: 'smooth'
      })
    }
    const index = tabItems.findIndex(item => item.key === key)
    setActiveIndex(index)
    swiperRef.current?.swipeTo(index)
  }

  const handleSwipeChange = (index: number) => {
    const scrollableDiv = document.getElementById('profileScrollableDiv')
    if (scrollableDiv && targetBoll && stickyScrollPosition !== null) {
      scrollableDiv.scrollTo({
        top: stickyScrollPosition,
        behavior: 'smooth'
      })
    }
    setActiveIndex(index)
  }

  const [targetBoll, setTargetBoll] = useState<boolean>(false)
  useEffect(() => {
    const element = document.getElementById('profileScrollableDiv')
    const target = document.getElementById('targetElement')
    const handleScroll = () => {
      if (element && target) {
        const rect = target.getBoundingClientRect()
        const safeTop = window
          .getComputedStyle(document.documentElement)
          .getPropertyValue('--tg-safe-area-inset-top')
        const contentTop = window
          .getComputedStyle(document.documentElement)
          .getPropertyValue('--tg-content-safe-area-inset-top')
        const safeTopNum = Number(safeTop.replace('px', ''))
        const contentTopNum = Number(contentTop.replace('px', ''))

        if (rect.top <= safeTopNum + contentTopNum) {
          setTargetBoll(true)
          // 记录刚开始吸顶时的滚动位置
          if (!targetBoll) {
            setStickyScrollPosition(element.scrollTop)
          }
        } else {
          setTargetBoll(false)
          setStickyScrollPosition(null)
        }
      }
    }
    if (element) {
      element.addEventListener('scroll', handleScroll)
    }
    return () => {
      if (element) {
        element.removeEventListener('scroll', handleScroll)
      }
    }
  }, [targetBoll])

  return (
    <>
      <div id="targetElement" className="relative">
        <div
          className={`${
            targetBoll ? 'fixed left-0 right-0' : ''
          } w-full bg-white dark:bg-black z-[111]`}
          style={{
            top: targetBoll
              ? `calc(var(--tg-safe-area-inset-top) + var(--tg-content-safe-area-inset-top))`
              : '',
          }}
        >
          <Tabs
            activeKey={tabItems[activeIndex].key}
            onChange={handleTabChange}
            activeLineMode="fixed"
            style={{
              '--active-line-color': '#6254FF',
              '--active-title-color': '#0F1233',
            }}
          >
            {tabItems.map(item => (
              <Tabs.Tab title={item.title} key={item.key} />
            ))}
          </Tabs>
        </div>
        {targetBoll && <div style={{ height: '44px' }} />}
        <Swiper
          direction='horizontal'
          indicator={() => null}
          ref={swiperRef}
          defaultIndex={activeIndex}
          onIndexChange={handleSwipeChange}
        >
          <Swiper.Item>
            <MyPosts key={'posts'} />
          </Swiper.Item>
          <Swiper.Item>
            <OrderList key={'purchased'} />
          </Swiper.Item>
          <Swiper.Item>
            <FavList key={'saved'} />
          </Swiper.Item>
        </Swiper>
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
        className="w-full mt-10"
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
      <ResourceList resources={list} type="view" />
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
        className="w-full mt-10"
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
        className="w-full mt-10"
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
