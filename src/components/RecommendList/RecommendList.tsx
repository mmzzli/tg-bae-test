import { forwardRef, useImperativeHandle, useRef } from 'react'
import HomeResourceList from '../ResourceList/HomeResourceList'
import useCacheVideo, { useRecommendList } from '@/store/hook/useResourceList'
import { useEffect, useState } from 'react'
import { useStore } from '@/store'
// import { useActivate } from 'react-activation'
import { useVirtualizer } from '@tanstack/react-virtual'

interface PostListProps {
  className?: string
  containerRef?: React.RefObject<HTMLDivElement>
}
interface ChildRef {
  refresh?: () => void
}

const RecommendList = forwardRef<ChildRef, PostListProps>((props, ref) => {
  const { containerRef } = props
  const { list: postList, hasMore, fetchMoreData, page, refresh } = useRecommendList()
  const setCacheVideoIndex = useStore((state) => state.setCacheVideoIndex)
  const getCacheVideoindex = useStore((state) => state.cacheVideoIndex)
  const updateCacheVideo = useStore((state) => state.updateCacheVideo)
  const [random, setRandom] = useState(0)
  useCacheVideo(
    postList,
    page,
    setCacheVideoIndex,
    getCacheVideoindex,
    updateCacheVideo,
    'recommendScrollableDiv',
    'video-card',
    random
  )

  // useEffect(() => {
  //   setRandom(Date.now())
  // }, [])

  const parentRef = containerRef || useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: postList.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 500,
    overscan: 5,
  })
  let items = virtualizer.getVirtualItems()
  // useActivate(() => {
  //   const defaultVideo = document.getElementById('default-video-player')
  //   if (defaultVideo) {
  //     defaultVideo.parentNode?.removeChild(defaultVideo)
  //   }
  //   setRandom(Date.now())
  // })

  useImperativeHandle(ref, () => ({
    refresh: () => refresh(),
  }))

  useEffect(() => {
    const container = containerRef?.current
    if (!container) return

    const handleContainerScroll = (e: Event) => {
      const target = e.target as HTMLDivElement
      const { scrollTop, clientHeight, scrollHeight } = target
      if (scrollHeight - scrollTop - clientHeight < 50 && hasMore) {
        fetchMoreData()
      }
    }

    container.addEventListener('scroll', handleContainerScroll)
    return () => {
      container.removeEventListener('scroll', handleContainerScroll)
    }
  }, [containerRef])
  return (
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
        resources={postList}
        virtualList={items}
        virtualizer={virtualizer}
        hasMore={hasMore}
        type="recommend"
      />
    </div>
  )
})

export default RecommendList
