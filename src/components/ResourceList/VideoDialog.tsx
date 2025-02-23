import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from '@/components/Image/Image'
import closeIcon from '@/assets/icons/closeIcon.svg'
import { useSafeArea } from '@/hooks/useSafeArea'
import { useStore } from '@/store'
import Hls from 'hls.js'
import MoreText from '@/components/More/MoreText'
import ResourceFooter from '@/components/ResourceList/ResourceFooter'
import { videoScale } from '@/utils/video'
import { getTimeStringAutoShort } from '@/utils/utils'
import BaseButton from '@/components/BaseButton/BaseButton'
import { follow, getSomeoneProfile, totalAvailableInvoice } from '@/api'
import { useProfileNavigation } from '@/hooks/useProfileNavigation'
import { UserItem } from '@/types'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { useDrag } from 'react-use-gesture'
import { HStack, Text } from '@chakra-ui/react'
import { FormatterListItem } from '@/store/slices/resourceListSlice'
import PurchaseButton from './PurchaseButton'
import { ReplayTrangleIcon } from '@/assets/icons'
import { useDailyTaskActions } from '@/hooks/useDailyTask'

export const PlayButton = memo(({ onClick }: { onClick: () => void }) => (
  <div
    onClick={onClick}
    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 no-tap z-[22] w-[72px] h-[72px] bg-[rgba(0,0,0,.8)] flex items-center justify-center rounded-full"
  >
    <i className="iconfont icon-a-Frame2085661742 text-[24px] text-white"></i>
  </div>
))

export const ReplayButton = memo(({ onClick }: { onClick: () => void }) => (
  <HStack
    position="fixed"
    top="0"
    left="0"
    width="100%"
    height="90%"
    bg="rgba(0,0,0,.5)"
    zIndex={13}
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
  >
    <Text color="#fff" fontSize="14px">
      Unlock now to view the full video.
    </Text>
    <div
      className="flex items-center gap-1 bg-white px-[12px] py-[8px] rounded-[20px] mt-[12px]"
      onClick={onClick}
    >
      <img src={ReplayTrangleIcon} alt="replay" className="w-[12px] h-[12px]" />
      <Text color="#333" fontSize="14px">
        Replay
      </Text>
    </div>
  </HStack>
))

const CloseButton = memo(({ onClose }: { onClose: () => void }) => (
  <div
    className="absolute right-2 top-2 z-[999] w-8 h-8 bg-black/30 rounded-full flex items-center justify-center"
    onClick={onClose}
  >
    <img src={closeIcon} alt="close" />
  </div>
))

export const ProgressDisplay = memo(
  ({ progress, isDragging }: { progress: number; isDragging: boolean }) => (
    <div className="h-full bg-white rounded-full relative " style={{ width: `${progress}%` }}>
      <div
        className={`absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full ${
          isDragging ? 'scale-100' : 'scale-0'
        } transition-transform duration-200`}
      />
    </div>
  )
)

export const UserInfo = memo(
  ({
    avatar,
    username,
    content,
    uid,
    bottom,
    is_follow,
    created_at,
    id,
    info,
    onClose,
    exchangeRate,
  }: {
    id: number | undefined
    avatar: string | undefined
    username: string | undefined
    content: string | undefined
    uid: number | undefined
    bottom: number
    is_follow?: boolean
    created_at?: number | string
    info: FormatterListItem | null
    onClose: () => void
    exchangeRate?: number
  }) => {
    const followResource = useStore((state) => state.followResource)
    const setFollowResource = useStore((state) => state.setFollowResource)
    const [isFollowLoading, setIsFollowLoading] = useState<boolean>(false)
    const jumpToProfilePage = useProfileNavigation()
    const setVideoResource = useStore((state) => state.setVideoResource)
    const userInfo = useStore((state) => state.userInfo)
    const { getCurrentUid } = useTMAUtils()
    const current_uid = getCurrentUid()
    const [isPaid, setIsPaid] = useState<boolean>(false)
    const doFollow = async () => {
      if (!uid || !id) return
      setIsFollowLoading(true)
      await getSomeoneProfile(uid)
      await follow({
        fansid: id,
        tgid: uid,
      })
      setIsFollowLoading(false)
      const res: any = followResource?.map((user) =>
        user.uid === uid ? { ...user, boll: !user.boll } : user
      )
      setFollowResource(res)
    }

    const handleToProfilePage = useCallback(() => {
      jumpToProfilePage({ uid } as UserItem)
      setVideoResource(null)
    }, [uid])

    const resourcesEve = (post_id: number, url: string, is_pay?: boolean) => {
      const options = is_pay ? { is_pay } : {}
      const medias = url.split(',')
      const picUrl = medias.find((item) => !item.endsWith('.m3u8'))
      const media = medias.find((item) => item.endsWith('.m3u8'))
      if (media) {
        setVideoResource({
          ...info,
          media: [media],
          mediaCover: picUrl ?? '',
          ...options,
        } as FormatterListItem)
      }
    }

    return (
      <div
        className="absolute left-4 right-4 z-[14] flex flex-col cursor-pointer no-tap pb-4 "
        style={{
          bottom: bottom ? `20vh` : bottom,
          zIndex:'100'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Image
              rect={true}
              type="avatar"
              src={avatar}
              alt="avatar"
              className="w-12 h-12 rounded-full"
              onClick={handleToProfilePage}
            />
            <div className=" flex-col pl-2">
              <div>
                <span className="text-white text-[16px] font-[500]" onClick={handleToProfilePage}>
                  {username}
                </span>
                {created_at && (
                  <span className="ml-[4px] text-white text-[12px] font-[400]">{getTimeStringAutoShort(new Date(created_at).getTime(), true)}</span>
                )}
              </div>
              <div className="text-white text-[12px] flex">
                {!is_follow && current_uid !== uid && (
                  <div className="pl-1.5 text-white text-[12px]">Bae selected</div>
                )}
              </div>
            </div>
          </div>
          <div className="pl-4">
            {followResource?.some((user) => user.uid === uid && !user.is_follow) && (
              <BaseButton
                text={
                  followResource?.some((user) => user.uid === uid && user.boll)
                    ? `Following`
                    : `Follow`
                }
                loading={isFollowLoading}
                loadingColor="border-t-[#999]"
                width={
                  followResource?.some((user) => user.uid === uid && user.boll) ? '104px' : '80px'
                }
                height="34px"
                handler={doFollow}
                className={`border-[0.5px]  bg-transparent text-white border-[#CDCDD4] `}
              />
            )}
          </div>
        </div>
        <MoreText textColor={'#fff'} text={content || ''} bgColor={'#000'} onTextClick={onClose}/>
        {info && info?.price > 0 && !info?.is_pay && info?.uid !== current_uid && (
          <div className="mt-2">
            <PurchaseButton
              price={info?.price || 0}
              post_id={info?.id || 0}
              resourcesEve={resourcesEve}
              setIsPaid={setIsPaid}
              exchangeRate={exchangeRate || 0}
            />
          </div>
        )}
      </div>
    )
  }
)

const VideoDialog = () => {
  const progressBarRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const { bottom } = useSafeArea()
  const { runDailyWatch } = useDailyTaskActions()

  const [url, setUrl] = useState('')
  const [playing, setPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showLoader, setShowLoader] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [ended, setEnded] = useState(false)
  const [exchangeRate, setExchangeRate] = useState<number>(0)

  const info = useStore((state) => state.videoResource)
  const setVideoResource = useStore((state) => state.setVideoResource)
  const isExpanded = useStore((state) => state.expand)
  const { getCurrentUid } = useTMAUtils()
  const token = useStore((state) => state.token)

  useEffect(() => {
    if (token) {
      const fetchExchangeRate = async () => {
        const response = await totalAvailableInvoice()
        setExchangeRate(response.exchange_rate)
      }
      fetchExchangeRate()
    }
  }, [token])

  const onClose = () => {
    if (videoRef?.current) {
      videoRef.current.currentTime = 0
    }
    setTimeout(() => {
      setVideoResource(null)
      setDuration(0)
      setCurrentTime(0)
    }, 100)
  }

  useEffect(() => {
    if (videoRef?.current) {
      videoRef.current.currentTime = 0
    }

    if (info) {
      runDailyWatch(info.id)
    }

    setUrl('')
    setDuration(0)
    setCurrentTime(0)
    setProgress(0)
    if (info?.trailer && info.price > 0 && !info.is_pay && info.uid != getCurrentUid()) {
      setUrl(info.trailer)
    } else if (info?.media && info.media[0]) {
      setUrl(info.media[0])
    }
    if (!info && videoRef?.current) {
      setTimeout(() => {
        setVideoResource(null)
      }, 100)
    }
  }, [info])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !url) return

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        autoStartLoad: true,
        maxBufferHole: 0.5,
        lowLatencyMode: true,
      })

      hls.loadSource(url)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.muted = false
        video.play().catch((error) => {
          console.log('视频自动播放失败', error)
          video.muted = true
          video.play()
        })
      })

      hls.on(Hls.Events.ERROR, () => {
        setIsLoading(false)
      })

      return () => {
        hls.destroy()
      }
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => {
          console.log('自动播放失败')
        })
      })
    }
  }, [url])

  useEffect(() => {
    const video = videoRef.current
    if (isLoading) {
      const timer = setTimeout(() => setShowLoader(true), 500)
      return () => clearTimeout(timer)
    } else {
      if (video?.paused) {
        video.muted = false
        video.play().catch((error) => {
          console.log(error, 'error====jacob')
          console.log('自动播放失败')
          video.muted = true
          video.play()
          setTimeout(() => {
            video.muted = false
          }, 1000)
        })
      }
    }
    setShowLoader(false)
  }, [isLoading])

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      setEnded(false)
      if (playing) {
        videoRef.current.pause()
      } else {
        videoRef.current.muted = false
        videoRef.current.play()
      }
      setPlaying((prev) => !prev)
    }
  }, [playing])

  const handleSeek = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const progressBar = progressBarRef.current
      if (!progressBar || !videoRef.current || duration === 0) return

      const rect = progressBar.getBoundingClientRect()
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
      const newProgress = (x / rect.width) * 100
      const newTime = (newProgress / 100) * duration

      setProgress(newProgress)
      videoRef.current.currentTime = newTime
    },
    [duration]
  )

  const scale = useMemo(() => {
    if (info && videoContainerRef.current) {
      return videoScale({ ...info, width: 640, height: 360 }, videoContainerRef.current)
    }
    return 'object-cover'
  }, [info, videoContainerRef])

  const bind = useDrag(({ down, movement: [mx], direction: [xDir], velocity }) => {
    if (isDragging) return
    if (down && xDir > 0 && mx > 100 && velocity > 0.2) {
      onClose()
    }
  })

  return (
    <div
      style={{ display: url ? 'block' : 'none' }}
      className="absolute w-screen h-screen bg-black  z-[1000]"
    >
      <div className="fixed w-full h-full object-contain z-10 bg-black inset-0">
        <div
          {...bind()}
          ref={videoContainerRef}
          style={{ height: '89vh' }}
          className="relative bg-white "
        >
          <div
            className=" z-[12] absolute w-full h-full bg-video-gradient"
            onClick={togglePlay}
          ></div>
          <video
            ref={videoRef}
            className={`absolute w-full h-full ${scale} z-10 bg-black`}
            src={url}
            onLoadedMetadata={(e) => {
              const video = e.currentTarget
              setDuration(video.duration)
            }}
            onTimeUpdate={(e) => {
              const video = e.currentTarget
              if (!isDragging) {
                setCurrentTime(video.currentTime)
                setProgress((video.currentTime / video.duration) * 100)
              }
            }}
            onEnded={() => {
              setPlaying(false)
              setEnded(true)
            }}
            onPause={() => setPlaying(false)}
            onPlay={() => setPlaying(true)}
            onWaiting={() => setIsLoading(true)}
            onPlaying={() => setIsLoading(false)}
            controls={false}
            playsInline
            webkit-playsinline="true"
            x5-playsinline="true"
            x5-video-player-type="h5"
            x5-video-player-fullscreen="false"
            preload="auto"
            x-webkit-airplay="allow"
          />
          {showLoader && (
            <div className="absolute z-[18] inset-0 flex items-center justify-center bg-black/50">
              <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          )}
          {!isLoading && !playing ? (
            info?.price && !info?.is_pay && ended ? (
              <ReplayButton onClick={togglePlay} />
            ) : (
              <PlayButton onClick={togglePlay} />
            )
          ) : null}
          <div
            ref={progressBarRef}
            className="absolute bottom-[-6px] left-0 right-0  touch-none z-20"
            onMouseDown={() => setIsDragging(true)}
            onMouseMove={(e) => isDragging && handleSeek(e)}
            onMouseUp={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchMove={(e) => isDragging && handleSeek(e)}
            onTouchEnd={() => setIsDragging(false)}
          >
            <div className="relative group h-8 -my-2 flex items-center cursor-pointer no-tap">
              <div className="absolute inset-0" />
              <div
                className={`w-full h-[2px] group-hover:h-2'}
                    bg-white/20 rounded-full transition-[height] duration-200`}
              >
                <ProgressDisplay progress={progress} isDragging={isDragging} />
              </div>
            </div>
          </div>
          <UserInfo
            id={info?.id}
            avatar={info?.avatar}
            username={info?.username}
            content={info?.title}
            uid={info?.uid}
            info={info}
            bottom={bottom}
            is_follow={info?.is_follow}
            created_at={info?.created_at}
            onClose={onClose}
            exchangeRate={exchangeRate}
          />
        </div>

        <div className="" style={{ height: '11vh' }}>
          {!isExpanded && <CloseButton onClose={onClose} />}
          {info && (
            <div className="pt-3">
              <ResourceFooter data={info}></ResourceFooter>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VideoDialog
