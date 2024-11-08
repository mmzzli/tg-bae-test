import { FC, useState, useEffect, ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import BaseButton from '@/components/BaseButton/BaseButton'
import { profileEdit, putProfile } from '@/api'

import { useTMAUtils } from '@/hooks/useTMAUtils'
import { useStore } from '@/store/store'
import { UserInfoProfile } from '@/types'
import { CameraIcon } from '@/assets/icons'


const ProfileEdit: FC = () => {
  const navigate = useNavigate()
  const token = useStore((state) => state.token)
  const { launchParams } = useTMAUtils()
  const uid = launchParams.initData?.user?.id ?? 0

  const [profileData, setProfileData] = useState<UserInfoProfile>({
    username: '',
    bio: '',
    avatar: '',
  });
  const changeEve = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof UserInfoProfile
  ) => {
    const value = e.target.value;
    if (field === 'bio' && value.length > 500) {
      return
    }
    if (field === 'username' && value.length > 20) {
      return
    }
    setProfileData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  }
  useEffect(() => {
    const load = async () => {
      const res = await profileEdit(uid)
      setProfileData({
        username: res.username,
        bio: res.bio,
        avatar: res.avatar
      })
    }
    if (token) {
      load()
    }
  }, [token])
  return (
    <div className='pt-[10px] px-[16px]'>
      <h2 className='text-[20px] text-[#E0E2F6]'>
        Profile
      </h2>
      <div className='mt-[44px]'>
        <p className='w-[88px] h-[88px] bg-[#333] m-[auto] rounded-[50px] relative'>
          <img src={profileData?.avatar} />
          <p className='absolute bottom-[0px] right-[-14px]  bg-[#19191E] rounded-[50px] p-[5px]'>
            <img src={CameraIcon}/>
          </p>
        </p>
      </div>
      <div className='px-[8px] mt-[48px]'>
        <h3 className='text-[16px] text-[#E0E2F6] mb-[16px]'>
          * Name
        </h3>
        <input className='w-[100%] rounded-[10px] text-[#E0E2F6] text-[14px] bg-[#19191E] px-[16px] py-[15px]'
          value={profileData?.username}
          onChange={(e) => changeEve(e, 'username')}
        />
        <div className='mt-[24px]'>
          <div className='flex justify-between items-center mb-[16px]'>
            <h3 className='text-[16px] text-[#E0E2F6]'>
              Bio
            </h3>
            <p className='text-[#424048] text-[12px]'>{profileData?.bio.length}/500</p>
          </div>
          <textarea className='w-[100%] h-[218px] rounded-[10px] text-[#E0E2F6] text-[14px] bg-[#19191E] px-[16px] py-[15px]'
            value={profileData?.bio}
            onChange={(e) => changeEve(e, 'bio')}
          />
        </div>
      </div>
      <div className='mt-[20px] px-[18px]'>
        <BaseButton
          text="Done"
          width="100%"
          height="12"
          handler={async () => {
            await putProfile(profileData)
            location.href = '/profile'
          }}
        />
      </div>
    </div>
  )
}

export default ProfileEdit
