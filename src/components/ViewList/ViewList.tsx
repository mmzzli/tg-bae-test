import { useState } from 'react'
import { Box, Spinner } from '@chakra-ui/react'
import InfiniteScroll from 'react-infinite-scroll-component'
import ResourceList from '../ResourceList/ResourceList'
import { cn } from '@/utils/utils'
import { useViewList } from '@/store/hook/useResourceList'

interface PostListProps {
  className?: string
}

const ViewList = ({ className }: PostListProps) => {
  const { list, hasMore, fetchMoreData } = useViewList()
  const [ids, setIsd] = useState<string>('posts')
  const menuList = [
    {
      name: "My posts",
      id: 'posts'
    },
    {
      name: "Purchased",
      id: 'purchased'
    },
    {
      name: "Saved",
      id: 'saved'
    }
  ]

  return (
    <>
      <div className='flex justify-around'>
        {
          menuList.map((item) => (
            <div className={`text-[16px] text-[${item.id === ids ? '#E0E2F6' : '#62636F'}]`}
              onClick={() => setIsd(item.id)}
            >
              {item.name}
              {item.id === ids && <p className='w-[32px] bg-[#4A3AFF] h-[2px] m-[auto] mt-[8px]'></p>}
            </div>
          ))
        }
      </div>
      <div className={cn(className, 'pb-24')}>
        <InfiniteScroll
          dataLength={list.length}
          next={fetchMoreData}
          hasMore={hasMore}
          loader={
            <Box textAlign="center" m="20px 0">
              <Spinner color="#4A3AFF" />
            </Box>
          }
        >
          <ResourceList resources={list} />
        </InfiniteScroll>
      </div>
    </>
  )
}

export default ViewList
