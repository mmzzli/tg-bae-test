import { useEffect } from 'react'
import { shallow } from 'zustand/shallow'
import { useStore } from '../store'

export const useFollowerList = () => {
  const { follower, setFollowerPage, loadFollowerList, resetFollowerList, token } = useStore(
    (state) => ({
      follower: state.follower,
      setFollowerPage: state.setFollowerPage,
      loadFollowerList: state.loadFollowerList,
      resetFollowerList: state.resetFollowerList,
      token: state.token,
    }),
    shallow
  )

  const { list, page, hasMore, isLoading, error } = follower

  useEffect(() => {
    if (!token) return
    loadFollowerList(page)
  }, [page, token])

  useEffect(() => {
    return () => {
      resetFollowerList()
    }
  }, [])

  const fetchMoreData = () => {
    if (!isLoading && hasMore) {
      setFollowerPage(page + 1)
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
      resetFollowerList()
      loadFollowerList(1)
    },
  }
}

export const useFollowingList = () => {
  const { following, setFollowingPage, loadFollowingList, resetFollowingList, token } = useStore(
    (state) => ({
      following: state.following,
      setFollowingPage: state.setFollowingPage,
      loadFollowingList: state.loadFollowingList,
      resetFollowingList: state.resetFollowingList,
      token: state.token,
    }),
    shallow
  )

  const { list, page, hasMore, isLoading, error } = following

  useEffect(() => {
    if (!token) return
    loadFollowingList(page)
  }, [page, token])

  useEffect(() => {
    return () => {
      resetFollowingList()
    }
  }, [])

  const fetchMoreData = () => {
    if (!isLoading && hasMore) {
      setFollowingPage(page + 1)
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
      resetFollowingList()
      loadFollowingList(1)
    },
  }
}
