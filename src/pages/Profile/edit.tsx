import { FC, useState, useEffect, ChangeEvent, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios, { AxiosResponse } from 'axios'
import { useToast, Button } from '@chakra-ui/react'

import BaseButton from '@/components/BaseButton/BaseButton'
import { profileEdit, putProfile } from '@/api'
import Skeleton from '@/components/Skeketon/Skeleton'
import { uploadImgUrl } from '@/utils/env'

import { useTMAUtils } from '@/hooks/useTMAUtils'
import { useStore } from '@/store/store'
import { UserInfoProfile } from '@/types'
import { CameraIcon } from '@/assets/icons'

const ProfileEdit: FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const navigate = useNavigate()
  const token = useStore((state) => state.token)
  const { launchParams } = useTMAUtils()
  const uid = launchParams.initData?.user?.id ?? 0
  const toast = useToast()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [profileData, setProfileData] = useState<UserInfoProfile>({
    username: '',
    bio: '',
    avatar: '',
  })
  const changeEve = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof UserInfoProfile
  ) => {
    const value = e.target.value
    if (field === 'bio' && value.length > 500) {
      return
    }
    if (field === 'username' && value.length > 20) {
      return
    }
    setProfileData((prevData) => ({
      ...prevData,
      [field]: value,
    }))
  }
  useEffect(() => {
    const load = async () => {
      const res = await profileEdit(uid)
      setProfileData({
        username: res.username,
        bio: res.bio,
        avatar: res.avatar,
      })
    }
    if (token) {
      load()
    }
  }, [token])

  const handleDivClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const url = `${import.meta.env.VITE_APP_UPLOAD_URL}upload/${file.name}`
      const formData = new FormData()
      formData.append('file', file)
      try {
        const response = await axios.put(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        })
        console.log(response.data)
        setProfileData((prevData) => ({
          ...prevData,
          ['avatar']: response.data,
        }))
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error)
      }
    }
  }
  const doneEve = async()=>{
    setIsLoading(true)
    await putProfile(profileData)
    toast({
      title: 'successfully',
      status: 'success',
      position: 'top',
      onCloseComplete: () => {
        location.href = '/profile'
      },
    })
  }

  return (
    <div className="pt-[10px] px-[16px] fixed w-screen h-screen bg-black z-10 overflow-auto scrollbar-hide">
      <h2 className="text-[20px] text-[#E0E2F6]">Profile</h2>
      {profileData.avatar ? (
        <>
          <div className="mt-[44px]">
            <p className="w-[88px] h-[88px] bg-[#333] m-[auto] rounded-[50px] relative">
              <img
                src={profileData?.avatar}
                className="w-[100%] h-[100%] rounded-[50px] object-cover overflow-hidden"
              />
              <p
                className="absolute bottom-[0px] right-[-14px]  bg-[#19191E] rounded-[50px] p-[5px]"
                onClick={handleDivClick}
              >
                <img src={CameraIcon} />
              </p>
            </p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleFileChange}
          />
          <div className="px-[8px] mt-[48px]">
            <div className="flex justify-between items-center mb-[16px]">
              <h3 className="text-[16px] text-[#E0E2F6]">* Name</h3>
              <p className="text-[#424048] text-[12px]">{profileData?.username.length}/20</p>
            </div>
            <input
              className="w-[100%] rounded-[10px] text-[#E0E2F6] text-[14px] bg-[#19191E] px-[16px] py-[15px]"
              value={profileData?.username}
              onChange={(e) => changeEve(e, 'username')}
            />
            <div className="mt-[24px]">
              <div className="flex justify-between items-center mb-[16px]">
                <h3 className="text-[16px] text-[#E0E2F6]">Bio</h3>
                <p className="text-[#424048] text-[12px]">{profileData?.bio.length}/500</p>
              </div>
              <textarea
                className="w-[100%] h-[218px] rounded-[10px] text-[#E0E2F6] text-[14px] bg-[#19191E] px-[16px] py-[15px]"
                value={profileData?.bio}
                // onChange={(e) => changeEve(e, 'bio')}
              />
              <KeyboardAwareInput
                value={profileData?.bio}
                onChange={(e:any) => changeEve(e, 'bio')}
                placeholder="Type something..."
              />
            </div>
          </div>
          <div className="pt-[28px] px-[18px] pb-[43px]">
            <Button variant="primary-dark" w="100%" h="48px" isLoading={isLoading} onClick={doneEve}>
              Done
            </Button>
          </div>
        </>
      ) : (
        <div className="mt-[44px]">
          <Skeleton childClassName="w-[88px] h-[88px] m-[auto] rounded-full" />
          <Skeleton childClassName="w-[100%] h-[188px] m-[auto] rounded-[4px] mt-[48px]" />
        </div>
      )}
    </div>
  )
}

interface KeyboardAwareInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

const KeyboardAwareInput: React.FC<KeyboardAwareInputProps> = ({
  placeholder,
  value,
  onChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [paddingBottom, setPaddingBottom] = useState(0);

  useEffect(() => {
    const handleFocus = () => {
      if (inputRef.current) {
        const inputRect = inputRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // 如果输入框被键盘遮挡，计算需要滚动的距离
        if (inputRect.bottom > viewportHeight * 0.7) {
          const offset = inputRect.bottom - viewportHeight * 0.7;
          setPaddingBottom(offset + 20); // 添加一定的间距
          window.scrollTo({
            top: window.scrollY + offset,
            behavior: 'smooth',
          });
        }
      }
    };

    const handleBlur = () => {
      setPaddingBottom(0); // 恢复页面布局
    };

    const inputElement = inputRef.current;
    inputElement?.addEventListener('focus', handleFocus);
    inputElement?.addEventListener('blur', handleBlur);

    return () => {
      inputElement?.removeEventListener('focus', handleFocus);
      inputElement?.removeEventListener('blur', handleBlur);
    };
  }, []);

  return (
    <div
      style={{
        paddingBottom: `${paddingBottom}px`,
        transition: 'padding-bottom 0.3s ease',
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px',
          fontSize: '16px',
          border: '1px solid #ccc',
          borderRadius: '5px',
        }}
      />
    </div>
  );
};

export default ProfileEdit
