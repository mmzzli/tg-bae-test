import { useState, useEffect, useRef, memo } from 'react'
import { Tabs, Swiper } from 'antd-mobile'
import { Box, useBoolean } from '@chakra-ui/react'
import InfiniteScroll from 'react-infinite-scroll-component'
import type { SwiperRef } from 'antd-mobile/es/components/swiper'

import { useSetState, useMemoizedFn, useRequest } from 'ahooks'
import { genShareLinkFn } from '@/utils/utils'
import { useStore } from '@/store/store'

import { getLink, getShareInlineMessageId } from '@/api/list'

import ResourceList, { ShareDataProps } from '../ResourceList/ResourceList'
import Empty from '../comm/Empty'
import Icon from '../comm/Icon'
import PostSkeleton from '../Skeketon/PostSkeleton'

import { useFavList, useOrdersList, useViewList } from '@/store/hook/useResourceList'

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
  const { refresh: refreshFav } = useFavList()
  const { refresh: refreshOrders } = useOrdersList()
  const { refresh: refreshView } = useViewList()
  const { profileActiveTab, setProfileActiveTab } = useStore((state) => ({
    profileActiveTab: state.profileActiveTab,
    setProfileActiveTab: state.setProfileActiveTab,
  }))
  const [activeIndex, setActiveIndex] = useState<number>(profileActiveTab || 0)
  const swiperRef = useRef<SwiperRef>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState<Record<string, string>>({}) // 动态高度
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
    const index = tabItems.findIndex((item) => item.key === key)
    setActiveIndex(index)
    setProfileActiveTab(index)
    swiperRef.current?.swipeTo(index)

    // Defer scroll position restoration
    requestAnimationFrame(() => {
      const scrollableDiv = document.getElementById('profileScrollableDiv')
      if (scrollableDiv && targetBoll && stickyScrollPosition !== null) {
        scrollableDiv.scrollTo({
          top: stickyScrollPosition,
          behavior: 'smooth',
        })
      }
    })
  }

  // Debounced height update
  const debouncedUpdateHeight = useMemoizedFn((index: number) => {
    if (!containerRef.current) return

    const currentSlide = containerRef.current.querySelectorAll('.swiper-item-cutomer')[index]
    if (!currentSlide) return

    requestAnimationFrame(() => {
      const height = currentSlide.scrollHeight
      if (height > 0) {
        setContainerHeight((prev) => ({ ...prev, [index]: `${height}px` }))
      }
    })
  })

  const handleSwipeChange = (index: number) => {
    setActiveIndex(index)
    setProfileActiveTab(index)
    debouncedUpdateHeight(index)

    // Batch refresh operations
    switch (tabItems[index].key) {
      case 'posts':
        requestAnimationFrame(refreshView)
        break
      case 'purchased':
        requestAnimationFrame(refreshOrders)
        break
      case 'saved':
        requestAnimationFrame(refreshFav)
        break
    }
  }

  useEffect(() => {
    const element = document.getElementById('profileScrollableDiv')
    const target = document.getElementById('targetElement')

    const handleScroll = () => {
      if (!element || !target) return

      const rect = target.getBoundingClientRect()
      const safeTop = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--tg-safe-area-inset-top')
      )
      const contentTop = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
          '--tg-content-safe-area-inset-top'
        )
      )

      const shouldBeSticky = rect.top <= safeTop + contentTop

      if (shouldBeSticky !== targetBoll) {
        setTargetBoll(shouldBeSticky)
        if (shouldBeSticky && !targetBoll) {
          setStickyScrollPosition(element.scrollTop)
        }
      }
    }

    if (element) {
      element.addEventListener('scroll', handleScroll, { passive: true })
    }

    return () => {
      if (element) {
        element.removeEventListener('scroll', handleScroll)
      }
    }
  }, [targetBoll])

  // Keep the existing effect for tab changes
  useEffect(() => {
    setActiveIndex(profileActiveTab)
    swiperRef.current?.swipeTo(profileActiveTab)
    requestAnimationFrame(() => {
      debouncedUpdateHeight(profileActiveTab)
    })
  }, [profileActiveTab])

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
          style={{
            height: containerHeight[activeIndex],
            minHeight: '200px',
            overflow: 'hidden',
            transition: 'height 0.3s',
          }}
          id="test-swiper-container"
        >
          <Swiper
            direction="horizontal"
            indicator={() => null}
            ref={swiperRef}
            defaultIndex={activeIndex}
            onIndexChange={handleSwipeChange}
          >
            <Swiper.Item className="swiper-item-cutomer">
              <MyPosts
                key={'posts'}
                setCurrentShareData={setCurrentShareData}
                getShareLink={getShareLink}
                updateHeight={debouncedUpdateHeight}
              />
            </Swiper.Item>
            <Swiper.Item className="swiper-item-cutomer">
              <OrderList
                key={'purchased'}
                setCurrentShareData={setCurrentShareData}
                getShareLink={getShareLink}
                updateHeight={debouncedUpdateHeight}
              />
            </Swiper.Item>
            <Swiper.Item className="swiper-item-cutomer">
              <FavList
                key={'saved'}
                setCurrentShareData={setCurrentShareData}
                getShareLink={getShareLink}
                updateHeight={debouncedUpdateHeight}
              />
            </Swiper.Item>
          </Swiper>
        </div>
      </div>
    </>
  )
}

const MyPosts = memo(
  ({
    setCurrentShareData,
    getShareLink,
    updateHeight,
  }: {
    setCurrentShareData: (data: ShareDataProps) => void
    getShareLink: (title: string, pid: number, uid: number) => Promise<void>
    updateHeight: (index: number) => void
  }) => {
    const { list, hasMore, fetchMoreData, page } = useViewList()
    const setViewList = useStore((state) => state.setViewList)

    console.log('jacob list>>>>', list)

    useEffect(() => {
      if (list.length) {
        setTimeout(() => {
          requestAnimationFrame(() => {
            updateHeight(0) // index 对应各自的索引值
          })
        }, 100)
      }
    }, [list])

    if (!hasMore && list.length <= 0) {
      return (
        <Empty
          title="No post yet."
          className="w-full mt-10"
          icon={
            <Icon name="icon-post" style={{ width: '120px', height: '120px' }}></Icon>
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
          <Box textAlign="center" className="pt-[24px]">
            <PostSkeleton />
          </Box>
        }
        scrollableTarget="profileScrollableDiv"
        scrollThreshold={0.8}
        style={{ overflow: 'visible' }}
      >
        <ResourceList resources={list} type="view" setResourcesList={setViewList} />
      </InfiniteScroll>
    )
  }
)

const FavList = memo(
  ({
    setCurrentShareData,
    getShareLink,
    updateHeight,
  }: {
    setCurrentShareData: (data: ShareDataProps) => void
    getShareLink: (title: string, pid: number, uid: number) => Promise<void>
    updateHeight: (index: number) => void
  }) => {
    const { list, hasMore, fetchMoreData, page } = useFavList()
    const setFavList = useStore((state) => state.setFavList)
    const scrollRef = useRef<HTMLDivElement>(null)
    const updateContainerHeight = () => {
      requestAnimationFrame(() => {
        updateHeight(2)
      })
    }

    useEffect(() => {
      // 无论是否有数据，都需要更新高度
      setTimeout(() => {
        if (scrollRef.current) {
          updateContainerHeight()

          const resizeObserver = new ResizeObserver(() => {
            updateContainerHeight()
          })

          resizeObserver.observe(scrollRef.current)

          return () => {
            resizeObserver.disconnect()
          }
        }
      }, 100)
    }, [list.length, updateHeight])

    return (
      <div ref={scrollRef} style={{ minHeight: '200px' }}>
        <InfiniteScroll
          dataLength={list.length}
          next={fetchMoreData}
          hasMore={hasMore}
          loader={
            <Box textAlign="center" className="pt-[24px]">
              <PostSkeleton />
            </Box>
          }
          scrollableTarget="profileScrollableDiv"
          scrollThreshold={0.8}
          style={{ overflow: 'visible' }}
        >
          <ResourceList resources={list} type="fav" hasMore={hasMore} setResourcesList={setFavList} />
        </InfiniteScroll>
      </div>
    )
  }
)

const OrderList = memo(
  ({
    setCurrentShareData,
    getShareLink,
    updateHeight,
  }: {
    setCurrentShareData: (data: ShareDataProps) => void
    getShareLink: (title: string, pid: number, uid: number) => Promise<void>
    updateHeight: (index: number) => void
  }) => {
    const { list, hasMore, fetchMoreData, page } = useOrdersList()
    const setOrdersList = useStore((state) => state.setOrderList)
    useEffect(() => {
      if (list.length) {
        setTimeout(() => {
          requestAnimationFrame(() => {
            updateHeight(1) // index 对应各自的索引值
          })
        }, 100)
      }
    }, [list])
    if (!hasMore && list.length <= 0) {
      return (
        <Empty
          title="You haven't purchased any post yet."
          className="w-full mt-10"
          icon={
            <Icon
              name="icon-post"
              style={{ width: '120px', height: '120px' }}
            />
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
          <Box textAlign="center" className="pt-[24px]">
            <PostSkeleton />
          </Box>
        }
        scrollableTarget="profileScrollableDiv"
        scrollThreshold={0.8}
        style={{ overflow: 'visible' }}
      >
        <ResourceList resources={list} type="payment" setResourcesList={setOrdersList} />
      </InfiniteScroll>
    )
  }
)

export default ViewList
