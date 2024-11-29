import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { useSearchParams } from 'react-router-dom'

import { accountdetailList } from '@/api'
import { useStore } from '@/store/store'
import { StarsIcon } from '@/assets/icons'
import Icon from '@/components/comm/Icon'

import { AccountdetailRes } from '@/types'

const EarningsHistory = () => {
  const [searchParams] = useSearchParams()
  const rate = searchParams.get('exchange_rate')
  const [exchangeRate, setExchangeRate] = useState<number>(0)
  const { token } = useStore((state) => ({
    token: state.token,
  }))
  const [data, setData] = useState<AccountdetailRes>({ accounts: [] })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (rate) {
      setExchangeRate(Number(rate))
    }
  }, [rate])
  useEffect(() => {
    if (!token) return
    const load = async () => {
      const res = await accountdetailList({
        page_num: 1,
        records: 10,
        type: 1,
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
    <div className="fixed w-screen h-screen bg-[#FFF] z-10 overflow-auto scrollbar-hide px-[16px]">
      <div className="flex justify-between">
        <h3 className="text-[20px] text-[#333] font-[700] mt-[24px]">History</h3>
        {/* <a className="text-[rgba(128,128,128,1)] text-[15px]">Filter</a> */}
      </div>
      <div className="pt-[16px]">
        {loading && (
          <Icon
            name="icon-none_search"
            style={{ width: '164px', height: '164px', margin: 'auto' }}
          ></Icon>
        )}
        {data.accounts.map((item, key) => (
          <div className="flex justify-between py-[20px] border-b border-[#EBEBF4]" key={key}>
            <div>
              <h4 className="text-[16px] text-[#333]">Income</h4>
              <p className="text-[12px] text-[#999] mt-[12px]">
                {dayjs(item.created_at).format('YYYY-MM-DD HH:mm')}
              </p>
            </div>
            <div className="">
              <div className="flex gap-[4px]">
                <h4 className="text-[20px] text-[#333]">+{item.coin_amount}</h4>
                <img src={StarsIcon} />
              </div>
              <p className="text-[12px] text-[#666] text-right">
                ${item.coin_amount * exchangeRate}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
export default EarningsHistory
