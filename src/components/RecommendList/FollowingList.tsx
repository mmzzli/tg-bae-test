import { Box, Spinner, Button } from '@chakra-ui/react'
import InfiniteScroll from 'react-infinite-scroll-component'
import ResourceList from '../ResourceList/ResourceList'
import { cn } from '@/utils/utils'
import { useRecommendList } from '@/store/hook/useResourceList'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { COMMUNITY_LINK } from '@/utils/constants'
import { useStore } from '@/store';

interface PostListProps {
  className?: string
}

const FollowingList = ({ className }: PostListProps) => {
  // const { list, hasMore, fetchMoreData } = useRecommendList()
  const { shareLink } = useTMAUtils()

  return(

    <div>
      <div className="mx-auto w-full text-center pt-[92px]">
        <p className="text-[#62636F]">Join our community to meet creators</p>
        <p className="text-[#62636F]">and start to follow them</p>
      </div>
      <div className="mt-[28px] mb-[48px] text-center">
        <Button
          variant="primary-dark-border"
          m="auto"
          w="126px"
          h="40px"
          onClick={() => shareLink(COMMUNITY_LINK)}
        >
          Community
        </Button>
      </div>
    </div>
  )
  // if([].length){
  //   return (
  //     <div className={cn(className, 'pb-24 pt-[20px]')}>
  //       <InfiniteScroll
  //         dataLength={list.length}
  //         next={fetchMoreData}
  //         hasMore={hasMore}
  //         loader={
  //           <Box textAlign="center" m="20px 0">
  //             <Spinner color="#4A3AFF" />
  //           </Box>
  //         }
  //         scrollableTarget="recommendScrollableDiv"
  //         scrollThreshold={0.8}
  //         style={{ overflow: 'visible' }}
  //       >
  //         <ResourceList resources={list} />
  //       </InfiniteScroll>
  //     </div>
  //   )
  // }else{
  //   return(

  //     <div>
  //       <div className="mx-auto w-full text-center pt-[92px]">
  //         <p className="text-[#62636F]">Join our community to meet creators</p>
  //         <p className="text-[#62636F]">and start to follow them</p>
  //       </div>
  //       <div className="mt-[28px] mb-[48px] text-center">
  //         <Button
  //           variant="primary-dark-border"
  //           m="auto"
  //           w="126px"
  //           h="40px"
  //           onClick={() => shareLink(COMMUNITY_LINK)}
  //         >
  //           Community
  //         </Button>
  //       </div>
  //     </div>
  //   )
  // }
}

export default FollowingList
