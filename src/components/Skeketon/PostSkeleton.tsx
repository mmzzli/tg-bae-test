import { DrawSkeletonItem } from './ChatSkeleton'

const PostSkeleton = () => {
  return (
    <div className="flex gap-[12px] w-full flex-col mb-[30px]">
      <div className="flex gap-[8px]">
        <DrawSkeletonItem className="w-[48px] rounded-full h-[48px]"></DrawSkeletonItem>
        <DrawSkeletonItem className="w-[56px]  h-[20px] mt-[18px]"></DrawSkeletonItem>
      </div>
      <div className="flex flex-col gap-[12px]">
        <DrawSkeletonItem className="w-full  h-[500px] mt-4px]"></DrawSkeletonItem>
        <DrawSkeletonItem className="w-full  h-[20px] "></DrawSkeletonItem>
        <DrawSkeletonItem className="w-[229px]  h-[20px] "></DrawSkeletonItem>
      </div>
      <div className="flex  gap-[16px]">
        <DrawSkeletonItem className="w-[78px]  h-[24px] "></DrawSkeletonItem>
        <DrawSkeletonItem className="w-[78px]  h-[24px] "></DrawSkeletonItem>
      </div>
    </div>
  )
}

export default PostSkeleton
