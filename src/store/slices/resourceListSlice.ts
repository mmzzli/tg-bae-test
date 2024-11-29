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
  width?: number | string
  height?: number | string
  pic_width?: string
  pic_height?: string
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
const MAX_FRAGMENTS = 1

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
  loadFullVideo: (video: FormatterListItem) => void

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
        Reflect.deleteProperty(item, 'hls')
        console.log(`销毁视频 ID: ${item?.id}`)
      })

      return { cacheVideo: updatedCacheVideo }
    })
  },
  // 根据当前索引更新缓存池
  updateCache: (videoList) => {
    const { cacheVideoIndex, cacheVideo } = get()
    if (cacheVideoIndex === -1 || videoList.length === 0) return
    const currentIndex = videoList.findIndex((video) => video.id === cacheVideoIndex)

    if (currentIndex === -1) return
    const mid = Math.floor(CACHE_VIDEOS_LIMIT / 2)
    const start = Math.max(0, Number(currentIndex) - mid)
    const end =
      start === 0
        ? CACHE_VIDEOS_LIMIT
        : Math.min(videoList.length, Number(cacheVideoIndex) + mid + 1)

    const newCache = videoList.slice(start, end)

    // 加载新的视频

    newCache
      .map((video, index) => {
        if (cacheVideoIndex <= 0) {
          return {
            video,
            priority: index,
          }
        }
        if (cacheVideoIndex === videoList[videoList.length - 1].id) {
          return {
            video,
            priority: videoList.length - index,
          }
        }
        return {
          video,
          priority: Math.abs(index - Math.floor(newCache.length / 2)),
        }
      })
      .sort((a, b) => a.priority - b.priority) // 按优先级从低到高排序
      .forEach(({ video }) => {
        if (!cacheVideo.some((v) => v.id === video.id)) {
          console.log(video.id, 'jacob========= video-load--------')
          if (video.id === cacheVideoIndex) {
            get().loadFullVideo(video)
          } else {
            get().loadVideo(video) // 按优先级加载
          }
        }
      })

    // 卸载不再需要的视频

    cacheVideo.forEach((video) => {
      if (!newCache.some((v) => v.id === video.id)) {
        const unloadVideo = videoList.find((item) => item.id === video.id)
        unloadVideo && get().unloadVideo(unloadVideo)
        Reflect.deleteProperty(video, 'hls')
      }
    })

    // 更新缓存池
    const newCacheVideo: any[] = newCache.map((item) => ({
      id: item.id,
      meta: item.media[0],
    }))
    set({ cacheVideo: newCacheVideo })
  },

  loadFullVideo: (video) => {
    const medias = video?.media[0]
    if (!medias) {
      console.error('Media not found for video:', video)
      return
    }

    const media = medias.split(',').find((item) => item.endsWith('.m3u8'))
    if (!media) {
      console.error('No valid m3u8 media found for video:', video)
      return
    }
    const hls = new Hls({
      startPosition: 0, // 从视频开始播放
      maxBufferLength: 2, // 缓存最多 2 秒内容
      enableWorker: true,
      maxMaxBufferLength: 5,
      autoStartLoad: true,
      maxBufferHole: 0.5,
      lowLatencyMode: true,
      maxBufferSize: 10 * 1024 * 1024, // 最大缓冲区大小，限制为 5MB
    })
    const tempVideo = document.createElement('video')
    hls.loadSource(media)
    hls.attachMedia(tempVideo)
  },

  // 加载视频
  loadVideo: (() => {
    const videoLoadQueue: FormatterListItem[] = [] // 视频加载队列
    let isLoading = false
    let loadedFragments = 0

    const processQueue = () => {
      if (isLoading || videoLoadQueue.length === 0) return
      isLoading = true

      const video = videoLoadQueue.shift()
      if (!video) {
        isLoading = false
        return
      }

      const medias = video?.media[0]
      if (!medias) {
        console.error('Media not found for video:', video)
        isLoading = false
        processQueue()
        return
      }

      const media = medias.split(',').find((item) => item.endsWith('.m3u8'))
      if (!media) {
        console.error('No valid m3u8 media found for video:', video)
        isLoading = false
        processQueue()
        return
      }

      const hls = new Hls({
        startPosition: 0, // 从视频开始播放
        maxBufferLength: 2, // 缓存最多 2 秒内容
        enableWorker: true,
        maxMaxBufferLength: 5,
        autoStartLoad: true,
        maxBufferHole: 0.5,
        lowLatencyMode: true,
        maxBufferSize: 10 * 1024 * 1024, // 最大缓冲区大小，限制为 5MB
      })

      const tempVideo = document.createElement('video')
      hls.loadSource(media)
      hls.attachMedia(tempVideo)

      // 监听分片加载完成事件
      hls.on(Hls.Events.FRAG_LOADED, () => {
        loadedFragments++
        console.log(`Loaded fragment ${loadedFragments}/${MAX_FRAGMENTS}`)
      })
      // 分片加载事件监听
      hls.on(Hls.Events.FRAG_LOADING, (event, data) => {
        if (loadedFragments >= MAX_FRAGMENTS) {
          console.log(`Reached fragment limit (${MAX_FRAGMENTS}), stopping further loading.`)
          hls.stopLoad() // 停止后续分片加载
          isLoading = false
          processQueue()
        }
      })

      // 视频加载完成处理
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log(`Video ${video.id} loaded successfully.`)
        video.hls = hls // 将 HLS 实例绑定到 video 对象
        isLoading = false
        processQueue()
      })
      //
      // 销毁事件
      hls.on(Hls.Events.DESTROYING, () => {
        console.log(`Destroying video ${video.id}`)
        hls.stopLoad()
        Reflect.deleteProperty(video, 'hls')
        isLoading = false
        processQueue()
      })
      //
      // 错误处理
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error(`Error loading video ${video.id}:`, data)
        isLoading = false
        Reflect.deleteProperty(video, 'hls')
        processQueue()
      })

      video.hls = hls
      console.log(`Starting to load video ${video.id}`)
    }

    // 外部调用入口
    return (video: FormatterListItem) => {
      console.log(video)
      videoLoadQueue.push(video)
      processQueue()
    }
  })(),

  // 卸载视频
  unloadVideo: (video) => {
    video.hls?.destroy?.()
    Reflect.deleteProperty(video, 'hls')
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
