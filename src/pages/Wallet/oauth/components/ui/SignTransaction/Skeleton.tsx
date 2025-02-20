import { Skeleton as AntSkeleton } from 'antd-mobile'

const Skeleton = ({ className }: { className?: string }) => (
  <AntSkeleton
    animated
    className={`${className} h-[21px] w-[60px] rounded-full`}
  ></AntSkeleton>
)

export default Skeleton
