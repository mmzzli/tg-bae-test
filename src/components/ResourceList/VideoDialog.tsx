import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import Image from '@/components/Image/Image'
import playIcon from '@/assets/icons/videoSwitch.svg'
import closeIcon from '@/assets/icons/closeIcon.svg'
import { useSafeArea } from '@/hooks/useSafeArea'
import { useStore } from '@/store'
import Hls from 'hls.js'

const PlayButton = memo(({ onClick }: { onClick: () => void }) => (
  <div
    onClick={onClick}
    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 no-tap z-[22]"
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
  const videoRef = useRef<HTMLVideoElement>(null)
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
      setUrl('')
      setDuration(0)
      setCurrentTime(0)
    }
    if (info?.media && info.media[0]) {
      setUrl(info.media[0])
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
        video.play().catch(() => {
          console.log('自动播放失败')
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

  return (
    <div
      style={{ display: url ? 'block' : 'none' }}
      className="absolute w-screen h-screen bg-black overflow-hidden z-[999]"
    >
      <div className="fixed w-full h-full object-contain z-10 bg-black inset-0">
        <video
          ref={videoRef}
          className="absolute w-full h-full object-contain z-10"
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
            setIsLoading(true)
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
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}
        {!isLoading && !playing && <PlayButton onClick={togglePlay} />}

        <div
          ref={progressBarRef}
          className="absolute bottom-6 left-0 right-0 px-4 touch-none z-20"
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

        <UserInfo
          avatar={info?.avatar}
          username={info?.username}
          content={info?.title}
          uid={info?.uid}
          bottom={bottom}
        />

        <CloseButton onClose={onClose} />
      </div>
    </div>
  )
}

export default VideoDialog
