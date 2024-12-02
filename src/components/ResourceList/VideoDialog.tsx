import React, { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import ReactPlayer from 'react-player'
import Image from '@/components/Image/Image'
import playIcon from '@/assets/icons/videoSwitch.svg'
import closeIcon from '@/assets/icons/closeIcon.svg'
import { useSafeArea } from '@/hooks/useSafeArea'
import { useTouch } from '@/hooks/useTouch'
import { useThrottleFn } from 'ahooks'
import { CardRecommendProvider } from '@/utils/constants'
import { useStore } from '@/store'
import Hls from 'hls.js'

const PlayButton = memo(({ onClick }: { onClick: () => void }) => (
  <div
    onClick={onClick}
    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 no-tap z-1"
  >
    <Image src={playIcon} alt="play" className="w-[72px] h-[72px] no-tap" />
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
    <div className="h-full bg-white rounded-full relative" style={{ width: `${progress}%` }}>
      <div
        className={`absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full ${
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
  }: {
    avatar: string | undefined
    username: string | undefined
    content: string | undefined
    uid: number | undefined
    bottom: number
  }) => (
    <div
      className="absolute left-4 right-4 z-10 flex flex-col cursor-pointer no-tap"
      style={{
        bottom: `${bottom + 68}px`,
      }}
    >
      <div className="flex items-center">
        <Image rect src={avatar} alt="avatar" className="w-10 h-10 rounded-full" />
        <span className="text-white text-sm ml-2 shadow-sm">{username}</span>
      </div>
      <p className="text-white text-xs mt-2 line-clamp-2 overflow-hidden">{content}</p>
    </div>
  )
)

const VideoDialog = () => {
  const progressBarRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const hlsRef = useRef<Hls | null>(null)
  const touchStartXRef = useRef(0)
  const { bottom } = useSafeArea()

  const [url, setUrl] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true) // 控制 Loading
  const [showLoader, setShowLoader] = useState(false) // 延迟显示 Loader
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [slideOffset, setSlideOffset] = useState(0)
  const [isSliding, setIsSliding] = useState(false)
  const cardValue = useContext(CardRecommendProvider)
  const [isReady, setIsReady] = useState(false)

  const info = useStore((state) => state.videoResource)
  const setVideoResource = useStore((state) => state.setVideoResource)

  const onClose = () => {
    setVideoResource(null)
    setIsReady(false)
    setDuration(0)
    setCurrentTime(0)
    setUrl(null)
  }

  useEffect(() => {
    if (!url) {
      setIsReady(false)
      setDuration(0)
      setCurrentTime(0)
      setUrl(null)
    }
  }, [url])

  useEffect(() => {
    if (info?.media && info.media[0]) {
      setUrl(info.media[0])
    } else {
      setUrl(null)
    }
  }, [info])

  useEffect(() => {
    setPlaying(true)
  }, [isReady])

  // 延迟显示 Loading（例如超过 500ms 后再显示）
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setShowLoader(true), 500)
      return () => clearTimeout(timer)
    }
    setShowLoader(false)
  }, [isLoading])

  const togglePlay = useCallback(() => {
    setPlaying((prev) => !prev)
  }, [])

  const handleProgress = useCallback(
    ({ playedSeconds }: { playedSeconds: number }) => {
      if (!isDragging) {
        setCurrentTime(playedSeconds)
        setProgress((playedSeconds / duration) * 100)
      }
    },
    [isDragging, duration]
  )

  const handleSeek = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const progressBar = progressBarRef.current
    if (!progressBar || !videoRef.current) return

    const rect = progressBar.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    const newProgress = (x / rect.width) * 100
    setProgress(newProgress)
    videoRef.current.currentTime = newProgress
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX
    setIsSliding(true)
  }, [])

  const { run: handleTouchMove } = useThrottleFn(
    (e: React.TouchEvent) => {
      if (isDragging || !isSliding) return
      const deltaX = e.touches[0].clientX - touchStartXRef.current
      const screenWidth = window.innerWidth
      setSlideOffset(Math.max(-screenWidth, Math.min(0, deltaX)))
    },
    { wait: 16 }
  )

  const handleTouchEnd = useCallback(() => {
    setIsSliding(false)
    const screenWidth = window.innerWidth
    setSlideOffset(Math.abs(slideOffset) > 60 ? -screenWidth : 0)
  }, [slideOffset])

  const { touchHandlers } = useTouch({
    onTap: togglePlay,
    onTouchStartProp: handleTouchStart,
    onTouchMoveProp: handleTouchMove,
    onTouchEndProp: handleTouchEnd,
  })

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (Hls.isSupported() && info) {
      const hls = new Hls({
        enableWorker: true,
        // selected options
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        autoStartLoad: true,
        maxBufferHole: 0.5,
        lowLatencyMode: true,
      })

      hls.loadSource(info.media[0])
      hls.attachMedia(video)
      hlsRef.current = hls
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false)
        video.play().catch(() => {
          console.log('自动播放失败')
        })
      })

      // 添加错误处理
      hls.on(Hls.Events.ERROR, () => {
        setIsLoading(false)
      })

      // 清理函数
      return () => {
        hls.destroy()
      }
    } else if (video.canPlayType('application/vnd.apple.mpegurl') && info) {
      video.src = info.media[0]
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => {
          console.log('自动播放失败')
        })
      })
    }
  }, [info])

  return (
    <div
      style={{ display: url ? 'block' : 'none' }}
      className="absolute w-screen h-screen bg-black overflow-hidden z-[999]"
      {...touchHandlers}
    >
      <div className="fixed w-full h-full object-contain z-10 bg-black inset-0">
        {url && (
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            src={info?.media[0]}
            onClick={togglePlay}
            controls={false}
          />
        )}
        <CloseButton
          onClose={() => {
            onClose()
            cardValue?.setVideoOpen(false)
            setPlaying(false)
          }}
        />
        {showLoader && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}
        {!playing && !isLoading && <PlayButton onClick={togglePlay} />}
        <div
          className="absolute left-0 right-0 bottom-0 z-10 flex flex-col transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(${slideOffset}px)`,
          }}
        >
          <UserInfo
            avatar={info?.avatar}
            username={info?.username}
            content={info?.title}
            uid={info?.uid}
            bottom={bottom}
          />
          <div
            ref={progressBarRef}
            className="absolute bottom-6 left-0 right-0 px-4 touch-none"
            style={{
              paddingBottom: `${bottom + 20}px`,
            }}
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
                className={`w-full ${isDragging ? 'h-2' : 'h-[1px] group-hover:h-2'}
                      bg-gray-500/30 rounded-full transition-[height] duration-200`}
              >
                <ProgressDisplay progress={progress} isDragging={isDragging} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoDialog
