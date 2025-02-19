import clsx from 'clsx'
import { BaseHistoryType } from '.'

const Header = ({
  type = BaseHistoryType.ALL,
  className,
}: {
  type: BaseHistoryType | undefined
  className?: string
}) => {
  return (
    <div className={clsx('flex items-center text-[20px] font-bold text-b1', className)}>
      <span>History</span>
    </div>
  )
}

export default Header
