import { FC } from 'react'
import { Button, Image } from '@chakra-ui/react'
import ResourceList from '@/components/ResourceList/ResourceList'
import { useNavigate } from 'react-router-dom'
import { AddIcon1 } from '@/assets/icons'
import RecommendList from '@/components/RecommendList/RecommendList'
import { useSharedList } from '@/store/hook/useResourceList'

const Shares: FC = () => {
  const navigate = useNavigate()
  const { sharedPostList } = useSharedList()
  return (
    <div id="recommendScrollableDiv" className="relative w-full h-full overflow-auto no-scroll">
      <div className="flex items-center justify-between mt-4 mx-4">
        <div className="font-bold text-xl text-[#E0E2F6]">Shared</div>
        <Button
          size="xl"
          fontSize="14px"
          variant="primary-dark"
          p="9px 12px"
          onClick={() => {
            navigate('/post')
          }}
        >
          <Image src={AddIcon1} mr="5px" /> Create
        </Button>
      </div>
      <div className="mb-12">
        <ResourceList
          resources={sharedPostList && sharedPostList.length > 0 ? sharedPostList : []}
        />
      </div>
      <div className="font-bold text-xl text-[#E0E2F6] mt-4 mx-4">Selected Posts</div>
      <RecommendList className="mb-12" />
    </div>
  )
}

export default Shares
