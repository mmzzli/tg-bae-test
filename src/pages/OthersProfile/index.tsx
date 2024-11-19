import { FC } from 'react'
import { Box } from '@chakra-ui/react'
import OtherUserProfile from '@/components/PersonalDetails/OtherUserProfile'
import { useOthersViewList } from '@/store/hook/useResourceList'
import PostList from '@/components/PostList/PostList'

const OthersProfile: FC = () => {
  const { list, hasMore, fetchMoreData } = useOthersViewList()

  return (
    <div
      id="profileScrollableDiv"
      className="absolute inset-0 top-0 bottom-0 flex flex-col bg-[#000000] z-10 overflow-auto scrollbar-hide"
    >
      <OtherUserProfile />
      <Box borderTop="1px solid rgba(255, 255, 255, 0.10)">
        <PostList list={list} hasMore={hasMore} fetchMoreData={fetchMoreData} />
      </Box>
    </div>
  )
}

export default OthersProfile
