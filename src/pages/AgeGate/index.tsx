import { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import BaseButton from '@/components/BaseButton/BaseButton'
import Image from '@/components/Image/Image'
import { GateImg } from '@/assets/image'

const AgeGate = () => {
  const navigate = useNavigate()
  const [isChecked, setIsChecked] = useState<boolean>(false);

  const handleChange = () => {
    setIsChecked(!isChecked);
  };

  useEffect(() => {
    if (localStorage.getItem("ageGate")) {
      navigate('/home')
    }
  }, [])
  return (
    <div className="px-[20px] fixed w-screen h-screen bg-black z-10 overflow-auto scrollbar-hide">

      <Image className='mx-[auto] mt-[94px] mb-[50px]' src={GateImg} />

      <h3 className="text-[#FFF] text-[24px] text-center">
        Are you 18 years of age or older?
      </h3>

      <div className="text-[14px] mt-[10px] leading-[22px]">
        <p className="text-[#62636F]">
          You must be 18 years or older and agree to our Terms of Service to access and use this app. By tapping the button below, you certify that you are 18 years or older and that you accept our.
        </p>
        <p className="text-center">
          <a className="text-[#E0E2F6] text-[14px] underline">Terms of Service</a>
        </p>
      </div>
      <div className="mt-[88px] text-center">
        <div className='flex justify-center gap-[4px]'>
          <input type="checkbox" checked={isChecked} onChange={handleChange} />
          <p className="text-[#E0E2F6] text-[12px]">
            I have read and accept the
            <a className="underline ml-[4px]">Terms of Service</a>
          </p>
        </div>
        <BaseButton
          text="I’m 18 or older"
          height="48px"
          width="290px"
          className='m-[auto] mt-[16px]'
          handler={() => {
            if(isChecked){
              localStorage.setItem("ageGate", "1")
              navigate('/home')
            }
          }}
        />
      </div>

    </div>
  )
}
export default AgeGate
