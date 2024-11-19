import { FC } from 'react'
import { Box } from '@chakra-ui/react'
import OtherUserProfile from '@/components/PersonalDetails/OtherUserProfile'
import { useOthersViewList } from '@/store/hook/useResourceList'
import PostList from '@/components/PostList/PostList'

const OthersProfile: FC = () => {
  const { list, hasMore, fetchMoreData } = useOthersViewList()

  return (
    <div className="relative w-full h-full overflow-auto" id="profileScrollableDiv">
      <OtherUserProfile />
      <Box borderTop="1px solid rgba(255, 255, 255, 0.10)">
        <PostList list={list} hasMore={hasMore} fetchMoreData={fetchMoreData} />
      </Box>
    </div>
  )
}

export default OthersProfile
