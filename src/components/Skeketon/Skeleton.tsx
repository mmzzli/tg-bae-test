import React from 'react'
import { SkeletonShine } from './ChatSkeleton'

interface EditSkeletonProps {
  childClassName?: string
}

const Skeleton: React.FC<EditSkeletonProps> = ({ childClassName = '' }) => {
  return (
    <div className={`bg-[#F4F4F4] dark:bg-[#272727] ${childClassName} relative overflow-hidden`}>
      <SkeletonShine></SkeletonShine>
    </div>
  )
}

export default Skeleton
