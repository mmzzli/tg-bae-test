import { useState, useEffect, useRef } from 'react'
import { Tabs, Swiper } from 'antd-mobile'
import { Box, useBoolean } from '@chakra-ui/react'
import InfiniteScroll from 'react-infinite-scroll-component'
import type { SwiperRef } from 'antd-mobile/es/components/swiper'

import { useSetState, useMemoizedFn, useRequest } from 'ahooks'
import { genShareLinkFn } from '@/utils/utils'

import { getLink, getShareInlineMessageId } from '@/api/list'

import ResourceList, { ShareDataProps } from '../ResourceList/ResourceList'
import Empty from '../comm/Empty'
import Icon from '../comm/Icon'
import PostSkeleton from '../Skeketon/PostSkeleton'

import { useFavList, useOrdersList, useViewList } from '@/store/hook/useResourceList'
import { FormatterListItem } from '@/store/slices/resourceListSlice'
import { ShareModal } from '../ResourceList/ResourceList'

interface PostListProps {
  className?: string
}

interface ShreLinkProps {
  shareLink: string
  copyLink: string
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
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState('auto') // 动态高度
  const [stickyScrollPosition, setStickyScrollPosition] = useState<number | null>(null)
  const [isBaseModalOpen, { toggle, off }] = useBoolean(false)
  const [currentShareData, setCurrentShareData] = useState<ShareDataProps | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [links, setLinks] = useSetState<ShreLinkProps>({
    shareLink: '',
    copyLink: '',
  })

  const [targetBoll, setTargetBoll] = useState<boolean>(false)

  const { runAsync: getLinkHandlerAsync } = useRequest(getLink, {
    manual: true,
    onSuccess(res) {
      console.log(res)
    },
  })

  const getShareLink = useMemoizedFn(async (title: string, pid: number, uid: number) => {
    toggle()
    setIsLoading(false)
    const { shareLink, copyLink } = await genShareLinkFn(title, pid, uid, getLinkHandlerAsync)
    setLinks({ shareLink, copyLink: decodeURIComponent(copyLink) })
    setIsLoading(true)
  })

  const handleTabChange = (key: string) => {
    // initialize()
    const scrollableDiv = document.getElementById('profileScrollableDiv')
    if (scrollableDiv && targetBoll && stickyScrollPosition !== null) {
      scrollableDiv.scrollTo({
        top: stickyScrollPosition,
        behavior: 'smooth',
      })
    }
    const index = tabItems.findIndex((item) => item.key === key)
    setActiveIndex(index)
    swiperRef.current?.swipeTo(index)
  }

  // 初始高度设置
  useEffect(() => {
    updateHeight(0) // 初始化显示第一个 Item
  }, [])

  // 更新当前内容高度
  const updateHeight = (index: number) => {
    if (containerRef.current) {
      const currentSlide = containerRef.current.querySelectorAll('.swiper-item-cutomer')[index]
      if (currentSlide) {
        setContainerHeight(`${currentSlide.scrollHeight}px`)
      }
    }
  }

  const handleSwipeChange = (index: number) => {
    const scrollableDiv = document.getElementById('profileScrollableDiv')
    if (scrollableDiv && targetBoll && stickyScrollPosition !== null) {
      scrollableDiv.scrollTo({
        top: stickyScrollPosition,
        behavior: 'smooth',
      })
    }
    setActiveIndex(index)
    updateHeight(index) // 切换时更新高度
  }

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
            {tabItems.map((item) => (
              <Tabs.Tab title={item.title} key={item.key} />
            ))}
          </Tabs>
        </div>
        {targetBoll && <div style={{ height: '44px' }} />}
        <div
          ref={containerRef}
          style={{ height: containerHeight, minHeight: '200px', overflow: 'hidden', transition: 'height 0.3s' }}
          id='test-swiper-container'
        >
          <Swiper
            direction="horizontal"
            indicator={() => null}
            ref={swiperRef}
            defaultIndex={activeIndex}
            onIndexChange={handleSwipeChange}
          >
            <Swiper.Item className='swiper-item-cutomer'>
              <MyPosts
                key={'posts'}
                setCurrentShareData={setCurrentShareData}
                getShareLink={getShareLink}
                updateHeight={updateHeight}
              />
            </Swiper.Item>
            <Swiper.Item className='swiper-item-cutomer'>
              <OrderList
                key={'purchased'}
                setCurrentShareData={setCurrentShareData}
                getShareLink={getShareLink}
              />
            </Swiper.Item>
            <Swiper.Item className='swiper-item-cutomer'>
              <FavList
                key={'saved'}
                setCurrentShareData={setCurrentShareData}
                getShareLink={getShareLink}
              />
            </Swiper.Item>
          </Swiper>
        </div>
      </div>
    </>
  )
}
const MyPosts = ({
  setCurrentShareData,
  getShareLink,
  updateHeight
}: {
  setCurrentShareData: (data: ShareDataProps) => void
  getShareLink: (title: string, pid: number, uid: number) => Promise<void>,
  updateHeight: (index: number) => void
}) => {
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

  useEffect(() => {
    if(list.length) {
      setTimeout(()=> {
        updateHeight(0)
      }, 0)
    }
  },[list])

  return (
    <InfiniteScroll
      dataLength={list.length}
      next={fetchMoreData}
      hasMore={false}
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
      {/* {list.map((item) => (
        <div key={item.id}>{item.id}</div>
      ))} */}
    </InfiniteScroll>
  )
}
const FavList = ({
  setCurrentShareData,
  getShareLink,
}: {
  setCurrentShareData: (data: ShareDataProps) => void
  getShareLink: (title: string, pid: number, uid: number) => Promise<void>
}) => {
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
const OrderList = ({
  setCurrentShareData,
  getShareLink,
}: {
  setCurrentShareData: (data: ShareDataProps) => void
  getShareLink: (title: string, pid: number, uid: number) => Promise<void>
}) => {
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
