export default function ChatSkeleton() {
  return (
    <div className="flex items-center gap-4 p-6 animate-pulse h-[56px] mb-[20px]">
      <div className="w-12 h-12 rounded-full bg-[#272727]"></div>

      <div className="flex-1">
        <div className="h-6 bg-[#272727] rounded w-2/3"></div>
        <div className="h-6 bg-[#272727] rounded w-full mt-[7px]"></div>
      </div>
    </div>
  )
}
