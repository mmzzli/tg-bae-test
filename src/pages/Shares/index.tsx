import { FC } from 'react'
import ResourceList from '@/components/ResourceList/ResourceList'
import RecommendList from '@/components/RecommendList/RecommendList'
import { useSharedList } from '@/store/hook/useResourceList'
import NewPostButton from '@/components/NewPost/NewPostButton'

const Shares: FC = () => {
  const { sharedPostList } = useSharedList()
  return (
    <div
      id="recommendScrollableDiv"
      className="relative w-full h-full overflow-auto scrollbar-hide"
    >
      <div
        className="flex items-center justify-between mx-4"
        style={{
          marginTop: `calc(${window.getComputedStyle(document.documentElement).getPropertyValue('--tg-safe-area-inset-top') ? '0' : '16px'})`,
        }}
      >
        <div className="font-bold text-xl text-[#E0E2F6]">Shared</div>
        {/* <Button
          size="xl"
          fontSize="14px"
          variant="primary-dark"
          p="9px 12px"
          onClick={() => {
            navigate('/post')
          }}
        >
          <Image src={AddIcon1} mr="5px" /> Create
        </Button> */}
        <NewPostButton />
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
