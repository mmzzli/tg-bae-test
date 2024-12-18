import { useEffect, useState } from 'react'
import { useBoolean, useToast } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

import { totalAvailable } from '@/types'

import { BaseModal } from '@/components/Modal/BaseModal'
import BaseButton from '@/components/BaseButton/BaseButton'
import { StarsIcon, RightIcon } from '@/assets/icons'
import { CustomToast, typeOptions } from '@/components/comm/Toast'
import { totalAvailableInvoice } from '@/api'
import { useStore } from '@/store/store'

const Earnings = () => {
  const navigate = useNavigate()
  const [isBaseModalOpen, { toggle, on, off }] = useBoolean(false)
  const [data, setData] = useState<totalAvailable>({
    available: 0,
    exchange_rate: 0,
    total: 0,
  })
  const toast = useToast()
  const { token } = useStore((state) => ({
    token: state.token,
  }))

  useEffect(() => {
    if (!token) return
    const load = async () => {
      const res = await totalAvailableInvoice()
      setData(res)
    }
    load()
  }, [token])

  return (
    <>
      {/* <Text onClick={()=>toggle()} color="#fff">️Earnings</Text> */}

      <BaseButton
        text="️Earnings"
        width="86px"
        height="36px"
        handler={() => {
          toggle()
        }}
      />
      <BaseModal
        isOpen={isBaseModalOpen}
        onClose={off}
        height="386px"
        animation={{
          duration: 400,
          timingFunction: 'ease-in-out',
        }}
        theme={{
          darkBackgroundColor: '#1a1a1a',
          lightBackgroundColor: '#ffffff',
          handleColor: '#d1d5db',
        }}
        closeOnBackdropClick={true}
        showHandle={false}
      >
        <div className="w-[100%]">
          <h3 className="font-bold text-[24px] text-[#333]">Earnings</h3>
          <div className="flex gap-[8px] mt-[3px]">
            <p
              className="text-[15px] text-[#808080]"
              onClick={() =>
                navigate(`/profile/earningsHistory?exchange_rate=${data.exchange_rate}`)
              }
            >
              Earning History
            </p>
            <img className="mt-[2px]" src={RightIcon} />
          </div>
          <div className="mt-[40px] flex gap-[30px] items-center justify-between">
            <div>
              <div className="flex gap-[11px]">
                <h3 className="text-[30px] text-[#333]">{data.total}</h3>
                <img src={StarsIcon} />
              </div>
              <p className="text-[#62636F] text-[14px]">Total earnings</p>
              <p className="text-[#999] text-[14px]">${data.total * data.exchange_rate}</p>
            </div>
            <p className="h-[31px] w-[1px] bg-[#CCC]"></p>
            <div>
              <div className="flex gap-[11px]">
                <h3 className="text-[30px] text-[#333]">{data.available}</h3>
                <img src={StarsIcon} />
              </div>
              <p className="text-[#62636F] text-[14px]">Available earnings</p>
              <p className="text-[#999] text-[14px]">${data.available * data.exchange_rate}</p>
            </div>
          </div>
          <div className="mt-[48px] mb-[30px] px-[17px]">
            <BaseButton
              text="Withdraw"
              width="100%"
              height="48px"
              handler={() => {
                toast({
                  render: () => {
                    return <CustomToast title="coming soon" type={typeOptions.warning} />
                  },
                  position: 'bottom',
                })
                // shareLink(link ?? '')
              }}
            />
          </div>
        </div>
      </BaseModal>
    </>
  )
}
export default Earnings
