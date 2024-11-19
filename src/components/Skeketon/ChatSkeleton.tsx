export default function ChatSkeleton() {
  return (
    <div className="flex items-center gap-4 p-6 h-[56px] mb-[20px]">
      <div className="w-12 relative overflow-hidden h-12 rounded-full bg-[#272727]"><SkeletonShine/></div>

      <div className="flex-1">
        <div className="h-6 relative overflow-hidden bg-[#272727] rounded w-2/3"><SkeletonShine/></div>
        <div className="h-6 relative overflow-hidden bg-[#272727] rounded w-full mt-[7px]"><SkeletonShine/></div>
      </div>
    </div>
  )
}

export const SkeletonShine = () =>{
  return <div className="absolute top-0 left-[-120px] w-[120px] h-full animate-shimmer" style={{
    background: `linear-gradient(
      90deg,
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 0.1),
      rgba(255, 255, 255, 0)
    )`
  }}>

  </div>
}
