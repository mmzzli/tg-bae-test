import { FC, useState, useEffect } from 'react'
import BaseButton from '@/components/BaseButton/BaseButton'
import { profileEdit } from '@/api'



const ProfileEdit: FC = () => {
  
  useEffect(()=>{

  },[])
  return (
    <div className='pt-[10px] px-[16px]'>
      <h2 className='text-[20px] text-[#E0E2F6]'>
        Profile
      </h2>
      <div className='mt-[44px]'>
        <p className='w-[88px] h-[88px] bg-[#fff] m-[auto] rounded-[50px]'></p>
      </div>
      <div className='px-[8px] mt-[48px]'>
        <h3 className='text-[16px] text-[#E0E2F6] mb-[16px]'>
          * Name
        </h3>
        <input className='w-[100%] rounded-[10px] text-[#E0E2F6] text-[14px] bg-[#19191E] px-[16px] py-[15px]' />
        <div className='mt-[24px]'>
          <h3 className='text-[16px] text-[#E0E2F6] mb-[16px]'>
            Bio
          </h3>
          <textarea className='w-[100%] rounded-[10px] text-[#E0E2F6] text-[14px] bg-[#19191E] px-[16px] py-[15px]' />
        </div>
      </div>
      <div className='mt-[20px] px-[18px]'>
        <BaseButton
          text="Done"
          width="100%"
          height="12"
          handler={() => {
          }}
        />
      </div>
    </div>
  )
}

export default ProfileEdit
