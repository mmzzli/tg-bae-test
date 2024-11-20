import { DrawSkeletonItem, SkeletonShine } from './ChatSkeleton'
import PostSkeleton from './PostSkeleton'

const ProfileSkeleton = () => {
  return (
    <div className="p-4  h-[56px] mt-[14px] absolute left-0 top-0 z-10  w-full h-full  flex-col bg-[#000000]">
      <div className="flex  gap-4 w-full justify-between">
        <div>
          <DrawSkeletonItem className="w-[64px] rounded-full h-[64px] ml-[8px]"></DrawSkeletonItem>
          <DrawSkeletonItem className="w-20  h-6 mt-[18px]"></DrawSkeletonItem>
        </div>
        <div className="flex gap-[10px] mt-[2px]">
          <DrawSkeletonItem className="w-[104px] rounded-[20px]  h-[36px] mt-[12px]"></DrawSkeletonItem>
          <DrawSkeletonItem className="w-[36px]  h-[36px] mt-[12px] rounded-full"></DrawSkeletonItem>
        </div>
      </div>
      <div className="flex mt-[28px] gap-[50px]">
        <DrawSkeletonItem className="w-[56px]  h-[32px] "></DrawSkeletonItem>
        <DrawSkeletonItem className="w-[56px]  h-[32px]"></DrawSkeletonItem>
      </div>

      <div className="flex flex-col mt-[20px] gap-[8px]">
        <DrawSkeletonItem className="w-full  h-[19px] "></DrawSkeletonItem>
        <DrawSkeletonItem className="w-full  h-[19px] "></DrawSkeletonItem>
      </div>

      <div className="flex mt-[32px] gap-[50px]">
        <DrawSkeletonItem className="flex-1  h-[32px] "></DrawSkeletonItem>
        <DrawSkeletonItem className="flex-1  h-[32px]"></DrawSkeletonItem>
        <DrawSkeletonItem className="flex-1  h-[32px]"></DrawSkeletonItem>
      </div>

      <div
        className="mt-[14px] mb-[45px]"
        style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
      ></div>
      <PostSkeleton/>
    </div>
  )
}

export default ProfileSkeleton
