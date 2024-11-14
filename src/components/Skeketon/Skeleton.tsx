import React from "react";

interface EditSkeletonProps {
  childClassName?: string;
}

const Skeleton: React.FC<EditSkeletonProps> = ({ childClassName = "" }) => {
  return (
    <div className="animate-pulse">
      <div className={`bg-[#272727] ${childClassName}`}></div>
    </div>
  );
};

export default Skeleton;
