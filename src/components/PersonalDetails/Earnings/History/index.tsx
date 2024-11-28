import { useEffect, useState } from 'react'

import { accountdetailList } from '@/api'
import { useStore } from '@/store/store'
import { StarsIcon } from '@/assets/icons'
import Icon from '@/components/comm/Icon'

import {AccountdetailRes} from '@/types'

const EarningsHistory = () => {
  const { token } = useStore((state) => ({
    token: state.token,
  }))
  const [data, setData] = useState<AccountdetailRes>({ accounts: [] })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) return
    const load = async () => {
      const res = await accountdetailList({
        "page_num": 1,
        "records": 10,
        "type": 1
      })
      if (!res.accounts.length) {
        setLoading(true)
      } else {
        setData(res)
      }
    }
    load()
  }, [token])
  return (
    <div className="fixed w-screen h-screen bg-black z-10 overflow-auto scrollbar-hide px-[16px] py-[10px]">
      <div className="flex justify-between">
        <h3 className="text-[20px] text-[rgba(224,226,246,1)] font-[700]">History</h3>
        {/* <a className="text-[rgba(128,128,128,1)] text-[15px]">Filter</a> */}
      </div>
      <div className="pt-[32px]">
        {loading && <Icon name="icon-none_search" style={{ width: '164px', height: '164px', margin: 'auto' }}></Icon>}
        {data.accounts.map((item, key) => (
          <div className="flex justify-between" key={key}>
            <div>
              <h4 className="text-[16px] text-[rgba(224,226,246,1)]">Income</h4>
              <p className="text-[12px] text-[rgba(128,128,128,1)]">{item.created_at}</p>
            </div>
            <div>
              <div className="flex gap-[4px]">
                <h4 className="text-[20px] text-[rgba(224,226,246,1)]">+{item.amount}</h4>
                <img src={StarsIcon} />
              </div>
              <p className="text-[12px] text-[rgba(128,128,128,1)] text-right">$20</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
export default EarningsHistory
