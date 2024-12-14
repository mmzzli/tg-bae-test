import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from '@/components/Image/Image'
import playIcon from '@/assets/icons/videoSwitch.svg'
import closeIcon from '@/assets/icons/closeIcon.svg'
import { useSafeArea } from '@/hooks/useSafeArea'
import { useStore } from '@/store'
import Hls from 'hls.js'
import MoreText from '@/components/More/MoreText'
import { useBoolean } from '@chakra-ui/react'
import ResourceFooter from '@/components/ResourceList/ResourceFooter'
import { videoScale } from '@/utils/video'
import video from '@/assets/video/a.mp4'
import { getTimeStringAutoShort } from '@/utils/utils'
import BaseButton from '@/components/BaseButton/BaseButton'
import { follow, getSomeoneProfile } from '@/api'
import { useSafeState } from 'ahooks'

const PlayButton = memo(({ onClick }: { onClick: () => void }) => (
  <div
    onClick={onClick}
    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 no-tap z-[22] w-[72px] h-[72px] bg-[rgba(0,0,0,.8)] flex items-center justify-center rounded-full"
  >
    <i className="iconfont icon-a-Frame2085661742 text-[24px] text-white"></i>
  </div>
))

const CloseButton = memo(({ onClose }: { onClose: () => void }) => (
  <div
    className="absolute right-2 top-2 z-[999] w-8 h-8 bg-black/30 rounded-full flex items-center justify-center"
    onClick={onClose}
  >
    <img src={closeIcon} alt="close" />
  </div>
))

const ProgressDisplay = memo(
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

const UserInfo = memo(
  ({
    avatar,
    username,
    content,
    uid,
    bottom,
    is_follow,
    created_at,
    id,
  }: {
    id: number | undefined
    avatar: string | undefined
    username: string | undefined
    content: string | undefined
    uid: number | undefined
    bottom: number
    is_follow?: boolean
    created_at?: number | string
  }) => {
    const followResource = useStore((state) => state.followResource)
    const setFollowResource = useStore((state) => state.setFollowResource)
    const [isFollowLoading, setIsFollowLoading] = useState<boolean>(false)
    const [visible, setVisible] = useSafeState(false)
    const doFollow = async () => {
      if (!uid || !id) return
      setVisible(false)
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
    return (
      <div
        className="absolute left-4 right-4 z-[14] flex flex-col cursor-pointer no-tap pb-3"
        style={{
          bottom: `${bottom}px`,
        }}
      >
        <div className="flex items-center">
          <Image type="avatar" src={avatar} alt="avatar" className="w-12 h-12 rounded-full" />
          <div className=" flex-col pl-2">
            <span className="text-white text-[16px]">{username}</span>
            <div className="text-white text-[12px] flex">
              {created_at && (
                <span>{getTimeStringAutoShort(new Date(created_at).getTime(), true)}</span>
              )}
              {!is_follow && <div className="pl-1.5 text-white text-[12px]">Bae selected</div>}
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
        <MoreText moreColor={'#fff'} bgColor={'#56554e'} moreLine={true} text={content || ''} />
      </div>
    )
  }
)

const VideoDialog = () => {
  const progressBarRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const hlsRef = useRef(null)
  const { bottom } = useSafeArea()

  const [url, setUrl] = useState('')
  const [playing, setPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showLoader, setShowLoader] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const info = useStore((state) => state.videoResource)
  const setVideoResource = useStore((state) => state.setVideoResource)
  const isExpanded = useStore((state) => state.expand)

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

    setUrl('')
    setDuration(0)
    setCurrentTime(0)
    setProgress(0)

    if (info?.media && info.media[0]) {
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
        video.play().catch((error) => {
          console.log(error, 'error====jacob')
          console.log('自动播放失败')
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
    if (isLoading) {
      const timer = setTimeout(() => setShowLoader(true), 500)
      return () => clearTimeout(timer)
    }
    setShowLoader(false)
  }, [isLoading])

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause()
      } else {
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

  return (
    <div
      style={{ display: url ? 'block' : 'none' }}
      className="absolute w-screen h-screen bg-black  z-[999]"
    >
      <div className="fixed w-full h-full object-contain z-10 bg-black inset-0">
        <div ref={videoContainerRef} style={{ height: '89vh' }} className="relative bg-white ">
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
            }}
            onPause={() => setPlaying(false)}
            onPlay={() => setPlaying(true)}
            onWaiting={() => setIsLoading(true)}
            onPlaying={() => setIsLoading(false)}
            controls={false}
            playsInline
            onClick={togglePlay}
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
          {!isLoading && !playing && <PlayButton onClick={togglePlay} />}
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
            bottom={bottom}
            is_follow={info?.is_follow}
            created_at={info?.created_at}
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
