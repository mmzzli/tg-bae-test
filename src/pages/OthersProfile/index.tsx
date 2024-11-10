import { FC } from 'react'
import OtherUserProfile from '@/components/PersonalDetails/OtherUserProfile'
import { useOthersViewList } from '@/store/hook/useResourceList'
import PostList from '@/components/PostList/PostList'

const OthersProfile: FC = () => {
  const { list, hasMore, fetchMoreData } = useOthersViewList()

  return (
    <>
      <OtherUserProfile />
      <PostList list={list} hasMore={hasMore} fetchMoreData={fetchMoreData} />
    </>
  )
}

export default OthersProfile
