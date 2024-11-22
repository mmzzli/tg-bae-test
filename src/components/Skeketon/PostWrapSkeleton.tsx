import PostSkeleton from './PostSkeleton'
import { DrawSkeletonItem } from './ChatSkeleton'

const PostWrapSkeleton = () => {
  return (
    <>
      <div className="p-4  h-[56px] mt-[14px] absolute left-0 top-0 z-10  w-full h-full  flex-col bg-[#000000]">
        <PostSkeleton></PostSkeleton>
        <PostSkeleton></PostSkeleton>
      </div>
    </>
  )
}


export default PostWrapSkeleton
