import { StarsIcon } from '@/assets/icons'
const EarningsHistory = () => {
  return (
    <div className="px-[16px] py-[10px]">
      <div className="flex justify-between">
        <h3 className="text-[20px] text-[rgba(224,226,246,1)] font-[700]">History</h3>
        <a className="text-[rgba(128,128,128,1)] text-[15px]">Filter</a>
      </div>
      <div className="pt-[32px]">
        <div className="flex justify-between">
          <div>
            <h4 className="text-[16px] text-[rgba(224,226,246,1)]">Income</h4>
            <p className="text-[12px] text-[rgba(128,128,128,1)]">2024.09.17</p>
          </div>
          <div>
            <div className="flex gap-[4px]">
              <h4 className="text-[20px] text-[rgba(224,226,246,1)]">+200</h4>
              <img src={StarsIcon} />
            </div>
            <p className="text-[12px] text-[rgba(128,128,128,1)] text-right">$20</p>
          </div>
        </div>
      </div>
    </div>
  )
}
export default EarningsHistory
