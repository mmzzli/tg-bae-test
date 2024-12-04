import PostSkeleton from './PostSkeleton'

const PostWrapSkeleton = () => {
  return (
    <>
      <div className="p-4 mt-[14px] absolute left-0 top-0 z-10  w-full h-full flex-col dark:bg-[#000000] bg-white">
        <PostSkeleton></PostSkeleton>
        <PostSkeleton></PostSkeleton>
      </div>
    </>
  )
}

export default PostWrapSkeleton
