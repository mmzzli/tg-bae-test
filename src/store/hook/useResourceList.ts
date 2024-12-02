import { useEffect, useRef, useState } from 'react'
import { shallow } from 'zustand/shallow'
import { useStore } from '../store'
import { debounce, throttle } from '@/utils/utils'
import { FormatterListItem } from '@/store/slices/resourceListSlice'

export const useRecommendList = () => {
  const { recommendList, setRecommendPage, loadRecommendList, resetRecommendList, token } =
    useStore(
      (state) => ({
        recommendList: state.recommendList,
        setRecommendPage: state.setRecommendPage,
        loadRecommendList: state.loadRecommendList,
        resetRecommendList: state.resetRecommendList,
        token: state.token,
      }),
      shallow
    )

  const { list, page, hasMore, isLoading, error } = recommendList
  const [isInitialRender, setIsInitialRender] = useState(page == 1 ? -1 : page)

  useEffect(() => {
    if (!token) return
    if (isInitialRender === page) return
    loadRecommendList(page)
    setIsInitialRender(page)
  }, [page, token])

  const fetchMoreData = () => {
    if (!isLoading && hasMore) {
      setRecommendPage(page + 1)
    }
  }

  return {
    list,
    page,
    hasMore,
    isLoading,
    error,
    fetchMoreData,
    refresh: () => {
      resetRecommendList()
      loadRecommendList(1)
    },
  }
}

export const useViewList = () => {
  const { viewList, setViewPage, loadViewList, resetViewList, token } = useStore(
    (state) => ({
      viewList: state.viewList,
      setViewPage: state.setViewPage,
      loadViewList: state.loadViewList,
      resetViewList: state.resetViewList,
      token: state.token,
    }),
    shallow
  )

  const { list, page, hasMore, isLoading, error } = viewList
  const [isInitialRender, setIsInitialRender] = useState(page == 1 ? -1 : page)

  useEffect(() => {
    if (!token) return
    if (isInitialRender === page) return
    loadViewList(page)
    setIsInitialRender(page)
  }, [page, token])

  // useEffect(() => {
  //   return () => {
  //     resetViewList()
  //   }
  // }, [])

  const fetchMoreData = () => {
    if (!isLoading && hasMore) {
      setViewPage(page + 1)
    }
  }

  return {
    list,
    page,
    hasMore,
    isLoading,
    error,
    fetchMoreData,
    refresh: () => {
      resetViewList()
      loadViewList(1)
    },
  }
}

export const useFavList = () => {
  const { favList, setFavPage, loadFavList, resetFavList, token, setFavList, setFavHasMore } =
    useStore(
      (state) => ({
        favList: state.favList,
        setFavPage: state.setFavPage,
        loadFavList: state.loadFavList,
        resetFavList: state.resetFavList,
        setFavList: state.setFavList,
        setFavHasMore: state.setFavHasMore,
        token: state.token,
      }),
      shallow
    )

  const { list, page, hasMore, isLoading, error } = favList

  useEffect(() => {
    if (!token) return
    loadFavList(page)
  }, [page, token])

  const fetchMoreData = () => {
    if (!isLoading && hasMore) {
      setFavPage(page + 1)
    }
  }

  return {
    list,
    page,
    hasMore,
    isLoading,
    error,
    fetchMoreData,
    refresh: () => {
      resetFavList()
      loadFavList(1)
    },
    initialize: () => {
      setFavList([])
      setFavHasMore(true)
    },
  }
}
export const useOrdersList = () => {
  const { orderList, setOrderPage, loadOrderList, resetOrderList, token } = useStore(
    (state) => ({
      orderList: state.orderList,
      setOrderPage: state.setOrderPage,
      loadOrderList: state.loadOrderList,
      resetOrderList: state.resetOrderList,
      token: state.token,
    }),
    shallow
  )

  const { list, page, hasMore, isLoading, error } = orderList

  useEffect(() => {
    if (!token) return
    loadOrderList(page)
  }, [page, token])

  const fetchMoreData = () => {
    if (!isLoading && hasMore) {
      loadOrderList(page + 1)
    }
  }

  return {
    list,
    page,
    hasMore,
    isLoading,
    error,
    fetchMoreData,
    refresh: () => {
      resetOrderList()
      loadOrderList(1)
    },
  }
}

export const useOthersViewList = () => {
  const {
    othersUserInfo,
    othersViewList,
    setOthersViewPage,
    loadOthersViewList,
    resetOthersViewList,
    token,
  } = useStore(
    (state) => ({
      othersUserInfo: state.othersUserInfo,
      othersViewList: state.othersViewList,
      setOthersViewPage: state.setOthersViewPage,
      loadOthersViewList: state.loadOthersViewList,
      resetOthersViewList: state.resetOthersViewList,
      token: state.token,
    }),
    shallow
  )

  const { list, page, hasMore, isLoading, error } = othersViewList

  useEffect(() => {
    if (!token) return
    if (othersUserInfo.uid == -1) return
    loadOthersViewList(page)
  }, [page, token, othersUserInfo.uid])

  // useEffect(() => {
  //   return () => {
  //     resetOthersViewList()
  //   }
  // }, [])

  // useEffect(() => {
  //   console.log('othersUserInfo.uid', othersUserInfo.uid)
  //   if (othersUserInfo.uid != -1) {
  //     resetOthersViewList()
  //     loadOthersViewList(page)
  //   }
  // }, [othersUserInfo.uid])

  const fetchMoreData = () => {
    if (!isLoading && hasMore) {
      setOthersViewPage(page + 1)
    }
  }

  return {
    list,
    page,
    hasMore,
    isLoading,
    error,
    fetchMoreData,
    refresh: () => {
      resetOthersViewList()
      loadOthersViewList(1)
    },
  }
}

export const useSharedList = () => {
  const { sharedPostList, setSharedPostList, resetSharedPostList } = useStore(
    (state) => ({
      sharedPostList: state.sharedPostList,
      setSharedPostList: state.setSharedPostList,
      resetSharedPostList: state.resetSharedPostList,
    }),
    shallow
  )

  return {
    sharedPostList,
    setSharedPostList,
    resetSharedPostList,
  }
}

const useCacheVideo = (
  list: FormatterListItem[], // 视频列表
  page: number, // 当前页码
  setCacheVideoIndex: (index: number) => void, // 更新缓存视频索引的函数
  getCacheVideoindex: number | string, // 当前缓存视频索引
  updateCache: (videos: FormatterListItem[]) => void, // 更新缓存的函数
  domId: string,
  cardClass: string = 'video-card'
) => {
  const handleScroll = throttle(() => {
    const videos = list.filter((item) => item.type === 0) // 过滤出视频类型

    const container = document.getElementById(`${domId}`)
    if (container) {
      const elements = container.querySelectorAll(`.${cardClass}`) // 获取需要监听的元素
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
      if (visibleItems.length > 0) {
        setCacheVideoIndex(visibleItems[Math.floor(visibleItems.length / 2)]) // 更新缓存视频索引
        updateCache(videos) // 更新缓存
      }
    }
  }, 300)

  useEffect(() => {
    if (page === 1 && list.length) {
      const videos = list.filter((item) => item.type === 0)
      setCacheVideoIndex(videos[0].id) // 初始时设置缓存视频索引
      updateCache(videos) // 初始时更新缓存
    }
  }, [page, list])

  useEffect(() => {
    const videos = list.filter((item) => item.type === 0)
    if (videos.length && page !== 1) {
      updateCache(videos) // 当 `list` 或 `getCacheVideoindex` 改变时更新缓存
    }
  }, [list, getCacheVideoindex, page])

  useEffect(() => {
    const scrollableDiv = document.getElementById(`${domId}`)
    if (scrollableDiv) {
      scrollableDiv.addEventListener('scroll', handleScroll) // 监听滚动事件
    }
    return () => {
      if (scrollableDiv) scrollableDiv.removeEventListener('scroll', handleScroll) // 移除滚动监听
    }
  }, [])
}

export default useCacheVideo
