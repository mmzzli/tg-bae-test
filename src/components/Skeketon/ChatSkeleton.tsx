import { Skeleton } from 'antd-mobile'

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
    <div className="absolute top-0 left-[-120px] w-[120px] h-full animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent"></div>
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

interface SearchPageSkeletonProps {
  className?: string;
  count: number; // 配置子项个数
}

export const SearchPageSkeleton: React.FC<SearchPageSkeletonProps> = ({ className = '', count }) => {
  return (
    <div className={`w-full flex flex-col gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="w-full flex items-center gap-4"
        >
          <div className="adm-skeleton adm-skeleton-animated w-[56px] h-[56px] rounded-full bg-[#F4F4F4] dark:bg-[#272727]"></div>
          <Skeleton.Paragraph className="w-[60%]" lineCount={2} animated />
        </div>
      ))}
    </div>
  );
};
