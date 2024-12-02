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

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 dark:bg-[#0D0D0D] bg-white flex justify-center items-center z-10 flex-col">
      <div className="absolute top-[-1px] right-[-1px]">
        <Icon name={'icon-chatu_youshang'} style={{ width: '165px', height: '166px' }}></Icon>
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
      <div className="absolute left-[-7px] bottom-[-8px]">
        <Icon name={'icon-chatu_zuoxia1'} style={{ width: '138.11px', height: '154px' }}></Icon>
      </div>
    </div>
  )
}

export default Splash
