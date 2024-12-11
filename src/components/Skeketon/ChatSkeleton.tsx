export default function ChatSkeleton() {
  return (
    <div className="flex items-center gap-4 p-6 h-[56px] mb-[20px]">
      <div className="w-12 relative overflow-hidden h-12 rounded-full bg-[#F4F4F4] dark:bg-[#272727]">
        <SkeletonShine />
      </div>

      <div className="flex-1">
        <div className="h-6 relative overflow-hidden bg-[#F4F4F4] dark:bg-[#272727] rounded w-2/3">
          <SkeletonShine />
        </div>
        <div className="h-6 relative overflow-hidden bg-[#F4F4F4] dark:bg-[#272727]rounded w-full mt-[7px]">
          <SkeletonShine />
        </div>
      </div>
    </div>
  )
}

export const SkeletonShine = () => {
  return (
    <div
      className="absolute top-0 left-[-120px] w-[120px] h-full animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent"
    ></div>
  )
}

export const DrawSkeletonItem: React.FC<{ className: string }> = ({ className }) => {
  return (
    <div
      className={` relative overflow-hidden  bg-[#F4F4F4] dark:bg-[#272727]  ${className ? className : ''} rounded-[4px]`}
    >
      <SkeletonShine />
    </div>
  )
}
