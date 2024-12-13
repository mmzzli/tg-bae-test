import { ChangeEvent, FC, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Button, useToast } from '@chakra-ui/react'
import { profileEdit, putProfile } from '@/api'
import Skeleton from '@/components/Skeketon/Skeleton'
import { isMobileDevice } from '@/utils/utils'

import { useTMAUtils } from '@/hooks/useTMAUtils'
import { useStore } from '@/store/store'
import { UserInfoProfile } from '@/types'
import { CustomToast, typeOptions } from '@/components/comm/Toast'

const ProfileEdit: FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const navigate = useNavigate()
  const token = useStore((state) => state.token)
  const { launchParams } = useTMAUtils()
  const uid = launchParams.initData?.user?.id ?? 0
  const toast = useToast()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isFocused, setIsFocused] = useState<boolean>(false)
  const setUserInfo = useStore((state) => state.setUserInfo)

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

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const img: HTMLImageElement = new Image()
        img.src = event!.target!.result as string

        img.onload = () => {
          const minSize = 800 // 最小尺寸200px
          let width = img.width
          let height = img.height

          // calc scale
          const scale = Math.max(minSize / width, minSize / height)

          // calc scaleed with and height
          const newWidth = width * scale
          const newHeight = height * scale

          // set canvans and with and height
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          canvas.width = newWidth
          canvas.height = newHeight

          if (ctx) {
            // 将图片绘制到 canvas 上
            ctx.drawImage(img, 0, 0, width, height, 0, 0, newWidth, newHeight)
            // 从 canvas 获取缩放后的图片
            const resizedImage = canvas.toDataURL('image/jpeg', 0.8) // 压缩质量可以调节
            resolve(resizedImage)
          }
        }
        img.onerror = () => {
          reject('Image loading failed')
        }
      }
      reader.onerror = () => {
        reject('File reading failed.')
      }
      reader.readAsDataURL(file) // 读取文件为 Data URL
    })
  }

  // 将 Base64 转换为 Blob 类型
  const base64ToBlob = (base64: string, mimeType: string): Blob => {
    const byteString = atob(base64.split(',')[1])
    const arrayBuffer = new ArrayBuffer(byteString.length)
    const uintArray = new Uint8Array(arrayBuffer)
    for (let i = 0; i < byteString.length; i++) {
      uintArray[i] = byteString.charCodeAt(i)
    }
    return new Blob([uintArray], { type: mimeType })
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        const url = await compressImage(file)

        setProfileData((prevData) => ({
          ...prevData,
          ['avatar']: url,
        }))
        const imageBlob = base64ToBlob(url, 'image/jpeg')
        const upFileUrl = `${import.meta.env.VITE_APP_UPLOAD_URL}upload/${file.name}`
        const formData = new FormData()
        formData.append('file', imageBlob, file.name)
        const response = await axios.put(upFileUrl, formData, {
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
  const doneEve = async () => {
    setIsLoading(true)
    await putProfile(profileData)
    toast({
      position: 'top',
      onCloseComplete: () => {
        console.log(profileData.avatar, '=======')
        setUserInfo(profileData)
        setTimeout(() => {
          navigate('/profile')
        })
      },
      render: () => {
        return <CustomToast title="successfully" type={typeOptions.success} />
      },
    })
  }
  useEffect(() => {
    const handleKeyboardHide = () => {
      window.scrollTo(0, 0)
    }
    window.addEventListener('focusout', handleKeyboardHide)

    return () => {
      window.removeEventListener('focusout', handleKeyboardHide)
    }
  }, [])
  useEffect(() => {
    if (isFocused) {
      const scrollable: any = document.getElementById('scrollable')
      scrollable.scrollTo({
        top: 100000,
        behavior: 'smooth',
      })
    }
  }, [isFocused])

  return (
    <div
      className="pt-[24px] px-[16px] fixed w-screen h-screen bg-[#fff] z-10 overflow-auto scrollbar-hide"
      id="scrollable"
    >
      <h2 className="text-[20px] text-[#0F1233] font-[500]">Profile</h2>
      {profileData.avatar ? (
        <>
          <div className="mt-[38px]">
            <p className="w-[88px] h-[88px] m-[auto] rounded-[50px] relative">
              <img
                src={profileData?.avatar}
                className="w-[100%] h-[100%] rounded-[50px] object-cover overflow-hidden"
              />
              <div className="bg-[#fff] p-[3px] absolute bottom-[0px] right-[-14px] rounded-[50px]">
                <p
                  className="bg-[#19191E] w-[28px] h-[28px] flex items-center justify-center rounded-[50px]"
                  onClick={handleDivClick}
                >
                  <i className="iconfont icon-camera-ai-line text-white"></i>
                </p>
              </div>
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
              <h3 className="text-[16px] text-[#0F1233] font-[500]">* Name</h3>
              <p className="text-[#888] text-[12px]">{profileData?.username.length}/20</p>
            </div>
            <input
              className="w-[100%] rounded-[10px] text-[#333] text-[14px] bg-[#F5F5FA] px-[16px] py-[15px]"
              value={profileData?.username}
              onChange={(e) => changeEve(e, 'username')}
            />
            <div className="mt-[24px]">
              <div className="flex justify-between items-center mb-[16px]">
                <h3 className="text-[16px] text-[#0F1233] font-[500]">Bio</h3>
                <p className="text-[#888] text-[12px]">{profileData?.bio.length}/500</p>
              </div>
              <textarea
                className="w-[100%] h-[218px] rounded-[10px] text-[#333] text-[14px] bg-[#F5F5FA] px-[16px] py-[15px]"
                value={profileData?.bio}
                onChange={(e) => changeEve(e, 'bio')}
                onFocus={() => {
                  isMobileDevice() && setIsFocused(true)
                }}
                onBlur={() => {
                  isMobileDevice() && setIsFocused(false)
                }}
              />
            </div>
          </div>
          <div
            className={`pt-[28px] px-[18px] pb-[43px]`}
            style={{ height: `${isFocused ? '400px' : ''}` }}
          >
            <Button
              variant="primary-dark"
              w="100%"
              h="48px"
              isLoading={isLoading}
              onClick={doneEve}
            >
              Done
            </Button>
          </div>
        </>
      ) : (
        <div className="mt-[38px]">
          <Skeleton childClassName="w-[88px] h-[88px] m-[auto] rounded-full" />
          <Skeleton childClassName="w-[100%] h-[188px] m-[auto] rounded-[4px] mt-[48px]" />
        </div>
      )}
    </div>
  )
}

export default ProfileEdit
