import { StateCreator } from 'zustand'
import { ListItem, UserItem } from '../../types'
import { getRecommendMedia } from '../../api/list'
import { favList, getUsersPosts, ordersList, viewList } from '@/api'
import { useStore } from '../store'
import Hls from 'hls.js'

export type ListType = 'recommend' | 'view'

export interface BaseListState {
  list: FormatterListItem[]
  page: number
  hasMore: boolean
  isLoading: boolean
  error: string | null
}

export interface ResourceListState {
  recommend: BaseListState
  view: BaseListState
}

export type FormatterListItem = Omit<ListItem['post'], 'media'> & {
  media: string[]
  mediaCover?: string
  thumbnail?: string
  duration?: number
  hls?: Hls
} & UserItem
export interface ListState {
  list: FormatterListItem[]
  page: number
  hasMore: boolean
  isLoading: boolean
  error: string | null
}

export interface CacheVideo {
  id: string | number
  media: string
}
const recordsNum = 30
const CACHE_VIDEOS_LIMIT = 29

export interface ResourceListSlice {
  // recommend
  recommendList: BaseListState
  setRecommendPage: (page: number) => void
  setRecommendList: (list: FormatterListItem[], merge?: boolean) => void
  setRecommendLoading: (isLoading: boolean) => void
  setRecommendError: (error: string | null) => void
  setRecommendHasMore: (hasMore: boolean) => void
  resetRecommendList: () => void
  loadRecommendList: (page: number) => Promise<void>

  // cache
  cacheVideoIndex: number | string
  setCacheVideoIndex: (index: number | string) => void
  cacheVideo: CacheVideo[]
  setCacheVideo: (video: CacheVideo | CacheVideo[], flag?: boolean) => void // true is scroll down  false is scroll up
  updateCache: (cacheVideo: FormatterListItem[]) => void
  loadVideo: (video: FormatterListItem) => void
  unloadVideo: (video: FormatterListItem) => void

  // view
  viewList: BaseListState
  setViewPage: (page: number) => void
  setViewList: (list: FormatterListItem[], merge?: boolean) => void
  setViewLoading: (isLoading: boolean) => void
  setViewError: (error: string | null) => void
  setViewHasMore: (hasMore: boolean) => void
  resetViewList: () => void
  deleteViewList: (item: FormatterListItem) => void
  loadViewList: (page: number) => Promise<void>
  resetAllLists: () => void

  // Fav
  favList: BaseListState
  setFavPage: (page: number) => void
  setFavList: (list: FormatterListItem[], merge?: boolean) => void
  setFavLoading: (isLoading: boolean) => void
  resetFavList: () => void
  loadFavList: (page: number) => Promise<void>
  setFavError: (error: string | null) => void
  setFavHasMore: (hasMore: boolean) => void

  // order
  orderList: BaseListState
  setOrderPage: (page: number) => void
  setOrderList: (list: FormatterListItem[], merge?: boolean) => void
  setOrderLoading: (isLoading: boolean) => void
  resetOrderList: () => void
  loadOrderList: (page: number) => Promise<void>
  setOrderError: (error: string | null) => void
  setOrderHasMore: (hasMore: boolean) => void

  // others view
  othersViewList: BaseListState
  setOthersViewPage: (page: number) => void
  setOthersViewList: (list: FormatterListItem[], merge?: boolean) => void
  setOthersViewLoading: (isLoading: boolean) => void
  setOthersViewError: (error: string | null) => void
  setOthersViewHasMore: (hasMore: boolean) => void
  resetOthersViewList: () => void
  loadOthersViewList: (page: number) => Promise<void>

  sharedPostList: FormatterListItem[]
  setSharedPostList: (list: ListItem[]) => void
  resetSharedPostList: () => void
}

const initialListState: BaseListState = {
  list: [],
  page: 1,
  hasMore: true,
  isLoading: false,
  error: null,
}

export const createResourceListSlice: StateCreator<ResourceListSlice> = (set, get) => ({
  recommendList: { ...initialListState },
  setRecommendPage: (page) =>
    set((state) => ({
      recommendList: {
        ...state.recommendList,
        page,
      },
    })),
  setRecommendList: (newList, merge = false) =>
    set((state) => ({
      recommendList: {
        ...state.recommendList,
        list: merge ? [...state.recommendList.list, ...newList] : newList,
      },
    })),
  setRecommendLoading: (isLoading) =>
    set((state) => ({
      recommendList: {
        ...state.recommendList,
        isLoading,
      },
    })),
  setRecommendError: (error) =>
    set((state) => ({
      recommendList: {
        ...state.recommendList,
        error,
      },
    })),
  setRecommendHasMore: (hasMore) =>
    set((state) => ({
      recommendList: {
        ...state.recommendList,
        hasMore,
      },
    })),
  resetRecommendList: () =>
    set(() => ({
      recommendList: { ...initialListState },
    })),
  loadRecommendList: async (page) => {
    try {
      get().setRecommendLoading(true)
      get().setRecommendError(null)

      const { posts } = await getRecommendMedia({
        page_num: page,
        records: recordsNum,
      })

      const hasMore = posts.length === recordsNum
      const updatedPosts = posts.map(({ post, user }: ListItem) => ({
        ...user,
        ...post,
        media:
          post.type === 1 && typeof post.media === 'string' ? post.media.split(',') : [post.media],
      }))

      get().setRecommendList(updatedPosts, page > 1)
      get().setRecommendHasMore(hasMore)
    } catch (error) {
      get().setRecommendError(error instanceof Error ? error.message : 'Loading Failed')
      get().setRecommendHasMore(false)
    } finally {
      get().setRecommendLoading(false)
    }
  },

  // CACHE VIDEO
  cacheVideoIndex: -1,
  setCacheVideoIndex: (index) => {
    set((_) => {
      return {
        cacheVideoIndex: index,
      }
    })
  },
  cacheVideo: [],
  setCacheVideo: (cacheVideo, flag = true) => {
    set((state) => {
      // 确保处理的是数组
      const videosToAdd = Array.isArray(cacheVideo) ? cacheVideo : [cacheVideo]
      let updatedCacheVideo = [...state.cacheVideo]
      let destroyedItems: any[] = []

      videosToAdd.forEach((video) => {
        const hasVideo = updatedCacheVideo.some((item) => item.id === video.id)
        if (!hasVideo) {
          updatedCacheVideo.push(video)

          // 检查是否超出缓存限制
          if (updatedCacheVideo.length > CACHE_VIDEOS_LIMIT) {
            if (flag) {
              // Scroll down: 移除最后的视频
              destroyedItems = updatedCacheVideo.slice(-1)
              updatedCacheVideo = updatedCacheVideo.slice(0, -1)
            } else {
              // Scroll up: 移除最前面的视频
              destroyedItems = updatedCacheVideo.slice(0, 1)
              updatedCacheVideo = updatedCacheVideo.slice(1)
            }
          }
        }
      })

      // 销毁移除的视频的 HLS 实例
      destroyedItems.forEach((item) => {
        item?.hls?.destroy?.()
        console.log(`销毁视频 ID: ${item?.id}`)
      })

      return { cacheVideo: updatedCacheVideo }
    })
  },
  // 根据当前索引更新缓存池
  updateCache: (videoList) => {
    const { cacheVideoIndex, cacheVideo } = get()
    console.log(cacheVideoIndex, 'jacob=======cacheVideoIndex========')
    if (cacheVideoIndex === -1 || videoList.length === 0) return
    const currentIndex = videoList.findIndex((video) => video.id === cacheVideoIndex)

    console.log(currentIndex, 'jacob====== currentIndex=======')

    if (currentIndex === -1) return
    const mid = Math.floor(CACHE_VIDEOS_LIMIT / 2)
    const start = Math.max(0, Number(currentIndex) - mid)
    const end =
      start === 0
        ? CACHE_VIDEOS_LIMIT
        : Math.min(videoList.length, Number(cacheVideoIndex) + mid + 1)

    console.log(videoList, end, 'jacob===== videoList')
    const newCache = videoList.slice(start, end)
    console.log(newCache, 'jacob======newcache====')

    // 加载新的视频
    newCache.forEach((video) => {
      if (!cacheVideo.some((v) => v.id === video.id)) {
        get().loadVideo(video)
      }
    })

    // 卸载不再需要的视频

    cacheVideo.forEach((video) => {
      if (!newCache.some((v) => v.id === video.id)) {
        const unloadVideo = videoList.find((item) => item.id === video.id)
        unloadVideo && get().unloadVideo(unloadVideo)
      }
    })

    // 更新缓存池
    const newCacheVideo: any[] = newCache.map((item) => ({
      id: item.id,
      meta: item.media[0],
    }))
    set({ cacheVideo: newCacheVideo })
  },

  // 加载视频
  loadVideo: (video) => {
    const videoLoadQueue: FormatterListItem[] = []
    let isloading = false
    videoLoadQueue.push(video)

    const processQueue = () => {
      if (isloading || videoLoadQueue.length === 0) return
      isloading = true

      const video = videoLoadQueue.shift()
      const medias = video?.media[0]
      if (!medias) return
      // 把视频分割出来
      const media = medias.split(',').find((item) => item.endsWith('.m3u8'))
      if (!media) return
      const hls = new Hls({
        startPosition: 0, // 从视频开始播放
        maxBufferLength: 3, // 缓存最多 2 秒内容
        maxBufferSize: 10 * 1024 * 1024, // 最大缓冲区大小，限制为 10MB
      })

      const tempVideo = document.createElement('video')

      hls.loadSource(media) // 加载视频源
      hls.attachMedia(tempVideo)

      // 监听事件，确保只加载前 2 秒的分片
      hls.on(Hls.Events.FRAG_LOADING, (event, data) => {
        const fragStart = data.frag.start
        const fragEnd = data.frag.start + data.frag.duration

        // 如果分片超出了 2 秒，取消后续加载
        if (fragStart >= 2) {
          console.log(`jacob======取消加载分片，起始时间: ${fragStart}`)
          hls.stopLoad() // 停止后续加载
          isloading = false
          processQueue()
        }
      })

      // 视频加载完成后处理下一个
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log(`jacob======加载视频 ${video.id}`)
        video.hls = hls // 将 HLS 实例绑定到 video 对象
        isloading = false
        processQueue()
      })

      // 错误处理
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error(`jacob======视频加载错误 ${video.id}:`, data)
        isloading = false
        processQueue()
      })

      video.hls = hls // 将 HLS 实例绑定到 video 对象
      console.log(`jacob======加载视频 ${video.id}`)
    }
    processQueue()
  },

  // 卸载视频
  unloadVideo: (video) => {
    video.hls?.destroy?.()
    console.log(`jacob======卸载视频 ${video.id}`)
  },
  viewList: { ...initialListState },
  setViewPage: (page) =>
    set((state) => ({
      viewList: {
        ...state.viewList,
        page,
      },
    })),
  setViewList: (newList, merge = false) =>
    set((state) => ({
      viewList: {
        ...state.viewList,
        list: merge ? [...state.viewList.list, ...newList] : newList,
      },
    })),
  setViewLoading: (isLoading) =>
    set((state) => ({
      viewList: {
        ...state.viewList,
        isLoading,
      },
    })),
  setViewError: (error) =>
    set((state) => ({
      viewList: {
        ...state.viewList,
        error,
      },
    })),
  setViewHasMore: (hasMore) =>
    set((state) => ({
      viewList: {
        ...state.viewList,
        hasMore,
      },
    })),
  deleteViewList: (item) =>
    set((state) => ({
      viewList: {
        ...state.viewList,
        list: state.viewList.list.filter((view) => view.id !== item.id),
      },
    })),
  resetViewList: () =>
    set(() => ({
      viewList: { ...initialListState },
    })),
  loadViewList: async (page) => {
    try {
      get().setViewLoading(true)
      get().setViewError(null)
      const { posts } = await viewList({
        page_num: page,
        records: recordsNum,
      })
      const hasMore = posts.length === recordsNum

      const updatedPosts = posts.map(({ post, user }) => ({
        ...user,
        ...post,
        media:
          post.type === 1 && typeof post.media === 'string' ? post.media.split(',') : [post.media],
      }))
      get().setViewList(updatedPosts, page > 1)
      get().setViewHasMore(hasMore)
    } catch (error) {
      get().setViewError(error instanceof Error ? error.message : 'Loading Failed')
      get().setViewHasMore(false)
    } finally {
      get().setViewLoading(false)
    }
  },

  othersViewList: { ...initialListState },
  setOthersViewPage: (page) =>
    set((state) => ({
      othersViewList: {
        ...state.othersViewList,
        page,
      },
    })),
  setOthersViewList: (newList, merge = false) =>
    set((state) => ({
      othersViewList: {
        ...state.othersViewList,
        list: merge ? [...state.othersViewList.list, ...newList] : newList,
      },
    })),
  setOthersViewLoading: (isLoading) =>
    set((state) => ({
      othersViewList: {
        ...state.othersViewList,
        isLoading,
      },
    })),
  setOthersViewError: (error) =>
    set((state) => ({
      othersViewList: {
        ...state.othersViewList,
        error,
      },
    })),
  setOthersViewHasMore: (hasMore) =>
    set((state) => ({
      othersViewList: {
        ...state.othersViewList,
        hasMore,
      },
    })),
  resetOthersViewList: () =>
    set(() => ({
      othersViewList: { ...initialListState },
    })),
  loadOthersViewList: async (page) => {
    try {
      const othersUserInfo = useStore.getState().othersUserInfo
      if (othersUserInfo.uid === -1) return
      get().setOthersViewLoading(true)
      get().setOthersViewError(null)
      const { posts } = await getUsersPosts({
        page_num: page,
        records: recordsNum,
        uid: othersUserInfo.uid,
      })
      const hasMore = posts.length === recordsNum
      const updatedPosts = posts.map((post) => ({
        ...post,
        ...othersUserInfo,
        media:
          post.type === 1 && typeof post.media === 'string' ? post.media.split(',') : [post.media],
      }))
      get().setOthersViewList(updatedPosts, page > 1)
      get().setOthersViewHasMore(hasMore)
    } catch (error) {
      get().setOthersViewError(error instanceof Error ? error.message : 'Loading Failed')
      get().setOthersViewHasMore(false)
    } finally {
      get().setOthersViewLoading(false)
    }
  },

  sharedPostList: [],
  setSharedPostList: (posts) => {
    const updatedPosts = posts.map(({ post, user }: ListItem) => ({
      ...user,
      ...post,
      media:
        post.type === 1 && typeof post.media === 'string' ? post.media.split(',') : [post.media],
    }))
    set(() => ({
      sharedPostList: updatedPosts,
    }))
  },
  resetSharedPostList: () =>
    set(() => ({
      sharedPostList: [],
    })),

  resetAllLists: () =>
    set({
      recommendList: { ...initialListState },
      viewList: { ...initialListState },
    }),

  // fav
  favList: { ...initialListState },
  loadFavList: async (page) => {
    try {
      get().setFavLoading(true)
      get().setFavError(null)
      const { posts } = await favList({
        page_num: page,
        records: recordsNum,
      })
      const hasMore = posts.length === recordsNum

      const updatedPosts = posts.map(({ post, user }) => ({
        ...user,
        ...post,
        media:
          post.type === 1 && typeof post.media === 'string' ? post.media.split(',') : [post.media],
      }))
      get().setFavList(updatedPosts, page > 1)
      get().setFavHasMore(hasMore)
    } catch (error) {
      get().setFavError(error instanceof Error ? error.message : 'Loading Failed')
      get().setFavHasMore(false)
    } finally {
      get().setFavLoading(false)
    }
  },
  setFavPage: (page) =>
    set((state) => ({
      favList: {
        ...state.favList,
        page,
      },
    })),
  resetFavList: () =>
    set(() => ({
      favList: { ...initialListState },
    })),
  setFavList: (newList, merge = false) =>
    set((state) => ({
      favList: {
        ...state.favList,
        list: merge ? [...state.favList.list, ...newList] : newList,
      },
    })),
  setFavLoading: (isLoading) =>
    set((state) => ({
      favList: {
        ...state.favList,
        isLoading,
      },
    })),
  setFavError: (error) =>
    set((state) => ({
      favList: {
        ...state.favList,
        error,
      },
    })),
  setFavHasMore: (hasMore) =>
    set((state) => ({
      favList: {
        ...state.favList,
        hasMore,
      },
    })),

  // order
  orderList: { ...initialListState },
  loadOrderList: async (page) => {
    try {
      get().setOrderLoading(true)
      get().setOrderError(null)
      console.log(123)
      const { posts } = await ordersList({
        page_num: page,
        records: recordsNum,
      })
      const hasMore = posts.length === recordsNum

      const updatedPosts = posts.map(({ post, user }) => ({
        ...user,
        ...post,
        media:
          post.type === 1 && typeof post.media === 'string' ? post.media.split(',') : [post.media],
      }))
      console.log(updatedPosts)
      get().setOrderList(updatedPosts, page > 1)
      get().setOrderHasMore(hasMore)
    } catch (error) {
      get().setOrderError(error instanceof Error ? error.message : 'Loading Failed')
      get().setOrderHasMore(false)
    } finally {
      get().setOrderLoading(false)
    }
  },
  setOrderPage: (page) =>
    set((state) => ({
      orderList: {
        ...state.orderList,
        page,
      },
    })),
  resetOrderList: () =>
    set(() => ({
      orderList: { ...initialListState },
    })),
  setOrderList: (newList, merge = false) =>
    set((state) => ({
      orderList: {
        ...state.orderList,
        list: merge ? [...state.orderList.list, ...newList] : newList,
      },
    })),
  setOrderLoading: (isLoading) =>
    set((state) => ({
      orderList: {
        ...state.orderList,
        isLoading,
      },
    })),
  setOrderError: (error) =>
    set((state) => ({
      orderList: {
        ...state.orderList,
        error,
      },
    })),
  setOrderHasMore: (hasMore) =>
    set((state) => ({
      orderList: {
        ...state.orderList,
        hasMore,
      },
    })),
})
