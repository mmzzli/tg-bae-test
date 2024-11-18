import { Dialog, DialogContent } from '@/components/BaseDialog/BaseDialog'
import { FormatterListItem } from '@/store/slices/resourceListSlice'
import Hls from 'hls.js'
import { memo, useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { useThrottleFn } from 'ahooks'
import closeIcon from '@/assets/icons/closeIcon.svg'
import Image from '@/components/Image/Image'
import playIcon from '@/assets/icons/videoSwitch.svg'
import { useTouch } from '@/hooks/useTouch'
import { useSafeArea } from '@/hooks/useSafeArea'

type State = {
  isPlaying: boolean
  isLoading: boolean
  progress: number
  isDragging: boolean
  slideOffset: number
  isSliding: boolean
}

type Action =
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PROGRESS'; payload: number }
  | { type: 'SET_DRAGGING'; payload: boolean }
  | { type: 'SET_SLIDE_OFFSET'; payload: number }
  | { type: 'SET_SLIDING'; payload: boolean }

const initialState: State = {
  isPlaying: true,
  isLoading: true,
  progress: 0,
  isDragging: false,
  slideOffset: 0,
  isSliding: false,
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_PROGRESS':
      return { ...state, progress: action.payload }
    case 'SET_DRAGGING':
      return { ...state, isDragging: action.payload }
    case 'SET_SLIDE_OFFSET':
      return { ...state, slideOffset: action.payload }
    case 'SET_SLIDING':
      return { ...state, isSliding: action.payload }
    default:
      return state
  }
}

const UserInfo = memo(
  ({
    avatar,
    username,
    content,
    bottom,
  }: {
    avatar: string | undefined
    username: string | undefined
    content: string | undefined
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

const CloseButton = memo(({ onClose }: { onClose: () => void }) => (
  <div
    className="absolute right-2 top-2 z-20 w-8 h-8 bg-black/30 rounded-full overflow-hidden flex items-center justify-center"
    onTouchEnd={(e) => {
      e.preventDefault()
      e.stopPropagation()
      onClose()
    }}
    onClick={onClose}
  >
    <img src={closeIcon} alt="close" />
  </div>
))

const PlayButton = memo(({ onClick }: { onClick: (e: React.MouseEvent) => void }) => (
  <div
    onClick={onClick}
    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 no-tap z-20"
  >
    <Image src={playIcon} alt="play" className="w-[72px] h-[72px] no-tap" />
  </div>
))

export function VideoDialog({
  info,
  onClose,
}: {
  info: FormatterListItem | null
  onClose: () => void
}) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef(0)
  const touchStartXRef = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const { bottom } = useSafeArea()
  // video init
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (Hls.isSupported() && info) {
      const hls = new Hls({
        enableWorker: true,
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
        dispatch({ type: 'SET_LOADING', payload: false })
        video.play().catch(() => {
          console.log('auto play failed')
        })
      })

      hls.on(Hls.Events.ERROR, () => {
        dispatch({ type: 'SET_LOADING', payload: false })
      })

      return () => {
        hls.destroy()
      }
    } else if (video.canPlayType('application/vnd.apple.mpegurl') && info) {
      video.src = info.media[0]
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => {
          console.log('auto play failed')
        })
      })
    }
  }, [info])

  const { run: updateProgress } = useThrottleFn(
    () => {
      const video = videoRef.current
      if (!video || !video.duration || state.isDragging) return

      const currentProgress = (video.currentTime / video.duration) * 100
      progressRef.current = currentProgress
      dispatch({ type: 'SET_PROGRESS', payload: currentProgress })
    },
    { wait: 16 }
  )
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX
    dispatch({ type: 'SET_SLIDING', payload: true })
  }, [])

  const { run: handleTouchMove } = useThrottleFn(
    (e: React.TouchEvent) => {
      if (state.isDragging) return
      if (!state.isSliding) return

      const deltaX = e.touches[0].clientX - touchStartXRef.current
      const screenWidth = window.innerWidth

      const newOffset = Math.max(-screenWidth, Math.min(0, deltaX))
      dispatch({ type: 'SET_SLIDE_OFFSET', payload: newOffset })
    },
    { wait: 16 }
  )

  const handleTouchEnd = useCallback(() => {
    dispatch({ type: 'SET_SLIDING', payload: false })
    const screenWidth = window.innerWidth

    if (Math.abs(state.slideOffset) > screenWidth * 0.33) {
      dispatch({ type: 'SET_SLIDE_OFFSET', payload: -screenWidth })
    } else {
      dispatch({ type: 'SET_SLIDE_OFFSET', payload: 0 })
    }
  }, [state.slideOffset])

  const { touchHandlers } = useTouch({
    onTap: () => {
      togglePlay()
    },
    onTouchStartProp: handleTouchStart,
    onTouchMoveProp: handleTouchMove,
    onTouchEndProp: handleTouchEnd,
  })

  const handleProgressChange = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const video = videoRef.current
    const progressBar = progressBarRef.current
    if (!video || !progressBar) return

    const rect = progressBar.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    const newProgress = (x / rect.width) * 100

    video.currentTime = (newProgress / 100) * video.duration
    dispatch({ type: 'SET_PROGRESS', payload: newProgress })
    progressRef.current = newProgress
  }, [])

  const handleDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      dispatch({ type: 'SET_DRAGGING', payload: true })
      handleProgressChange(e)
    },
    [handleProgressChange]
  )

  const handleDragEnd = useCallback(() => {
    dispatch({ type: 'SET_DRAGGING', payload: false })
  }, [])

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (state.isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      dispatch({ type: 'SET_PLAYING', payload: !state.isPlaying })
    }
  }, [state.isPlaying])

  // progress update animation frame
  useEffect(() => {
    let rafId: number

    const animate = () => {
      updateProgress()
      rafId = requestAnimationFrame(animate)
    }

    if (state.isPlaying && !state.isDragging) {
      rafId = requestAnimationFrame(animate)
    }

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [state.isPlaying, state.isDragging, updateProgress])

  const ProgressDisplay = memo(
    ({ progress, isDragging }: { progress: number; isDragging: boolean }) => (
      <div className="h-full bg-white rounded-full relative" style={{ width: `${progress}%` }}>
        <div
          className={`absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4
                        bg-white rounded-full scale-0
                        ${isDragging ? 'scale-100' : 'group-hover:scale-100'}
                        transition-transform duration-200`}
        />
      </div>
    )
  )

  const handlePlayClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      togglePlay()
    },
    [togglePlay]
  )

  return (
    <Dialog open={true}>
      <DialogContent className="p-0">
        <div
          ref={containerRef}
          className="absolute w-screen h-screen bg-black overflow-hidden"
          {...touchHandlers}
        >
          <CloseButton onClose={onClose} />

          <video
            ref={videoRef}
            className="absolute w-full h-full object-contain z-10"
            src={info?.media[0]}
            onEnded={() => dispatch({ type: 'SET_PLAYING', payload: false })}
            controls={false}
            playsInline={true} // prevent iOS full screen
            webkit-playsinline="true" // for old iOS WebKit
            x5-playsinline="true" // for X5 kernel
            x5-video-player-type="h5" // enable H5 player
            x5-video-player-fullscreen="false" // full screen handle
            preload="auto" // preload
            x-webkit-airplay="allow" // 允许 AirPlay
          />

          <div
            style={{ display: state.isLoading ? 'flex' : 'none' }}
            className="absolute inset-0 items-center justify-center bg-black/50 z-20"
          >
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>

          <div style={{ display: state.isPlaying || state.isLoading ? 'none' : 'flex' }}>
            <PlayButton onClick={handlePlayClick} />
          </div>

          <div
            className="absolute left-0 right-0 bottom-0 z-10 flex flex-col transition-transform duration-300 ease-out safe-area-bottom"
            style={{
              transform: `translateX(${state.slideOffset}px)`,
            }}
          >
            <UserInfo
              avatar={info?.avatar}
              username={info?.username}
              content={info?.title}
              bottom={bottom}
            />

            <div
              ref={progressBarRef}
              className="absolute bottom-6 left-0 right-0 px-4 touch-none"
              style={{
                paddingBottom: `${bottom + 20}px`,
              }}
              onMouseDown={handleDragStart}
              onMouseMove={(e) => state.isDragging && handleProgressChange(e)}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={handleDragStart}
              onTouchMove={(e) => state.isDragging && handleProgressChange(e)}
              onTouchEnd={handleDragEnd}
            >
              <div className="relative group h-8 -my-2 flex items-center cursor-pointer no-tap">
                <div className="absolute inset-0" />
                <div
                  className={`w-full ${state.isDragging ? 'h-2' : 'h-[1px] group-hover:h-2'}
                      bg-gray-500/30 rounded-full transition-[height] duration-200`}
                >
                  <ProgressDisplay progress={state.progress} isDragging={state.isDragging} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
