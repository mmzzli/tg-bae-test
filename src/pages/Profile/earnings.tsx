import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import BaseButton from '@/components/BaseButton/BaseButton'
import { StarsIcon, RightIcon } from '@/assets/icons'
import { totalAvailableInvoice } from '@/api'
import { useStore } from '@/store/store'
import { totalAvailable } from '@/types'
import { formatNumber } from '@/utils/utils'

const Earnings = () => {
  const navigate = useNavigate()
  const { token } = useStore((state) => ({
    token: state.token,
  }))
  const [data, setData] = useState<totalAvailable>({
    available: 0,
    exchange_rate: 0,
    total: 0,
  })

  useEffect(() => {
    if (!token) return
    const load = async () => {
      const res = await totalAvailableInvoice()
      setData(res)
    }
    load()
  }, [token])
  return (
    <div
      className="px-4 fixed w-screen h-screen bg-[#fff] z-10 overflow-auto scrollbar-hide pb-10 pt-6"
      id="scrollable"
    >
      <h3 className="text-[#333] text-[20px]">Earnings</h3>
      <div className="text-center mt-12">
        <h2 className="text-[#12122A] text-[40px]">${formatNumber(data.total * data.exchange_rate)}</h2>
        <p className="text-[#999] text-[14px] mt-2">Total earnings</p>
      </div>
      <div className="flex justify-between items-center mt-12">
        <h4 className="text-[#333] text-[16px]">Telegram stars</h4>
        <div className='flex gap-2'
          onClick={() =>
            navigate(`/profile/earningsHistory?exchange_rate=${data.exchange_rate}`)
          }
        >
          <p className="text-[#666] text-[14px]">History</p>
          <img className="mt-[2px]" src={RightIcon} />
        </div>
      </div>
      <div className="bg-[#F7F9FC] px-6 pt-9 pb-6 mt-3 rounded-lg">
        <ul className="flex justify-between items-center">
          <li>
            <p className="text-[#999] text-[12px]">Total stars earned</p>
            <h5 className="text-[#000] text-[22px] my-4">
              ${formatNumber(data.total * data.exchange_rate)}
            </h5>
            <p className="text-[#888] text-[12px]">
              {data.total}⭐️
            </p>
          </li>
          <li>
            <p className="text-[#999] text-[12px]">Total stars earned</p>
            <h5 className="text-[#000] text-[22px] my-4">
              ${formatNumber(data.available * data.exchange_rate)}
            </h5>
            <p className="text-[#888] text-[12px]">
              {data.available}⭐️
            </p>
          </li>
        </ul>
        <div className='px-3'>
          <BaseButton
            className='mt-5'
            text="Withdraw"
            width="100%"
            height="40px"
            handler={() => {
              // toggle()
            }}
          />
        </div>
      </div>
      <div className='mt-7'>
        <div className="flex justify-between items-center">
          <h4 className="text-[#333] text-[16px]">Tomo wallet</h4>
          <div className='flex gap-2'>
            <p className="text-[#666] text-[14px]">History</p>
            <img className="mt-[2px]" src={RightIcon} />
          </div>
        </div>
        <div className="bg-[#F7F9FC] px-5 py-5 mt-3 rounded-lg">
            <p className='text-[#999] text-[12px]'>Cryptos received</p>
            <h3 className='text-[#000] text-[22px] my-4'>$0.00</h3>
            <p className='text-[#666] text-[12px]'>This shows the estimated total value of crypto you received from others, subject to market fluctuations.</p>
            <div className='px-3'>
              <BaseButton
                className='mt-5'
                text="Connect wallet"
                width="100%"
                height="40px"
                handler={() => {
                  // toggle()
                }}
              />
            </div>
        </div>
      </div>
    </div>
  )
}
export default Earnings
