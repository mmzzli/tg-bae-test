import { FC, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Checkbox, useToast } from '@chakra-ui/react'

import BaseButton from '@/components/BaseButton/BaseButton'
import Image from '@/components/Image/Image'
// import { GateImg } from '@/assets/image'
import { CustomToast, typeOptions } from '@/components/comm/Toast'
import Icon from '@/components/comm/Icon'
import { useTMAUtils } from '@/hooks/useTMAUtils'

const AgeGate = () => {
  const toast = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const ref = searchParams.get('ref')
  const type = searchParams.get('type')
  const [isChecked, setIsChecked] = useState<boolean>(false)
  const [isShowTime, setIsShowTime] = useState<boolean>(false)
  const { isInTMA, getCurrentUid } = useTMAUtils()
  const current_uid = getCurrentUid()

  const handleChange = () => {
    setIsChecked(!isChecked)
  }

  return (
    <div
      className="px-[20px] fixed w-screen bg-[#fff] z-10 overflow-auto scrollbar-hide"
      style={{ minHeight: '100vh', height: '100dvh' }}
    >
      <div className="mx-[auto] mt-[94px] mb-[50px] flex items-center justify-center">
        <Icon name={'icon-a-Frame2085661681'} style={{ width: '164px', height: '164px' }}></Icon>
      </div>
      <h3 className="text-[#333] text-[24px] text-center">Are you 18 years of age or older?</h3>
      <div className="text-[14px] mt-[10px] leading-[22px] text-center px-[5px]">
        <p className="text-[#666] font-normal leading-[1.5] text-[14px]">
          You must be 18 or older and agree to our
          <a
            href="https://terms.bae.boo/terms.html"
            target="_blank"
            className="text-[#6254FF] text-[14px] underline mx-[4px]"
          >
            Terms of Service
          </a>
          to use this app. By tapping the button below, you confirm you meet these requirements.
        </p>
      </div>
      <div className={`mt-16 text-center pb-5 ${window.devicePixelRatio >=3 ? 'px-[40px]' : 'px-[38px]'}`}>
        <div className="flex justify-center gap-[8px] flex-col items-center pl-[3px]">
          <Checkbox
            type="checkbox"
            checked={isChecked}
            onChange={handleChange}
            alignItems="flex-start"
          >
            <p className="break-all text-left text-[#999] text-[12px]">
              I have read and*accepted the
              <a
                href="https://terms.bae.boo/terms.html"
                target="_blank"
                className="text-[#999] underline mx-[4px]"
              >
                Terms of Service
              </a>
              and
              <a
                href="https://privacy.bae.boo/privacy.html"
                target="_blank"
                className="text-[#999] underline ml-[4px]"
              >
                Privacy Policy
              </a>
              .
            </p>
          </Checkbox>
        </div>
        <BaseButton
          text="I’m 18 or older"
          height="48px"
          className="m-[auto] mt-[16px]"
          handler={() => {
            if (isChecked) {
              sessionStorage.setItem(`temp-ageGate-${current_uid}`, '1')
              if (isShowTime) {
                localStorage.setItem(`ageGate-${current_uid}`, '1')
              }
              if (type === '2') {
                navigate(`/profile/${ref}`)
                return
              }
              if (ref) {
                navigate(`/shares?ref=${ref}`)
              } else {
                navigate('/home')
              }
            } else {
              toast({
                render: () => {
                  return <CustomToast title={`Please check terms.`} type={typeOptions.error} />
                },
                position: 'bottom',
              })
            }
          }}
        />
        <div className="mt-4">
          <Checkbox
            type="checkbox"
            checked={isShowTime}
            onChange={() => setIsShowTime((pev) => !pev)}
          >
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
