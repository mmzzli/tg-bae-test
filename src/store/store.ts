import { devtools, persist, createJSONStorage } from 'zustand/middleware'
import { shallow } from 'zustand/shallow'
import { createWithEqualityFn } from 'zustand/traditional'
import { createUserSlice, UserSlice } from './slices/userSlice'
import { AuthSlice, createAuthSlice } from './slices/authSlice'
import {
  ResourceListSlice,
  createResourceListSlice,
  BaseListState,
} from './slices/resourceListSlice'
import { StateCreator } from 'zustand'
import { useEffect } from 'react'

export interface StoreState extends UserSlice, AuthSlice, ResourceListSlice {
  recommendList: BaseListState
  viewList: BaseListState
}

type LocalStorageState = Pick<StoreState, 'userInfo'>
type SessionStorageState = Pick<StoreState, 'token'>

type MyMiddlewares = [
  ['zustand/devtools', never],
  ['zustand/persist', LocalStorageState],
  ['zustand/persist', SessionStorageState],
]

const createStore = (fn: StateCreator<StoreState, [], MyMiddlewares>) => {
  const store = createWithEqualityFn<StoreState>()(
    devtools(
      persist(
        persist(fn, {
          name: 'ditto-local-storage',
          storage: createJSONStorage(() => localStorage),
          partialize: (state) => ({
            userInfo: state.userInfo,
          }),
        }),
        {
          name: 'ditto-session-storage',
          storage: createJSONStorage(() => sessionStorage),
          partialize: (state) => ({
            token: state.token,
          }),
        }
      )
    ),
    shallow
  )
  return store
}

export const useStore = createStore(((...a) => ({
  ...createUserSlice(...a),
  ...createAuthSlice(...a),
  ...createResourceListSlice(...a),
})) as StateCreator<StoreState, [], MyMiddlewares>)

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

  useEffect(() => {
    if (!token) return
    loadRecommendList(page)
  }, [page, token])

  useEffect(() => {
    return () => {
      resetRecommendList()
    }
  }, [])

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

  useEffect(() => {
    if (!token) return
    loadViewList(page)
  }, [page, token])

  useEffect(() => {
    return () => {
      resetViewList()
    }
  }, [])

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
