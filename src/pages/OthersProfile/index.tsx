import { FC, useEffect } from 'react'
import OtherUserProfile from '@/components/PersonalDetails/OtherUserProfile'
import { useOthersViewList } from '@/store/hook/useResourceList'
import PostList from '@/components/PostList/PostList'
import { useStore } from '@/store'
import { useParams } from 'react-router-dom'
import { getSomeoneProfile } from '@/api'

const OthersProfile: FC = () => {
  const { uid } = useParams()
  const { list, hasMore, fetchMoreData } = useOthersViewList()
  const { othersUserInfo, resetOthersViewList, resetOthersUserInfo, setOthersUserInfo } = useStore(
    (state) => ({
      resetOthersViewList: state.resetOthersViewList,
      resetOthersUserInfo: state.resetOthersUserInfo,
      setOthersUserInfo: state.setOthersUserInfo,
      othersUserInfo: state.othersUserInfo,
    })
  )

  const getUserInfo = async (uid: string) => {
    const user = await getSomeoneProfile(Number(uid))
    setOthersUserInfo(user)
  }

  useEffect(() => {
    if (uid && othersUserInfo.uid === -1) getUserInfo(uid)
  }, [uid])

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
