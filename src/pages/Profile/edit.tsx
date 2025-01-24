import { ChangeEvent, FC, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Button, useToast } from '@chakra-ui/react'
import { profileEdit, putProfile } from '@/api'
import Skeleton from '@/components/Skeketon/Skeleton'
import { isMobileDevice, throttle } from '@/utils/utils'

import { useTMAUtils } from '@/hooks/useTMAUtils'
import { useStore } from '@/store/store'
import { UserInfoProfile } from '@/types'
import { CustomToast, typeOptions } from '@/components/comm/Toast'
import BaseButton from '@/components/BaseButton/BaseButton'
const SCROLL_THRESHOLD = 130

const ProfileEdit: FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const fileInput1Ref = useRef<HTMLInputElement | null>(null)
  const navigate = useNavigate()
  const token = useStore((state) => state.token)
  const { launchParams } = useTMAUtils()
  const uid = launchParams.initData?.user?.id ?? 0
  const toast = useToast()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isFocused, setIsFocused] = useState<boolean>(false)
  const setUserInfo = useStore((state) => state.setUserInfo)
  const userInfo = useStore((state) => state.userInfo)
  const [initLoading, setInitLoading] = useState<boolean>(false)
  const [errBoll, setErrBoll] = useState<boolean>(false)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [showTopTitle, setShowTopTitle] = useState(false)
  const scrollDivRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1) // 控制背景图片的缩放


  const [profileData, setProfileData] = useState<UserInfoProfile>({
    username: '',
    bio: '',
    avatar: '',
    background_img: {
      url: '',
      width: 0,
      height: 0,
    },
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
        background_img: res.background_img,
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
        setInitLoading(true)
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
        setInitLoading(false)
        setProfileData((prevData) => ({
          ...prevData,
          ['avatar']: response.data,
        }))
      } catch (error) {
        setInitLoading(false)
        console.error(`Error uploading ${file.name}:`, error)
      }
    }
  }

  const handleBgImgChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        setInitLoading(true)
        const url = await compressImage(file)

        setProfileData((prevData) => ({
          ...prevData,
          ['background_img']: {
            url: url,
            width: 0,
            height: 0,
          },
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
        setInitLoading(false)
        setProfileData((prevData) => ({
          ...prevData,
          ['background_img']: {
            url: response.data,
            width: 0,
            height: 0,
          },
        }))
      } catch (error) {
        setInitLoading(false)
        console.error(`Error uploading ${file.name}:`, error)
      }
    }
  }

  const doneEve = async () => {
    if (initLoading) {
      return
    }
    if (!profileData.username) {
      toast({
        position: 'bottom',
        render: () => {
          return <CustomToast title="The name cannot be empty" type={typeOptions.error} />
        },
      })
      return
    }
    setIsLoading(true)
    try {
      await putProfile(profileData)
    } catch (error) {
      setIsLoading(false)
      setErrBoll(true)
      // toast({
      //   position: 'bottom',
      //   render: () => {
      //     return <CustomToast title="This name is already taken." type={typeOptions.error} />
      //   },
      // })
      return
    }
    toast({
      position: 'bottom',
      onCloseComplete: () => {
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
    const scrollDiv = document.getElementById('profileScrollableDiv')
    if (!titleRef.current) return
    if (!scrollDiv) return


    const handleScroll = throttle(() => {
      const scrollTop = scrollDiv.scrollTop

      if (!scrollDiv) return
      const shouldShowTitle = scrollDiv.scrollTop >= SCROLL_THRESHOLD
      setShowTopTitle(shouldShowTitle)

      if (shouldShowTitle) {
        window.Telegram?.WebApp?.setHeaderColor("#ffffff")
      } else {
        window.Telegram?.WebApp?.setHeaderColor("#000000")
      }

      // 下拉放大背景图片
      const pullDownOffset = Math.min(scrollTop, 0) // 限制为负值
      const newScale = 1 - pullDownOffset / 300 // 最大放大到 1.3 倍
      setScale(newScale)
    }, 40)

    scrollDiv?.addEventListener('scroll', handleScroll)
    return () => scrollDiv?.removeEventListener('scroll', handleScroll)
  }, [showTopTitle])

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
      className="relative  w-screen  bg-[#fff] overflow-auto scrollbar-hide"
      id="profileScrollableDiv"
      style={{
        height:
          'calc(100vh - 84px - var(--tg-safe-area-inset-top) - var(--tg-content-safe-area-inset-top))',
      }}
    >
       <div
        className="fixed top-0 left-0 right-0 bg-white dark:bg-black z-10"
        style={{
          display: showTopTitle ? 'block' : 'none',
          height: `${
            parseInt(
              getComputedStyle(document.documentElement).getPropertyValue(
                '--tg-safe-area-inset-top'
              )
            ) > 0 ||
            parseInt(
              getComputedStyle(document.documentElement).getPropertyValue(
                '--tg-content-safe-area-inset-top'
              )
            ) > 0
              ? '0'
              : '68px'
          }`,
        }}
      ></div>
      <div
        className="bg-area fixed top-0 left-0 items-center justify-center"
        style={{
          backgroundImage: `url(${profileData.background_img.url ? profileData.background_img.url : '/src/assets/image/profile/bg-header.png'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: showTopTitle ? 'none' : 'flex',
          transform: `scale(${scale})`,
          transformOrigin: 'center top',
          transition: 'transform 0.1s ease-out',
        }}
      >
        <BaseButton
          handler={() => {
            fileInput1Ref.current?.click()
          }}
          text="Cover"
          icon={<i className="iconfont icon-camera-ai-line text-white"></i>}
          className="cover-btn bg-[rgba(0,0,0,0.26)] w-[86px] h-[36px] "
        />
        <input
          type="file"
          ref={fileInput1Ref}
          style={{ display: 'none' }}
          accept="image/*"
          onChange={handleBgImgChange}
        />
      </div>
      <h3
        className="fixed text-black dark:text-[#E0E2F6] text-[20px] flex items-center duration-300 ease-out"
        style={{
          opacity: showTopTitle ? 1 : 0,
          transform: `translateX(-50%)`,
          left: '50%',
          zIndex: 11,
          top: `${
            showTopTitle
              ? 'calc(var(--tg-safe-area-inset-top) + 10px)'
              : 'calc(var(--tg-safe-area-inset-top) + 24px)'
          }`,
        }}
      >
        Profile
      </h3>
      <div
        ref={titleRef}
        className="content-area absolute pt-[24px] px-[16px] pb-[63px] left-0 w-full h-full  bg-white dark:bg-black"
        style={{
          top: 'calc(174px - var(--tg-safe-area-inset-top))',
        }}
      >
        <div className={`text-[20px] text-[#0F1233] font-[500] ${showTopTitle ? 'opacity-0' : ''}`}>
          Profile
        </div>

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
                className="w-[100%] rounded-[10px] text-[#333] text-[14px] border-[0.5px] border-[#CDCDD4] px-[16px] py-[15px]"
                value={profileData?.username}
                onChange={(e) => {
                  changeEve(e, 'username')
                  setErrBoll(false)
                }}
              />
              {errBoll && <p className="text-[#FF684A] text-3 mt-1">This name is already taken.</p>}
              <div className="mt-[24px]">
                <div className="flex justify-between items-center mb-[16px]">
                  <h3 className="text-[16px] text-[#0F1233] font-[500]">Bio</h3>
                  <p className="text-[#888] text-[12px]">{profileData?.bio.length}/500</p>
                </div>
                <textarea
                  className="w-[100%] h-[218px] rounded-[10px] text-[#333] text-[14px] border-[0.5px] border-[#CDCDD4] px-[16px] py-[15px]"
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
    </div>
  )
}

export default ProfileEdit
