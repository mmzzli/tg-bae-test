import { FC, useEffect } from 'react'
import OtherUserProfile from '@/components/PersonalDetails/OtherUserProfile'
import { useOthersViewList } from '@/store/hook/useResourceList'
import PostList from '@/components/PostList/PostList'
import { useStore } from '@/store'
import { useParams } from 'react-router-dom'
import { getFollowingList, getSomeoneProfile } from '@/api'
import { useTMAUtils } from '@/hooks/useTMAUtils'

const OthersProfile: FC = () => {
  const { launchParams } = useTMAUtils()
  const { uid } = useParams()
  const { list, hasMore, fetchMoreData } = useOthersViewList()
  const {
    setMyFollow,
    othersUserInfo,
    resetOthersViewList,
    resetOthersUserInfo,
    setOthersUserInfo,
    token,
    myFollow,
  } = useStore((state) => ({
    setMyFollow: state.setMyFollow,
    resetOthersViewList: state.resetOthersViewList,
    resetOthersUserInfo: state.resetOthersUserInfo,
    setOthersUserInfo: state.setOthersUserInfo,
    othersUserInfo: state.othersUserInfo,
    token: state.token,
    myFollow: state.myFollow,
  }))

  const getUserInfo = async (uid: string) => {
    const user = await getSomeoneProfile(Number(uid))
    setOthersUserInfo({ ...user, user_id: user.uid })
  }

  useEffect(() => {
    if (uid && token && othersUserInfo.uid === -1) getUserInfo(uid)
    if (token && myFollow.length === 0) {
      const current_uid = launchParams.initData?.user?.id ?? 0
      getFollowingList(current_uid).then((res) => setMyFollow(res))
    }
  }, [uid, token])

  useEffect(() => {
    return () => {
      resetOthersUserInfo()
      resetOthersViewList()
    }
  }, [])

  return (
    <>
      <OtherUserProfile />
      <PostList list={list} hasMore={hasMore} fetchMoreData={fetchMoreData} />
    </>
  )
}

export default OthersProfile
