import { DrawSkeletonItem, SkeletonShine } from './ChatSkeleton'
import PostSkeleton from './PostSkeleton'

const GeneralSkeleton = () => {
  return (
    <div className='w-full'>
      <DrawSkeletonItem className="w-full h-[56px] mb-[24px]"></DrawSkeletonItem>
      <DrawSkeletonItem className="w-full h-[56px] mb-[24px]"></DrawSkeletonItem>
      <DrawSkeletonItem className="w-full h-[56px] mb-[24px]"></DrawSkeletonItem>
    </div>
  )
}

export default GeneralSkeleton
