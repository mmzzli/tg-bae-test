import { SearchPageSkeleton } from './ChatSkeleton'

const GeneralSkeleton = () => {
  return (
    <div className="w-full pt-[10px]">
      <SearchPageSkeleton className="mb-[24px]" count={4}></SearchPageSkeleton>
    </div>
  )
}

export default GeneralSkeleton
