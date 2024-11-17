import { FC } from 'react'
import OtherUserProfile from '@/components/PersonalDetails/OtherUserProfile'
import { useOthersViewList } from '@/store/hook/useResourceList'
import PostList from '@/components/PostList/PostList'

const OthersProfile: FC = () => {
  const { list, hasMore, fetchMoreData } = useOthersViewList()

  return (
    <div
      id="ProfileScrollableDiv"
      className=" flex flex-col bg-[#0D0D0D] z-10 overflow-auto no-scroll"
    >
      <OtherUserProfile />
      <PostList list={list} hasMore={hasMore} fetchMoreData={fetchMoreData} />
    </div>
  )
}

export default OthersProfile
