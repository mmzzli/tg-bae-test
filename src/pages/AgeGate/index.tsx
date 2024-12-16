import { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Checkbox, useToast } from '@chakra-ui/react'

import BaseButton from '@/components/BaseButton/BaseButton'
import Image from '@/components/Image/Image'
// import { GateImg } from '@/assets/image'
import { CustomToast, typeOptions } from '@/components/comm/Toast'
import Icon from '@/components/comm/Icon'

const AgeGate = () => {
  const toast = useToast()
  const navigate = useNavigate()
  const [isChecked, setIsChecked] = useState<boolean>(false)
  const [isShowTime, setIsShowTime] = useState<boolean>(false)

  const handleChange = () => {
    setIsChecked(!isChecked)
  }

  useEffect(() => {
    if (localStorage.getItem('ageGate')) {
      navigate('/home')
    }
  }, [])
  return (
    <div className="px-[20px] fixed w-screen h-screen bg-[#fff] z-10 overflow-auto scrollbar-hide">
      <div className="mx-[auto] mt-[94px] mb-[50px] flex items-center justify-center">
        <Icon name={'icon-a-Frame2085661681'} style={{ width: '164px', height: '164px' }}></Icon>
      </div>

      <h3 className="text-[#333] text-[24px] text-center">Are you 18 years of age or older?</h3>

      <div className="text-[14px] mt-[10px] leading-[22px] text-center">
        <p className="text-[#666] font-normal leading-[1.5]  text-[14px]">
          You must be 18 years or older and agree to our Terms of Service to access and use this
          app. By tapping the button below, you certify that you are 18 years or older and that you
          accept our.
        </p>
        <p className="text-center">
          <a className="text-[#6254FF] text-[14px] underline">Terms of Service</a>
        </p>
      </div>
      <div className="mt-16 text-center">
        <div className="flex justify-center gap-[8px] flex-col items-center">
          <Checkbox type="checkbox" checked={isChecked} onChange={handleChange} alignItems="flex-start">
          <p className="align-left text-[#999] text-[12px] whitespace-normal">
            I have read and accept the
            <a className="underline ml-[4px]">Terms of Service</a>
            and
            <a className="underline ml-[4px]">Privacy Policy</a>.
          </p>
          </Checkbox>
        </div>
        <BaseButton
          text="I’m 18 or older"
          height="48px"
          width="290px"
          className="m-[auto] mt-[16px]"
          handler={() => {
            if (isChecked) {
              if(isShowTime){
                localStorage.setItem('ageGate', '1')
              }
              navigate('/home')
            } else {
              toast({
                render: () => {
                  return <CustomToast title={`Please check terms.`} type={typeOptions.error} />
                },
                position: 'top',
              })
            }
          }}
        />
        <div className='mt-4'>
          <Checkbox type="checkbox" checked={isShowTime} onChange={()=>setIsShowTime((pev)=>!pev)}>
            <p className="text-[#999] text-[12px] whitespace-nowrap">
              Do not show again next time.
            </p>
          </Checkbox>
        </div>
      </div>
    </div>
  )
}
export default AgeGate
