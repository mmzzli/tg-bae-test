import { BaseHistoryType } from '.'

const Header = ({
  type = BaseHistoryType.ALL
}: {
  type: BaseHistoryType | undefined
}) => {
  return (
    <div className="my-[7px] text-h3 font-semibold text-t1">
      <span>History</span>
    </div>
  )
}

export default Header
