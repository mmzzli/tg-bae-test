import { FC, useRef, useState } from 'react'
import ResourceList from '@/components/ResourceList/ResourceList'
import RecommendList from '@/components/RecommendList/RecommendList'
import { useSharedList } from '@/store/hook/useResourceList'
import { CardRecommendProvider } from '@/utils/constants'
import { useNavigate } from 'react-router-dom'

const Shares: FC = () => {
  const { sharedPostList } = useSharedList()
  const [videoOpen, setVideoOpen] = useState(false)
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  return (
    <div
      id="recommendScrollableDiv"
      className="relative w-full h-full overflow-auto scrollbar-hide"
      ref={containerRef}
    >
      <div
        className="flex items-center justify-between mx-4"
        style={{
          marginTop: `calc(${
            window
              .getComputedStyle(document.documentElement)
              .getPropertyValue('--tg-safe-area-inset-top') &&
            parseInt(
              window
                .getComputedStyle(document.documentElement)
                .getPropertyValue('--tg-safe-area-inset-top'),
              10
            ) !== 0
              ? '10px'
              : '16px'
          })`,
        }}
      >
        <div className="font-bold text-xl dark:text-[#E0E2F6] text-black">Shared</div>
        <div className="ml-auto flex gap-[13px] z-[111] relative">
          <div
            className="w-[48px] h-[48px] p-[12px] bg-[#F5F3F3] rounded-[50px] flex items-center justify-center cursor-pointer"
            onClick={() => navigate('/searching')}
          >
            <i className="iconfont icon-search-line text-[#333333] text-[24px]"></i>
          </div>
        </div>
      </div>
      <div className="mb-12">
        <ResourceList
          resources={sharedPostList && sharedPostList.length > 0 ? sharedPostList : []}
          type="recommend"
        />
      </div>
      <div className="font-bold text-xl dark:text-[#E0E2F6] text-black mt-4 mx-4">
        Selected Posts
      </div>

      <CardRecommendProvider.Provider value={{ recommend: true, setVideoOpen }}>
        <RecommendList className="mb-12" containerRef={containerRef} onlySelected={true} />
      </CardRecommendProvider.Provider>
    </div>
  )
}

export default Shares
