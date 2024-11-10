import { StateCreator } from 'zustand'
export type ListType = 'recommend' | 'view'
import { ListItem, UserItem } from '../../types'
import { getRecommendMedia } from '../../api/list'
import { viewList, getUsersPosts } from '@/api'
import { useStore } from '../store'

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
} & UserItem
export interface ListState {
  list: FormatterListItem[]
  page: number
  hasMore: boolean
  isLoading: boolean
  error: string | null
}

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
        records: 5,
      })

      const hasMore = posts.length === 5
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
    } finally {
      get().setRecommendLoading(false)
    }
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
        records: 5,
      })
      const hasMore = posts.length === 5

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
        records: 5,
        uid: othersUserInfo.uid,
      })
      const hasMore = posts.length === 5

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
})
