import React, { useRef, useEffect, useCallback, useState, memo, useMemo } from 'react'
import { HStack } from '@chakra-ui/react'
import { useSwiperSlide } from 'swiper/react'
import { FormatterListItem } from '@/store/slices/resourceListSlice'
import { useSafeArea } from '@/hooks/useSafeArea'
import ResourceFooter from '@/components/ResourceList/ResourceFooter'
import { createVideoElement, destroyVideo, getDeviceType, isIOS, formatImage } from '@/utils/utils'
import { VideoPlayerProps } from '@/components/TT/VideoPlayer'
import { useProfileNavigation } from '@/hooks/useProfileNavigation'
import { useStore } from '@/store'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { follow, getSomeoneProfile, totalAvailableInvoice } from '@/api'
import { UserItem } from '@/types'
import Image from '@/components/Image/Image'
import { getTimeStringAutoShort } from '@/utils/utils'
import BaseButton from '@/components/BaseButton/BaseButton'
import MoreText from '@/components/More/MoreText'
import PurchaseButton from '@/components/ResourceList/PurchaseButton'
import { ReplayButton, PlayButton, ProgressDisplay } from '@/components/ResourceList/VideoDialog'
import { VolumeMuteIcon, VolumeSpeakerIcon } from '@/assets/icons'
import { videoScale } from '@/utils/video'
import { MP4_REGEX } from '@/utils/constants'

type VideoPlayerPropsAndIndex = VideoPlayerProps & {
  index: number
}

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
      const picUrl = medias.find((item) => !item.endsWith('.m3u8') && !MP4_REGEX.test(item))
      const media = medias.find((item) => MP4_REGEX.test(item))
      if (media) {
        setVideoResource({
          ...info,
          media: [media],
          mediaCover: picUrl ?? '',
          ...options
        } as FormatterListItem)
      }
    }

    return (
      <div
        className="absolute left-4 right-4 z-[100] flex flex-col cursor-pointer no-tap pb-4 "
        style={{
          bottom: 0,
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
                  <span className="ml-[4px] text-white text-[12px] font-[400]">
                    {getTimeStringAutoShort(new Date(created_at).getTime(), true)}
                  </span>
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
        <MoreText textColor={'#fff'} text={content || ''} bgColor={'#000'} onTextClick={onClose} />
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

const VideoPlayer: React.FC<VideoPlayerPropsAndIndex> = (props) => {
  const { sourceItem, setVideoRef, allMuted, setAllMuted, autoplay, activeIndex, index } = props
  const { media, thumbnail: poster } = sourceItem
  const mp4Url = media.find((item) => MP4_REGEX.test(item))
  const info = useStore((state) => state.videoResource)
  const swiperSlide = useSwiperSlide()

  const containerDomRef = useRef<HTMLDivElement | null>(null)
  const videoWrapperRef = useRef<HTMLDivElement | null>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>()
  const [duration, setDuration] = useState(0)
  const [progress, setProgress] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [ended, setEnded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const setTtVideoMuted = useStore((state) => state.setTtVideoMuted)
  const ttVideoMuted = useStore((state) => state.ttVideoMuted)
  const [showLoader, setShowLoader] = useState(false)

  const { bottom } = useSafeArea()
  const [showThumbnail, setShowThumbnail] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const imageScale = useMemo(() => {
    if (sourceItem?.width && sourceItem?.height) {
      const ratio = +sourceItem.width / +sourceItem.height;
      return ratio > 1 ? 'object-contain' : 'object-cover';
    }
    return 'object-contain'; // 默认使用 contain
  }, [sourceItem?.width, sourceItem?.height]);

  const scale = useMemo(() => {
    console.log(sourceItem, containerDomRef.current, 'jacob===========')
    if (containerDomRef && containerDomRef.current && sourceItem) {
      return videoScale({ ...sourceItem }, containerDomRef.current)
    }
    return 'object-contain'
  }, [containerDomRef, containerDomRef.current, sourceItem])
  const videoPlayerInit = () => {
    const videoElement = createVideoElement()
    videoElement.controls = false
    videoElement.loop = true
    videoElement.style.width = '100%'
    videoElement.style.height = '100%'
    videoElement.style.top = '0'
    videoElement.style.left = '0'
    videoElement.style.zIndex = '99'
    videoElement.src = mp4Url
    videoElement.className = scale
    console.log(scale, 'jacob===========')

    setShowThumbnail(true)
    videoElement.addEventListener('timeupdate', () => {
      if (videoElement.duration) {
        const currentProgress = (videoElement.currentTime / videoElement.duration) * 100
        setProgress(currentProgress)
        setDuration(videoElement.duration)
      }
    })
    videoElement.addEventListener('pause', () => {
      console.log('Video paused')
      setPlaying(false)
    })

    videoElement.addEventListener('play', () => {
      console.log('Video playing')
      setPlaying(true)
    })

    videoElement.addEventListener('waiting', () => {
      setIsLoading(true)
      setShowThumbnail(true)
    })

    videoElement.addEventListener('playing', () => {
      setIsLoading(false)
      setShowThumbnail(false)
    })

    videoElement.addEventListener('ended', () => {
      setPlaying(false)
      setEnded(true)
    })

    videoElement.addEventListener('loadedmetadata', (e: any) => {
      if (e.target.duration !== undefined) {
        setDuration(e.target.duration)
      }
    })

    videoRef.current = videoElement
    if (videoRef.current) {
      videoRef.current.muted = ttVideoMuted
    }

    if (videoRef.current && videoRef.current.paused) {
      videoRef.current?.play()
    }

    const videoWrapperEl = videoWrapperRef.current
    console.log(videoWrapperEl, 'jacob===============videoWrapperEl')
    if (videoWrapperEl) {
      videoWrapperEl.appendChild(videoElement)
      videoElement.play()
    }
  }

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = ttVideoMuted
    }
  }, [ttVideoMuted])

  useEffect(() => {
    // const video = videoRef.current
    if (isLoading) {
      const timer = setTimeout(() => setShowLoader(true), 500)
      return () => clearTimeout(timer)
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

  const handleClose = useCallback(() => {}, [])

  useEffect(() => {
    if (swiperSlide.isVisible && index === activeIndex) {
      videoPlayerInit()
      window.videoElement.play()
    }
    return () => {
      if (videoRef.current) {
        // videoRef.current.pause()
        videoRef.current.removeEventListener('timeupdate', () => {})
        videoRef.current.removeEventListener('pause', () => {})
        videoRef.current.removeEventListener('play', () => {})
        videoRef.current.removeEventListener('waiting', () => {})
        videoRef.current.removeEventListener('playing', () => {})
        videoRef.current.removeEventListener('ended', () => {})
        videoRef.current.removeEventListener('loadedmetadata', () => {})
      }
    }
  }, [swiperSlide.isVisible, index, activeIndex])
  const showId = useMemo(() => {
    return swiperSlide.isVisible && index === activeIndex
  }, [swiperSlide.isVisible, index, activeIndex])

  return (
    <div
      className="fixed w-full h-full object-contain z-10 bg-black inset-0 flex flex-col"
      ref={containerDomRef}
    >
      <div className="relative" style={{ height: '89vh' }} ref={videoWrapperRef}>
        <img
          style={{
            // display: showThumbnail ? 'block' : 'none',
            opacity: showThumbnail ? 1 : 0,
            transition: 'opacity 1s ease',
          }}
          src={poster ? formatImage(poster) : ''}
          className={`w-full h-full z-[11] top-0 left-0 right-0 bottom-0 absolute ${imageScale}`}
          alt=""
        />
        {showLoader && (
            <div className="absolute z-[18] inset-0 flex items-center justify-center bg-black/50">
              <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        )}
        <div
          className="top-0 left-0 right-0 z-[12] absolute w-full h-full bg-video-gradient"
          onClick={togglePlay}
        ></div>
        {!isLoading && !playing ? (
          info?.price && !info?.is_pay && ended ? (
            <ReplayButton onClick={togglePlay} />
          ) : (
            <PlayButton onClick={togglePlay} />
          )
        ) : null}
        <div
          ref={progressBarRef}
          className="absolute bottom-[-6px] left-0 right-0 touch-none z-[100]"
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
          id={sourceItem?.id}
          avatar={sourceItem?.avatar}
          username={sourceItem?.username}
          content={sourceItem?.title}
          uid={sourceItem?.uid}
          info={sourceItem}
          bottom={bottom}
          is_follow={sourceItem?.is_follow}
          created_at={sourceItem?.created_at}
          onClose={handleClose}
        />
        <HStack
          position="absolute"
          bottom={'15vh'}
          right="16px"
          p="5px"
          gap="4px"
          rounded="full"
          zIndex={101}
          bg="rgba(0,0,0,0.4)"
          cursor="pointer"
          onClick={() => {
            setTtVideoMuted(!ttVideoMuted)
          }}
        >
          {ttVideoMuted ? (
            <Image src={VolumeMuteIcon} className="w-[22px] h-[22px] text-white" />
          ) : (
            <Image src={VolumeSpeakerIcon} className="w-[22px] h-[22px] text-white" />
          )}
        </HStack>
      </div>
      <div className="pt-3" style={{ height: '11vh', width: '100%' }}>
        <ResourceFooter data={sourceItem}></ResourceFooter>
      </div>
    </div>
  )
}

export default VideoPlayer
