import { useEffect } from 'react'
import { Box, Flex, Image, Text, IconButton, useBoolean } from '@chakra-ui/react'

import { BaseModal } from '@/components/Modal/BaseModal'
import BaseButton from '@/components/BaseButton/BaseButton'
import { StarsIcon, MoneyIcon, RightIcon } from '@/assets/icons'

const Earnings = () => {
  const [isBaseModalOpen, { toggle, on, off }] = useBoolean(false)

  useEffect(()=>{
    if(isBaseModalOpen){
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  },[isBaseModalOpen])
  return (
    <>
      {/* <Text onClick={()=>toggle()} color="#fff">️Earnings</Text> */}

      <BaseButton
        text="️Earnings"
        icon={<Image src={MoneyIcon} />}
        width="104px"
        height="36px"
        handler={() => {
          toggle()
        }}
      />
      <BaseModal
        isOpen={isBaseModalOpen}
        onClose={off}
        height="60vh"
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
        <div className="mt-[24px] ml-2 w-[100%]">
          <h3 className="font-bold text-[24px] text-[#E0E2F6]">Earnings</h3>
          <div className="flex gap-[8px] mt-[3px]">
            <p className="text-[15px] text-[#808080]">Earning History</p>
            <img className="mt-[2px]" src={RightIcon} />
          </div>
          <div className="mt-[56px] flex gap-[30px] items-center justify-between">
            <div>
              <div className="flex gap-[11px]">
                <h3 className="text-[30px]">65,432</h3>
                <img src={StarsIcon} />
              </div>
              <p className="text-[rgba(98,99,111,1)] text-[14px]">Total earnings</p>
              <p className="text-[rgba(224, 226, 246, 1)] text-[14px]">$120</p>
            </div>
            <p className="h-[31px] w-[1px] bg-[rgba(255,255,255,0.10)]"></p>
            <div>
              <div className="flex gap-[11px]">
                <h3 className="text-[30px]">5,678</h3>
                <img src={StarsIcon} />
              </div>
              <p className="text-[rgba(98,99,111,1)] text-[14px]">Available earnings</p>
              <p className="text-[rgba(224, 226, 246, 1)] text-[14px]">$120</p>
            </div>
          </div>
          <div className="mt-[58px] mb-[43px] px-[17px]">
            <BaseButton
              text="Withdraw"
              width="100%"
              height="48px"
              handler={() => {
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
