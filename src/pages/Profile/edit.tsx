import { FC, useState, useEffect } from 'react'
import BaseButton from '@/components/BaseButton/BaseButton'
import { profileEdit, putProfile } from '@/api'

import { useTMAUtils } from '@/hooks/useTMAUtils'
import { useStore } from '@/store/store'
import {UserInfoProfile} from '@/types'


const ProfileEdit: FC = () => {
  const token = useStore((state) => state.token)
  const { launchParams } = useTMAUtils()
  const uid = launchParams.initData?.user?.id ?? 0

  const [profileData, setProfileData] = useState<UserInfoProfile>({
    username: '',
    bio: '',
    avatar: '',
  });
  const changeEve = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof UserInfoProfile
  )=>{
    const value = e.target.value;
    setProfileData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  }
  useEffect(()=>{
    const load = async()=>{
      const res = await profileEdit(uid)
      setProfileData({
        username: res.username,
        bio: res.bio,
        avatar: res.avatar
      })
    }
    if(token){
      load()
    }
  },[token])
  return (
    <div className='pt-[10px] px-[16px]'>
      <h2 className='text-[20px] text-[#E0E2F6]'>
        Profile
      </h2>
      <div className='mt-[44px]'>
        <p className='w-[88px] h-[88px] bg-[#333] m-[auto] rounded-[50px]'>
          <img src={profileData?.avatar}/>
        </p>
      </div>
      <div className='px-[8px] mt-[48px]'>
        <h3 className='text-[16px] text-[#E0E2F6] mb-[16px]'>
          * Name
        </h3>
        <input className='w-[100%] rounded-[10px] text-[#E0E2F6] text-[14px] bg-[#19191E] px-[16px] py-[15px]'
          value={profileData?.username}
          onChange={(e)=>changeEve(e,'username')}
         />
        <div className='mt-[24px]'>
          <h3 className='text-[16px] text-[#E0E2F6] mb-[16px]'>
            Bio
          </h3>
          <textarea className='w-[100%] rounded-[10px] text-[#E0E2F6] text-[14px] bg-[#19191E] px-[16px] py-[15px]'
            value={profileData?.bio}
           />
        </div>
      </div>
      <div className='mt-[20px] px-[18px]'>
        <BaseButton
          text="Done"
          width="100%"
          height="12"
          handler={async() => {
            await putProfile(profileData)
          }}
        />
      </div>
    </div>
  )
}

export default ProfileEdit
