import { FC, useEffect } from 'react'
import OtherUserProfile from '@/components/PersonalDetails/OtherUserProfile'
import { useOthersViewList } from '@/store/hook/useResourceList'
import PostList from '@/components/PostList/PostList'
import { useParams } from 'react-router-dom'
import { getSomeoneProfile } from '../../api'
import { useStore } from '../../store'

const OthersProfile: FC = () => {
  const { uid } = useParams()
  const { setOthersUserInfo, token } = useStore((state) => ({
    token: state.token,
    setOthersUserInfo: state.setOthersUserInfo,
  }))
  const { list, hasMore, fetchMoreData } = useOthersViewList()

  const getUserInfo = async (uid: string) => {
    const user = await getSomeoneProfile(Number(uid))
    setOthersUserInfo(user)
  }
  useEffect(() => {
    if (uid && token) getUserInfo(uid)
  }, [uid, token])

  return (
    <>
      <OtherUserProfile />
      <PostList list={list} hasMore={hasMore} fetchMoreData={fetchMoreData} />
    </>
  )
}

export default OthersProfile
