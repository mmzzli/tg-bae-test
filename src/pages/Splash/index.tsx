import { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { retrieveLaunchParams } from '@tma.js/sdk'
import { getSingleMedia } from '@/api/list'
import Lottie from 'lottie-react'
import logoData from '@/assets/animations/logo.json'
import Icon from '@/components/comm/Icon'
import { useSafeState } from 'ahooks'
import { useRecommendList } from '@/store/hook/useResourceList'
import { FormatterListItem } from '@/store/slices/resourceListSlice'
import Hls from 'hls.js'

const SHARE_POST = 1
const SHARE_PROFILE = 2

const Splash: FC = () => {
  const navigate = useNavigate()
  const userInfo = useStore((state) => state.userInfo)
  const setCacheVideo = useStore((state) => state.setCacheVideo)

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
    const cacheVideos = async (resources: any) => {
      const totalVideos = resources.length
      const progressArray = new Array(totalVideos).fill(0)
      resources.map((item: any, index: number) => {
        if (Hls.isSupported()) {
          const hls = new Hls()
          const targetFragments = 1
          let bufferedFragments = 0

          hls.loadSource(item.media[0])
          hls.attachMedia(document.createElement('video'))

          hls.on(Hls.Events.FRAG_BUFFERED, () => {
            bufferedFragments++
            progressArray[index] = bufferedFragments
            console.log(`视频 ${index + 1} 缓存分片数量: ${bufferedFragments}`)
            if (bufferedFragments >= targetFragments) {
              if (index + 1 === resources.length) {
                console.log('缓存完成')
                setIsCached(true)
              }
              hls.destroy()
            }
          })
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log(`视频 ${index + 1} 流解析完成，开始缓存`)
          })

          hls.on(Hls.Events.ERROR, (event, data) => {
            setIsCached(true)
            hls.destroy()
          })
        } else {
          setIsCached(true)
          console.error('HLS.js 不支持当前浏览器环境')
        }
      })
    }

    if (list && list.length > 0) {
      const resources = list.filter((item) => item.type === 0)
      cacheVideos(resources)
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
    <div className="fixed w-screen h-screen bg-[#0D0D0D] flex justify-center items-center z-10 flex-col relative">
      <div className="absolute top-[-1px] right-[-1px]">
        <Icon name={'icon-chatu_youshang'} style={{ width: '165px', height: '166px' }}></Icon>
      </div>
      <div className="flex justify-center items-center flex-col">
        <div className="w-[210px] h-[210px]">
          <Icon name={'icon-logo'} style={{ width: '210px', height: '210px' }}></Icon>
        </div>
        <div className="text-[var(--Dark-T1)]  text-[24px] font-bold leading-[1.5] capitalize text-center">
          welcome to Bae
        </div>
        <div className="mt-[12px] text-[var(--Dark-T1)] opacity-50 pl-[36px] pr-[36px] text-center tracking-[1px]">
          Connect with people you like on a deeper level.
        </div>
      </div>
      <div className="absolute left-[-7px] bottom-[-8px]">
        <Icon name={'icon-chatu_zuoxia'} style={{ width: '138.11px', height: '154px' }}></Icon>
      </div>
    </div>
  )
}

export default Splash
