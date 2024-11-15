import { Dialog, DialogContent } from '@/components/BaseDialog/BaseDialog'
import { FormatterListItem } from '@/store/slices/resourceListSlice'
import Hls from 'hls.js'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import closeIcon from '@/assets/icons/closeIcon.svg'
import Image from '@/components/Image/Image'

const ProgressDisplay = memo(
  ({ progress, isDragging }: { progress: number; isDragging: boolean }) => (
    <div className="h-full bg-white rounded-full relative" style={{ width: `${progress}%` }}>
      {/* Point */}
      <div
        className={`absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4
                    bg-white rounded-full scale-0
                    ${isDragging ? 'scale-100' : 'group-hover:scale-100'}
                    transition-transform duration-200`}
      />
    </div>
  )
)
const UserInfo = memo(
  ({
    avatar,
    username,
    content,
  }: {
    avatar: string | undefined
    username: string | undefined
    content: string | undefined
  }) => (
    <div className="absolute left-4 bottom-12 z-10 flex flex-col cursor-pointer no-tap">
      <div className="flex items-center">
        <Image rect src={avatar} alt="avatar" className="w-10 h-10 rounded-full" />
        <span className="text-white text-sm ml-2 shadow-sm">{username}</span>
      </div>
      <p className="text-white text-xs mt-2 line-clamp-2 overflow-hidden">{content}</p>
    </div>
  )
)

export function VideoDialog({
  info,
  onClose,
}: {
  info: FormatterListItem | null
  onClose: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef(0)

  const [slideOffset, setSlideOffset] = useState(0)
  const [isSliding, setIsSliding] = useState(false)
  const touchStartXRef = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

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

  const updateProgress = useCallback(() => {
    const video = videoRef.current
    if (!video || !video.duration || isDragging) return

    const currentProgress = (video.currentTime / video.duration) * 100
    progressRef.current = currentProgress
    setProgress(currentProgress)
  }, [isDragging])

  const handleProgressChange = (e: React.MouseEvent | React.TouchEvent) => {
    const video = videoRef.current
    const progressBar = progressBarRef.current
    if (!video || !progressBar) return

    const rect = progressBar.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    const newProgress = (x / rect.width) * 100

    video.currentTime = (newProgress / 100) * video.duration
    setProgress(newProgress)
    progressRef.current = newProgress
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      setIsDragging(true)
      handleProgressChange(e)
    },
    [handleProgressChange]
  )

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX
    setIsSliding(true)
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isSliding) return

      const deltaX = e.touches[0].clientX - touchStartXRef.current
      const screenWidth = window.innerWidth

      //  -screenWidth ～ 0
      const newOffset = Math.max(-screenWidth, Math.min(0, deltaX))

      setSlideOffset(newOffset)
    },
    [isSliding]
  )

  const handleTouchEnd = useCallback(() => {
    setIsSliding(false)
    const screenWidth = window.innerWidth

    // slide to left over 40% screen width
    if (Math.abs(slideOffset) > screenWidth * 0.4) {
      setSlideOffset(-screenWidth)
    } else {
      setSlideOffset(0)
    }
  }, [slideOffset])

  useEffect(() => {
    let rafId: number

    const animate = () => {
      updateProgress()
      rafId = requestAnimationFrame(animate)
    }

    if (isPlaying && !isDragging) {
      rafId = requestAnimationFrame(animate)
    }

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [isPlaying, isDragging, updateProgress])

  return (
    <>
      <Dialog open={true}>
        <DialogContent className="p-0">
          <div
            className="relative w-screen h-screen bg-black"
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="absolute right-2 top-2 z-10 w-8 h-8 bg-black/30 rounded-full overflow-hidden flex items-center justify-center">
              <img src={closeIcon} alt="close" onClick={onClose} />
            </div>
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              src={info?.media[0]}
              onClick={togglePlay}
              controls={false}
            />

            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            )}

            {!isPlaying && (
              <div
                onClick={togglePlay}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <div className="w-20 h-20 bg-white/50 rounded-full flex items-center justify-center">
                  <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2" />
                </div>
              </div>
            )}

            <div
              className="absolute left-0 right-0 bottom-0 z-10 flex flex-col transition-transform duration-300 ease-out"
              style={{
                transform: `translateX(${slideOffset}px)`,
              }}
            >
              <UserInfo avatar={info?.avatar} username={info?.username} content={info?.title} />
              {/* Progress Touch Bar */}
              <div
                ref={progressBarRef}
                className="absolute bottom-6 left-0 right-0 px-4 touch-none"
                onMouseDown={handleDragStart}
                onMouseMove={(e) => isDragging && handleProgressChange(e)}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleDragStart}
                onTouchMove={(e) => isDragging && handleProgressChange(e)}
                onTouchEnd={handleDragEnd}
              >
                <div className="relative group h-8 -my-2 flex items-center cursor-pointer no-tap">
                  {/* Touchable Area */}
                  <div className="absolute inset-0" />

                  {/* BG */}
                  <div
                    className={`w-full ${isDragging ? 'h-2' : 'h-[1px] group-hover:h-2'}
                bg-gray-500/30 rounded-full transition-[height] duration-200`}
                  >
                    {/* Progress */}
                    <ProgressDisplay progress={progress} isDragging={isDragging} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
