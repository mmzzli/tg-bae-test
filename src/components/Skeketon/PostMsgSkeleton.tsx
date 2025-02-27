import { DrawSkeletonItem } from './ChatSkeleton'

const PostMsgSkeleton = () => {
  return (
    <div className="flex w-full flex-col mb-[12px] relative">
      <DrawSkeletonItem className="w-full h-[220px]"></DrawSkeletonItem>
      <div className="flex flex-col gap-3 mt-[12px] px-4">
        <DrawSkeletonItem className="w-full h-[24px]"></DrawSkeletonItem>
        <DrawSkeletonItem className="w-full h-[24px]"></DrawSkeletonItem>
      </div>

      <div className="flex gap-3 mt-[12px] px-4">
        <DrawSkeletonItem className="w-[24px] h-[24px] rounded-full"></DrawSkeletonItem>
        <DrawSkeletonItem className="w-[80px] h-[24px]"></DrawSkeletonItem>
      </div>
    </div>
  )
}

export default PostMsgSkeleton
