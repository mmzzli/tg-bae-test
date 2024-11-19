import { FC, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { retrieveLaunchParams } from '@tma.js/sdk'
import { getSingleMedia } from '@/api/list'
import Lottie from 'lottie-react'
import logoData from '@/assets/animations/logo.json'
import Icon from '@/components/comm/Icon'

const SHARE_POST = 1
const SHARE_PROFILE = 2

const Splash: FC = () => {
  const navigate = useNavigate()
  const userInfo = useStore((state) => state.userInfo)
  const { token, setSharedPostList, setOthersUserInfo } = useStore((state) => ({
    setSharedPostList: state.setSharedPostList,
    setOthersUserInfo: state.setOthersUserInfo,
    token: state.token,
  }))

  const { isInTMA } = useTMAUtils()
  const { startParam } = retrieveLaunchParams()
  useEffect(() => {
    if (userInfo.user_id && token) {
      if (!isInTMA || !startParam || history.length > 2) return navigate('/home')
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
        handleNavigate(sharedRef)
      } else {
        navigate('/home')
      }
    }
  }, [userInfo])

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
    <div className="fixed w-screen h-screen bg-[#0D0D0D] flex justify-center items-center z-10 flex-col relative">
      <div className="absolute top-[-1px] right-[-1px]">
        <Icon name={'icon-chatu_youshang'} style={{width:'165px', height:'166px'}}></Icon>
      </div>
      <div className="flex justify-center items-center flex-col">
        <div className="w-[210px] h-[210px]">
          <Lottie
            animationData={logoData}
            loop={true}
            autoplay={true}
          ></Lottie>
        </div>
        <div className="text-[var(--Dark-T1)]  text-[24px] font-bold leading-[1.5] capitalize text-center">welcome to Bae</div>
        <div className="mt-[12px] text-[var(--Dark-T1)] opacity-50 pl-[36px] pr-[36px] text-center tracking-[1px]">Connect with people you like on a deeper level.</div>
      </div>
      <div className="absolute left-[-7px] bottom-[-8px]">
        <Icon name={'icon-chatu_zuoxia'} style={{width:'138.11px', height:'154px'}}></Icon>
      </div>
    </div>
  )
}

export default Splash
