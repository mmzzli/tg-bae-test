import { useEffect } from 'react'
import { shallow } from 'zustand/shallow'
import { useStore } from '../store'

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

  // useEffect(() => {
  //   return () => {
  //     resetRecommendList()
  //   }
  // }, [])

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
  const { favList, setFavPage, loadFavList, resetFavList, token } = useStore(
    (state) => ({
      favList: state.favList,
      setFavPage: state.setFavPage,
      loadFavList: state.loadFavList,
      resetFavList: state.resetFavList,
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
    loadOthersViewList(page)
  }, [page, token])

  // useEffect(() => {
  //   return () => {
  //     resetOthersViewList()
  //   }
  // }, [])

  useEffect(() => {
    if (othersUserInfo.uid != -1) {
      resetOthersViewList()
      loadOthersViewList(page)
    }
  }, [othersUserInfo.uid])

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
