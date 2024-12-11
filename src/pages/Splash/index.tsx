import { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { retrieveLaunchParams } from '@tma.js/sdk'
import { getSingleMedia } from '@/api/list'
import Icon from '@/components/comm/Icon'
import { useSafeState } from 'ahooks'
import { useRecommendList } from '@/store/hook/useResourceList'
import { CacheVideo, FormatterListItem } from '@/store/slices/resourceListSlice'

const SHARE_POST = 1
const SHARE_PROFILE = 2

const Splash: FC = () => {
  const navigate = useNavigate()
  const userInfo = useStore((state) => state.userInfo)
  const setCacheVideoIndex = useStore((state) => state.setCacheVideoIndex)
  const updateCacheVideo = useStore((state) => state.updateCacheVideo)
  const loadVideo = useStore((state) => state.loadVideo)

  const setBackToHome = useStore((state) => state.setBackToHome)
  const { token, setSharedPostList, setOthersUserInfo } = useStore((state) => ({
    setSharedPostList: state.setSharedPostList,
    setOthersUserInfo: state.setOthersUserInfo,
    token: state.token,
  }))
  const [animationEnding, setAnimationEnding] = useSafeState(false)
  const { list } = useRecommendList()
  const [isCached, setIsCached] = useState(false)

  const { isInTMA } = useTMAUtils()
  const { startParam } = retrieveLaunchParams()

  useEffect(() => {
    if (list && list.length > 0) {
      const resources = list.filter((item) => item.type === 0)

      if (resources.length) {
        setCacheVideoIndex(resources[0].id)
        updateCacheVideo(resources)
      }
      // setCacheVideo()
      setTimeout(() => {
        setIsCached(true)
      }, 2000)
    }
  }, [list])

  useEffect(() => {
    if (userInfo.user_id && token && isCached) {
      const ageGateBoll = localStorage.getItem('ageGate')
      if (!isInTMA || !startParam || history.length > 2) {
        if (ageGateBoll) {
          return navigate('/home')
        } else {
          return navigate('/ageGate')
        }
      }
      const params = startParam.split('_')
      console.log('startParam', params)

      let sharedRef = ''
      const isShare = params.some((p) => {
        const pairs = p.split('=')
        if (pairs[0] === 'ref' && pairs[1]) {
          sharedRef = pairs[1]
          return true
        }
        return false
      })
      if (isShare) {
        setBackToHome(true)
        handleNavigate(sharedRef)
      } else {
        if (ageGateBoll) {
          navigate('/home')
        } else {
          navigate('/ageGate')
        }
      }
    }
  }, [userInfo, animationEnding, isCached])

  const handleNavigate = async (ref: string) => {
    console.log('token ready, navigating...')
    try {
      const data = await getSingleMedia(ref)
      console.log('getSingleMedia', data)
      if (data.type === SHARE_POST) {
        setSharedPostList(data.media)
        navigate(`/shares?ref=${ref}`)
      } else if (data.type === SHARE_PROFILE) {
        setOthersUserInfo({ ...data.userInfo, uid: data.userInfo.user_id })
        navigate(`/profile/${data.userInfo.uid || data.userInfo.user_id}`)
      }
    } catch (error) {
      console.warn('API ERROR', error)
    }
  }

  useEffect(() => {
    if (!isInTMA || !startParam || history.length > 2) return
    const params = startParam.split('_')
    console.log('startParam', params)

    params.forEach((p) => {
      const pairs = p.split('=')
      if (pairs[0] === 'ref' && pairs[1]) {
        handleNavigate(pairs[1])
      }
    })
  }, [startParam, isInTMA])

  const isProd = import.meta.env.MODE === 'production'
  if (!isProd) {
    return null
  }
  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 dark:bg-[#0D0D0D] bg-white flex justify-center items-center z-10 flex-col">
      <div className="absolute top-[0px] right-[0px]">
        <svg
          width="153"
          height="230"
          viewBox="0 0 153 230"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M0.310547 152.109V139.648C2.4481 128.07 10.5719 118.512 22.8525 113.461C41.3821 105.85 71.9542 108.163 102.196 137.497C111.822 146.831 121.38 162.396 129.624 178.12C138.323 176.126 146.388 173.081 153 168.79V198.922C149.409 200.397 145.633 201.705 141.688 202.84C144.241 208.413 146.481 213.498 148.341 217.722L148.743 218.635L124.187 229.695L124.094 229.477L124.034 229.339C121.777 224.213 118.337 216.402 114.211 207.682C89.5512 209.636 62.7719 205.878 45.7788 198.047C12.1957 182.584 2.51776 164.532 0.310547 152.109ZM153 44.4662V111.04C144.411 112.854 135.195 114.387 125.082 115.841C103.759 118.918 83.3481 116.583 62.6509 108.718C29.2569 96.0154 6.08167 72.5653 2.17587 47.5196C-0.123032 32.7955 4.84508 19.3456 15.8042 10.615C33.6522 -3.60752 64.0745 -3.21043 101.478 11.7297C121.749 19.8283 138.944 30.7635 153 44.4662ZM29.7844 34.9791C28.8328 36.816 28.1846 39.4975 28.7886 43.3633C30.7398 55.8808 44.9313 73.1682 72.2291 83.5427C88.5401 89.743 104.569 91.5928 121.245 89.1801C132.251 87.5972 141.892 85.9593 150.645 83.9861C137.257 62.7856 117.671 47.1757 91.5016 36.7253C59.4526 23.9252 40.0634 25.7176 32.5971 31.6693C31.9767 32.1602 30.7394 33.1528 29.7951 34.9757L29.7844 34.9791ZM33.099 138.364C30.4317 139.458 27.6147 141.344 26.8653 144.299C23.4964 157.583 48.5472 169.675 57.0485 173.588C67.0365 178.191 83.3937 181.166 100.616 181.179C94.9278 171.153 88.9696 162.166 83.4556 156.819C63.8644 137.823 44.0472 133.859 33.099 138.364Z"
            fill="#FF6FA6"
          />
        </svg>
      </div>
      <div className="flex justify-center items-center flex-col">
        <div className="w-[210px] h-[210px] relative top-[0px]">
          <Icon name={'icon-logo'} style={{ width: '210px', height: '210px' }}></Icon>
        </div>
        <div className="text-[var(--Light-T1)]  text-[24px] font-bold leading-[1.5] capitalize text-center">
          welcome to Bae
        </div>
        <div className="mt-[12px] text-[var(--Light-T1)] opacity-50 pl-[36px] pr-[36px] text-center tracking-[1px]">
          Connect with people you like on a deeper level.
        </div>
      </div>
      <div className="absolute left-[0px] bottom-[0px]">
        <svg
          width="139"
          height="154"
          viewBox="0 0 139 154"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M16.8478 154C11.5314 144.614 5.82163 135.746 0 128.768V154H16.8478ZM45.7209 154H81.7527C89.0421 140.133 90.4501 122.23 85.6189 102.624C84.1815 96.7998 82.5107 91.1852 80.589 85.7619C99.629 77.6648 117.195 65.5724 138.11 45.8422L138.103 45.8385L119.62 26.2561C101.166 43.6641 86.3241 54.1683 69.4687 61.219C54.1807 34.1155 31.162 13.6218 0.653088 0L0 0V29.661C18.2793 39.6144 32.5701 52.7912 43.0571 69.3984C34.3042 71.3717 24.6628 73.0096 13.6572 74.5925C9.06223 75.2573 4.51629 75.5985 0 75.6142V102.562C5.77854 102.541 11.6014 102.104 17.4938 101.254C31.4798 99.2421 43.7486 97.0817 55.0169 94.2334C56.7109 98.9763 58.1928 103.922 59.4626 109.07C63.1173 123.934 61.7713 136.957 55.7881 144.802C53.0789 148.347 49.6642 151.399 45.7209 154Z"
            fill="#8581FF"
          />
        </svg>
      </div>
    </div>
  )
}

export default Splash
