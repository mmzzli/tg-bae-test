import { Box } from '@chakra-ui/react'
import InfiniteScroll from 'react-infinite-scroll-component'
import ResourceList from '../ResourceList/ResourceList'
import { cn } from '@/utils/utils'
import { useRecommendList } from '@/store/hook/useResourceList'
import PostSkeleton from '../Skeketon/PostSkeleton'
import { useEffect, useRef, useState } from 'react'
import { useStore } from '@/store'
import { flushSync } from 'react-dom'

interface PostListProps {
  className?: string
}

const RecommendList = ({ className }: PostListProps) => {
  const { list, hasMore, fetchMoreData, page } = useRecommendList()
  const setCacheVideoIndex = useStore((state) => state.setCacheVideoIndex)
  const getCacheVideoindex = useStore((state) => state.cacheVideoIndex)
  const updateCache = useStore((state) => state.updateCache)
  // 滚动事件防抖处理
  const debounce = (func: (...args: any[]) => void, wait: number) => {
    let timeout: NodeJS.Timeout
    return (...args: any[]) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  }
  // 滚动事件处理逻辑
  const handleScroll = debounce(() => {
    const videos = list.filter((item) => item.type === 0)
    const container = document.getElementById('recommendScrollableDiv')
    if (container) {
      const elements = container.querySelectorAll('.video-card') // 获取需要监听的元素
      const visibleItems: number[] = []

      elements.forEach((element) => {
        const rect = element.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect() // 滚动容器的边界
        const isVisible =
          rect.bottom >= containerRect.top && // 元素底部在容器顶部以下
          rect.top <= containerRect.bottom // 元素顶部在容器底部以上

        if (isVisible) {
          const videoId = element.getAttribute('data-id')
          if (videoId) visibleItems.push(parseInt(videoId))
        }
      })

      console.log('JACOB Visible Items:', visibleItems) // 打印当前视口中的元素
      if (visibleItems.length > 0) {
        setCacheVideoIndex(visibleItems[Math.floor(visibleItems.length / 2)])
        updateCache(videos)
      }
    }
  }, 300)

  useEffect(() => {
    console.log('jacob===== page', page)
    if (page === 1 && list.length) {
      const videos = list.filter((item) => item.type === 0)

      setCacheVideoIndex(videos[0].id)
      updateCache(videos)
    }
  }, [page, list])

  useEffect(() => {
    const videos = list.filter((item) => item.type === 0)
    if (videos.length) {
      updateCache(videos)
    }
  }, [list, getCacheVideoindex])

  useEffect(() => {
    const scrollableDiv = document.getElementById('recommendScrollableDiv')
    if (scrollableDiv) {
      scrollableDiv.addEventListener('scroll', handleScroll) // 监听滚动事件
    }

    return () => {
      if (scrollableDiv) scrollableDiv.removeEventListener('scroll', handleScroll) // 移除滚动监听
    }
  }, [])

  return (
    <div className={cn(className, 'pb-24')}>
      <InfiniteScroll
        dataLength={list.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={
          <Box textAlign="center" m="20px 0" className="p-4">
            <PostSkeleton />
          </Box>
        }
        scrollableTarget="recommendScrollableDiv"
        scrollThreshold={0.1}
        style={{ overflow: 'visible' }}
      >
        <div id="view-container">
          <ResourceList resources={list} />
        </div>
      </InfiniteScroll>
    </div>
  )
}

export default RecommendList
