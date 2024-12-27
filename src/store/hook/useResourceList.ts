import { useEffect, useRef, useState } from 'react'
import { shallow } from 'zustand/shallow'
import { useStore } from '../store'
import { throttle } from '@/utils/utils'
import { FormatterListItem } from '@/store/slices/resourceListSlice'
import { videoHls } from '@/utils/video/videoHls'
import { useActivate, useUnactivate } from 'react-activation'

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
  // const [isInitialRender, setIsInitialRender] = useState(page == 1 ? -1 : page)

  useEffect(() => {
    if (!token) return
    // console.log('fetchMoreData2 isInitialRender', isInitialRender)
    // if (isInitialRender === page) return
    loadRecommendList(page)
    // setIsInitialRender(page)
  }, [page, token])

  const fetchMoreData = () => {
    // 为什么这边拿不到最新的数据 是有闭包么？
    if (!isLoading && useStore.getState().recommendList.hasMore) {
      setRecommendPage(useStore.getState().recommendList.page + 1)
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

export const useAllFeaturedList = () => {
  const { allFeaturedList, setAllFeaturedPage, loadAllFeaturedList, resetAllFeaturedList, token } =
    useStore(
      (state) => ({
        allFeaturedList: state.allFeaturedList,
        setAllFeaturedPage: state.setAllFeaturedPage,
        loadAllFeaturedList: state.loadAllFeaturedList,
        resetAllFeaturedList: state.resetAllFeaturedList,
        token: state.token,
      }),
      shallow
    )

  const { list, page, hasMore, isLoading, error } = allFeaturedList
  const [isInitialRender, setIsInitialRender] = useState(page == 1 ? -1 : page)

  useEffect(() => {
    if (!token) return
    if (isInitialRender === page) return
    loadAllFeaturedList(page)
    setIsInitialRender(page)
  }, [page, token])

  const fetchMoreData = () => {
    if (!isLoading && useStore.getState().allFeaturedList.hasMore) {
      setAllFeaturedPage(useStore.getState().allFeaturedList.page + 1)
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
      resetAllFeaturedList()
      loadAllFeaturedList(1)
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
  cardClass: string = 'video-card',
  random = 0
) => {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const videos = list.filter((item) => item.type === 0)
  let mostVisibleElement: HTMLElement | null = null

  const getVisibleElements = () => {
    const container = document.getElementById(domId)
    const elements = container?.querySelectorAll(`.${cardClass}`)
    if (!elements) return []

    const visibleElements: HTMLElement[] = []

    elements.forEach((element) => {
      const rect = element.getBoundingClientRect()
      const containerRect = container?.getBoundingClientRect()

      if (!containerRect) return

      // 计算元素在视口中的可见比例
      const visibleHeight =
        Math.min(rect.bottom, containerRect.bottom) - Math.max(rect.top, containerRect.top)
      const visibleRatio = visibleHeight / rect.height

      // 如果元素可见比例大于50%,认为它在视口中
      if (visibleRatio > 0.5) {
        visibleElements.push(element as HTMLElement)
      }
    })

    return visibleElements
  }

  const handleScroll = throttle(() => {
    const visibleElements: HTMLElement[] = getVisibleElements()
    // console.log('当前可见元素:', visibleElements)
    // 如果没有完全可见的元素,再检查部分可见的元素
    // if (!visibleElements) {
    //   entries.forEach((entry) => {
    //     const rect = entry.boundingClientRect
    //     const containerRect = entry.rootBounds

    //     if (!containerRect) return

    //     // 检查元素顶部是否过了容器中点
    //     const isPastMidpoint = rect.top < containerRect.top + containerRect.height / 2

    //     // 计算元素在容器内的可见面积比例
    //     const visibleHeight =
    //       Math.min(rect.bottom, containerRect.bottom) - Math.max(rect.top, containerRect.top)
    //     const visibleRatio = visibleHeight / rect.height

    //     // 只有当元素顶部过了容器中点,且可见比例大于当前最大可见比例时才更新
    //     if (isPastMidpoint && visibleRatio > maxVisibility) {
    //       maxVisibility = visibleRatio
    //       mostVisibleElement = entry.target as HTMLElement
    //     }
    //   })
    // }

    // 如果找到了需要播放的元素
    if (visibleElements.length) {
      const videoIdStr = visibleElements[0].getAttribute('data-id')
      if (videoIdStr) {
        const currentId = parseInt(videoIdStr, 10)

        // 更新状态
        setCacheVideoIndex(currentId)
        updateCache(videos)

        // 找到对应的视频数据并播放
        const videoCard = videos.find((item) => item.id === currentId)
        if (videoCard) {
          videoHls(videoCard, visibleElements[0])
        }
      }
    } else {
      const defaultVideo = document.getElementById('default-video-player')
      if (defaultVideo) {
        defaultVideo.parentNode?.removeChild(defaultVideo)
      }
    }
  }, 100)

  const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    let maxVisibility = 0

    // 首先检查完全在视图内的元素
    for (const entry of entries) {
      if (entry.intersectionRatio === 1) {
        mostVisibleElement = entry.target as HTMLElement
        break // 找到完全可见的就直接跳出循环
      }
    }

    console.warn('handleIntersection mostVisibleElement', mostVisibleElement)

    // 如果没有完全可见的元素,再检查部分可见的元素
    if (!mostVisibleElement) {
      entries.forEach((entry) => {
        const rect = entry.boundingClientRect
        const containerRect = entry.rootBounds

        if (!containerRect) return

        // 检查元素顶部是否过了容器中点
        const isPastMidpoint = rect.top < containerRect.top + containerRect.height / 2

        // 计算元素在容器内的可见面积比例
        const visibleHeight =
          Math.min(rect.bottom, containerRect.bottom) - Math.max(rect.top, containerRect.top)
        const visibleRatio = visibleHeight / rect.height

        // 只有当元素顶部过了容器中点,且可见比例大于当前最大可见比例时才更新
        if (isPastMidpoint && visibleRatio > maxVisibility) {
          maxVisibility = visibleRatio
          mostVisibleElement = entry.target as HTMLElement
        }
      })
    }

    // 如果找到了需要播放的元素
    if (mostVisibleElement) {
      const videoIdStr = mostVisibleElement.getAttribute('data-id')
      if (videoIdStr) {
        const currentId = parseInt(videoIdStr, 10)

        // 更新状态
        setCacheVideoIndex(currentId)
        updateCache(videos)

        // 找到对应的视频数据并播放
        const videoCard = videos.find((item) => item.id === currentId)
        if (videoCard) {
          videoHls(videoCard, mostVisibleElement)
        }
      }
    }
  }

  const findMostVisibleElement = () => {
    const container = document.getElementById(domId)
    console.log('****', container)
    const elements = container?.querySelectorAll(`.${cardClass}`)
    if (!elements) return null

    let maxVisibility = 0
    let mostVisible: HTMLElement | null = null

    elements.forEach((element) => {
      const rect = element.getBoundingClientRect()
      const containerRect = container?.getBoundingClientRect()

      if (!containerRect) return

      // 计算元素在容器内的可见面积比例
      const visibleHeight =
        Math.min(rect.bottom, containerRect.bottom) - Math.max(rect.top, containerRect.top)
      const visibleRatio = visibleHeight / rect.height

      if (visibleRatio > maxVisibility) {
        maxVisibility = visibleRatio
        mostVisible = element as HTMLElement
      }
    })

    return mostVisible
  }

  useActivate(() => {
    const visibleElement = findMostVisibleElement() as any
    console.log('active----->', visibleElement)
    if (!visibleElement) return
    const videoIdStr = visibleElement.getAttribute('data-id')
    if (videoIdStr) {
      const currentId = parseInt(videoIdStr, 10)
      // 更新状态
      setCacheVideoIndex(currentId)

      // 找到对应的视频数据并播放
      const videoCard = videos.find((item) => item.id === currentId)
      console.log('uncle--->', videoCard)
      if (videoCard) {
        videoHls(videoCard, visibleElement)
      }
    }
  })

  useUnactivate(() => {
    console.log('unactive----->', 222)
  })

  useEffect(() => {
    if (!list.length) return
    console.log(333333, '========jacob')
    // 初始化 Intersection Observer
    // observerRef.current = new IntersectionObserver(handleIntersection, {
    //   root: document.getElementById(domId),
    //   threshold: [0.5, 0.75, 1.0],
    //   rootMargin: '0px',
    // })
    let container = document.getElementById(domId)

    // 使用定时器等待元素渲染1
    const checkElements = (retryCount = 0) => {
      if (retryCount >= 50) {
        console.warn('检查元素超时，已停止重试')
        return
      }

      const container = document.getElementById(domId)
      const elements = container?.querySelectorAll(`.${cardClass}`)

      container?.addEventListener('scroll', handleScroll)

      if (container && elements && elements.length > 0) {
        console.log('elements.forEach..')
        elements.forEach((element) => {
          observerRef.current?.observe(element)
        })
      } else {
        setTimeout(() => checkElements(retryCount + 1), 200)
      }
    }

    checkElements()

    return () => {
      observerRef.current?.disconnect()
      container?.removeEventListener('scroll', handleScroll)
    }
  }, [domId, cardClass, list, random])

  useEffect(() => {
    if (page === 1 && list.length) {
      const videos = list.filter((item) => item.type === 0)
      try {
        setCacheVideoIndex(videos[0]?.id) // 初始���设置缓存视频索引
        updateCache(videos) // 初始时更新缓存
      } catch (error) {}
    }
  }, [page, list])

  useEffect(() => {
    const videos = list.filter((item) => item.type === 0)
    if (videos.length && page !== 1) {
      updateCache(videos) // 当 `list` 或 `getCacheVideoindex` 改变时更新缓存
    }
  }, [list, getCacheVideoindex, page])
}

export default useCacheVideo
