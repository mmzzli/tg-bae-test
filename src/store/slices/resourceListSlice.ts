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
  loaded?: boolean
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

export interface imagePreview {
  images: string[]
  currentIndex: number
}
export interface followPreview {
  uid: number
  is_follow: boolean
  boll: boolean
}
const recordsNum = 10
const CACHE_VIDEOS_LIMIT = 9
const BUFFER_FRAGMENT_LIMIT = 1

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
  cacheVideo: FormatterListItem[]
  updateCacheVideo: (cacheVideo: FormatterListItem[]) => void
  loadVideo: (video: FormatterListItem) => void
  unloadVideo: (video: FormatterListItem) => void

  // video player
  videoResource: FormatterListItem | null
  setVideoResource: (video: FormatterListItem | null) => void

  // image Viewer
  imageResource: imagePreview | null
  setImageResource: (resource: imagePreview | null) => void
  setImageResourceIndex: (index: number) => void

  // Follow
  followResource: followPreview[] | null
  setFollowResource: (resource: followPreview | null) => void

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
  // 根据当前索引更新缓存池
  updateCacheVideo: (videoList) => {
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

    // 更新缓存池
    const newCacheVideo: FormatterListItem[] = newCache

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

    set({ cacheVideo: newCacheVideo })
  },
  // 加载视频
  loadVideo: (() => {
    const videoLoadQueue: FormatterListItem[] = [] // 视频加载队列
    let isLoading = false

    const processQueue = () => {
      if (isLoading || videoLoadQueue.length === 0) return
      isLoading = true

      const video = videoLoadQueue.shift()
      if (!video) {
        isLoading = false
        return
      }

      if (video.loaded) {
        isLoading = false
        processQueue()
        return
      }

      let loadedFragments = 0

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
        startPosition: 0,
        maxBufferLength: 2,
        enableWorker: true,
        maxMaxBufferLength: 5,
        autoStartLoad: true,
        maxBufferHole: 0.5,
        lowLatencyMode: false,
        maxBufferSize: 10 * 1024 * 1024,
      })

      let max_fragment_count = 0
      hls.loadSource(media)
      hls.attachMedia(document.createElement('video'))

      // 监听分片加载完成事件
      hls.on(Hls.Events.FRAG_LOADED, () => {
        loadedFragments++
        console.log(`视频 ${video.id} Loaded fragment ${loadedFragments} 分片加载完成`)
        if (loadedFragments >= Math.min(max_fragment_count, BUFFER_FRAGMENT_LIMIT)) {
          isLoading = false
          // hls.destroy()
          hls.stopLoad()
          processQueue()
          video.loaded = true
          video.hls = hls
        }
      })

      hls.on(Hls.Events.MANIFEST_LOADED, () => {
        console.log(`视频 ${video.id} 清单文件已加载完成。`)
      })

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        console.log(`视频 ${video.id} 流解析完成，开始缓存`)
      })

      hls.on(Hls.Events.LEVEL_LOADED, (event, data) => {
        const levelIndex = data.level
        const fragmentCount = data.details.fragments.length
        console.log(`视频${video.id} Level ${levelIndex} 分片数量: ${fragmentCount}`)
        max_fragment_count = fragmentCount
      })

      hls.on(Hls.Events.ERROR, (event, data) => {
        isLoading = false
        hls.destroy()
        video.loaded = false
        processQueue()
      })
    }

    return (video: FormatterListItem) => {
      videoLoadQueue.push(video)
      processQueue()
    }
  })(),
  // 卸载视频
  unloadVideo: (video) => {
    video.hls?.destroy?.()
    console.log(`jacob======卸载视频 ${video.id}`)
  },
  videoResource: null,
  setVideoResource: (video: FormatterListItem | null) => {
    set({ videoResource: video })
  },

  imageResource: null,
  setImageResource: (resource) => {
    set({ imageResource: resource })
  },

  followResource: null,
  setFollowResource: (resource) => {
    set({ followResource: resource })
  },

  setImageResourceIndex: (currentIndex: number) => {
    set((state) => {
      if (state.imageResource) {
        return {
          imageResource: {
            ...state.imageResource,
            currentIndex,
          },
        }
      } else {
        return {
          imageResource: state.imageResource,
        }
      }
    })
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
