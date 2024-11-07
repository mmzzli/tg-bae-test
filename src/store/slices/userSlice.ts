import { StateCreator } from 'zustand'
import { StoreState, useStore } from '../store'
import { shallow } from 'zustand/shallow'
import { IUserInfo, OthersUserInfo } from '@/types'

export interface FollowListState {
  list: OthersUserInfo[]
  page: number
  hasMore: boolean
  isLoading: boolean
  error: string | null
}

export interface UserSlice {
  othersUserInfo: OthersUserInfo
  userInfo: IUserInfo
  setUserInfo: (info: IUserInfo) => void
  resetUserInfo: () => void
  setOthersUserInfo: (info: OthersUserInfo) => void
  resetOthersUserInfo: () => void
  follower: FollowListState
  following: FollowListState

  setFollowerPage: (page: number) => void
  setFollowerList: (list: OthersUserInfo[], merge?: boolean) => void
  setFollowerLoading: (isLoading: boolean) => void
  setFollowerError: (error: string | null) => void
  setFollowerHasMore: (hasMore: boolean) => void
  resetFollowerList: () => void
  loadFollowerList: (page: number) => Promise<void>

  setFollowingPage: (page: number) => void
  setFollowingList: (list: OthersUserInfo[], merge?: boolean) => void
  setFollowingLoading: (isLoading: boolean) => void
  setFollowingError: (error: string | null) => void
  setFollowingHasMore: (hasMore: boolean) => void
  resetFollowingList: () => void
  loadFollowingList: (page: number) => Promise<void>
}

const initialUserInfo: IUserInfo = {
  user_id: -1,
  username: '',
  avatar: '',
  bio: '',
  followers: 0,
  following: 0,
  api_token: '',
}

const initialOthersUserInfo: OthersUserInfo = {
  uid: -1,
  username: '',
  avatar: '',
  bio: '',
  followers: 0,
  following: 0,
}

const initialFollowListState: FollowListState = {
  list: [],
  page: 1,
  hasMore: true,
  isLoading: false,
  error: null,
}

export const createUserSlice: StateCreator<UserSlice> = (set, get) => ({
  userInfo: initialUserInfo,
  othersUserInfo: initialOthersUserInfo,
  setUserInfo: (info) => set({ userInfo: info }),
  resetUserInfo: () => set({ userInfo: initialUserInfo }),
  setOthersUserInfo: (info) => {
    set({ othersUserInfo: info })
  },
  resetOthersUserInfo: () => set({ othersUserInfo: initialOthersUserInfo }),

  follower: initialFollowListState,
  following: initialFollowListState,
  setFollowerPage: (page) =>
    set((state) => ({
      follower: {
        ...state.follower,
        page,
      },
    })),
  setFollowerList: (newList, merge = false) =>
    set((state) => ({
      follower: {
        ...state.follower,
        list: merge ? [...state.follower.list, ...newList] : newList,
      },
    })),
  setFollowerLoading: (isLoading) =>
    set((state) => ({
      follower: {
        ...state.follower,
        isLoading,
      },
    })),
  setFollowerError: (error) =>
    set((state) => ({
      follower: {
        ...state.follower,
        error,
      },
    })),
  setFollowerHasMore: (hasMore) =>
    set((state) => ({
      follower: {
        ...state.follower,
        hasMore,
      },
    })),
  resetFollowerList: () =>
    set(() => ({
      follower: { ...initialFollowListState },
    })),
  loadFollowerList: async (page) => {
    try {
      get().setFollowerLoading(true)
      get().setFollowerError(null)

      // const { posts } = await getRecommendMedia({
      //   page_num: page,
      //   records: 5,
      // })

      // const hasMore = posts.length === 5
      // const updatedPosts = posts.map(({ post, user }: ListItem) => ({
      //   ...user,
      //   ...post,
      //   media:
      //     post.type === 1 && typeof post.media === 'string' ? post.media.split(',') : [post.media],
      // }))

      // get().setFollowerList(updatedPosts, page > 1)
      // get().setRecommendHasMore(hasMore)
    } catch (error) {
      get().setFollowerError(error instanceof Error ? error.message : 'Loading Failed')
    } finally {
      get().setFollowerLoading(false)
    }
  },
  setFollowingPage: (page) =>
    set((state) => ({
      following: {
        ...state.following,
        page,
      },
    })),
  setFollowingList: (newList, merge = false) =>
    set((state) => ({
      following: {
        ...state.following,
        list: merge ? [...state.following.list, ...newList] : newList,
      },
    })),
  setFollowingLoading: (isLoading) =>
    set((state) => ({
      following: {
        ...state.following,
        isLoading,
      },
    })),
  setFollowingError: (error) =>
    set((state) => ({
      following: {
        ...state.following,
        error,
      },
    })),
  setFollowingHasMore: (hasMore) =>
    set((state) => ({
      following: {
        ...state.following,
        hasMore,
      },
    })),
  resetFollowingList: () => set(() => ({ following: { ...initialFollowListState } })),
  loadFollowingList: async (page) => {
    try {
      get().setFollowingLoading(true)
      get().setFollowingError(null)
    } catch (error) {
      get().setFollowingError(error instanceof Error ? error.message : 'Loading Failed')
    } finally {
      get().setFollowingLoading(false)
    }
  },
})

export const selectUserInfo = (state: StoreState) => state.userInfo

export const useUserInfo = () => useStore((state) => state.userInfo, shallow)
