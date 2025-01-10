import { forwardRef, useImperativeHandle, useRef } from 'react'
import HomeResourceList from '../ResourceList/HomeResourceList'
import useCacheVideo, { useRecommendList } from '@/store/hook/useResourceList'
import { useEffect, useState } from 'react'
import { useStore } from '@/store'
// import { useActivate } from 'react-activation'
import { useVirtualizer } from '@tanstack/react-virtual'
import PostSkeleton from '../Skeketon/PostSkeleton'
import { debounce } from '@/utils/chat/schedulers'

interface PostListProps {
  className?: string
  containerRef?: React.RefObject<HTMLDivElement>
}
interface ChildRef {
  refresh?: () => void
  scrollToIndex?: (index: number) => void
}

const RecommendList = forwardRef<ChildRef, PostListProps>((props, ref) => {
  const { containerRef } = props
  const { list, hasMore, fetchMoreData, page, refresh, isLoading } = useRecommendList()
  const setCacheVideoIndex = useStore((state) => state.setCacheVideoIndex)
  const getCacheVideoindex = useStore((state) => state.cacheVideoIndex)
  const updateCacheVideo = useStore((state) => state.updateCacheVideo)
  useCacheVideo(
    list,
    page,
    setCacheVideoIndex,
    getCacheVideoindex,
    updateCacheVideo,
    'recommendScrollableDiv',
    'video-card'
  )

  const parentRef = containerRef || useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: list.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 500,
    overscan: 5,
  })
  let items = virtualizer.getVirtualItems()

  useImperativeHandle(ref, () => ({
    refresh: () => refresh(),
    scrollToIndex: (index: number) => virtualizer.scrollToIndex(index),
  }))

  useEffect(() => {
    const container = containerRef?.current
    if (!container) return

    const handleContainerScroll = debounce((e: Event) => {
      const target = e.target as HTMLDivElement
      const { scrollTop, clientHeight, scrollHeight } = target
      if (scrollHeight - scrollTop - clientHeight < 50) {
        fetchMoreData()
      }
    }, 100)

    container.addEventListener('scroll', handleContainerScroll)
    return () => {
      container.removeEventListener('scroll', handleContainerScroll)
    }
  }, [containerRef])

  if (isLoading && list.length === 0) {
    return (
      <div className="mt-12">
        <PostSkeleton />
      </div>
    )
  }
  return (
    <div>
      <div
        id="view-container"
        style={{
          height: virtualizer.getTotalSize(),
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <HomeResourceList
          resources={list}
          virtualList={items}
          virtualizer={virtualizer}
          hasMore={hasMore}
          type="recommend"
        />
      </div>
      {isLoading && hasMore && (
        <div className="mt-12">
          <PostSkeleton />
        </div>
      )}
    </div>
  )
})

export default RecommendList
